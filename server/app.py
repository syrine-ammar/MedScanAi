from flask import Flask, request, jsonify , send_file
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import tensorflow as tf
from PIL import Image
import numpy as np
import io
import cv2
import base64

import os

from datetime import datetime
from tensorflow.keras.models import model_from_json
from bson.objectid import ObjectId

import requests


from pymongo import MongoClient
import trimesh
from bson import ObjectId


app = Flask(__name__)
CORS(app)

app.config["MONGO_URI"] = "mongodb://localhost:27017/myDatabase"
mongo = PyMongo(app)  # Initialize PyMongo here
#bcrypt = Bcrypt(app)

# --- Load  model ---
model = model_from_json(open('models/test_architecture.json').read())
model.load_weights('models/test_best_weights.h5')

# ---  preprocessing and helper functions here ---
def rgb2gray(rgb):
    bn_imgs = rgb[:,0,:,:]*0.299 + rgb[:,1,:,:]*0.587 + rgb[:,2,:,:]*0.114
    return bn_imgs.reshape((rgb.shape[0], 1, rgb.shape[2], rgb.shape[3]))

def dataset_normalized(imgs):
    imgs_std = np.std(imgs)
    imgs_mean = np.mean(imgs)
    imgs_normalized = (imgs-imgs_mean)/imgs_std
    for i in range(imgs.shape[0]):
        imgs_normalized[i] = ((imgs_normalized[i] - np.min(imgs_normalized[i])) / (np.max(imgs_normalized[i])-np.min(imgs_normalized[i])))*255
    return imgs_normalized

def clahe_equalized(imgs):
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    imgs_equalized = np.empty(imgs.shape)
    for i in range(imgs.shape[0]):
        imgs_equalized[i,0] = clahe.apply(np.array(imgs[i,0], dtype=np.uint8))
    return imgs_equalized

def adjust_gamma(imgs, gamma):
    invGamma = 1.0 / gamma
    table = np.array([((i / 255.0) ** invGamma) * 255 for i in np.arange(256)]).astype("uint8")
    new_imgs = np.empty(imgs.shape)
    for i in range(imgs.shape[0]):
        new_imgs[i,0] = cv2.LUT(np.array(imgs[i,0], dtype=np.uint8), table)
    return new_imgs

def my_PreProc(data):
    train_imgs = rgb2gray(data)
    train_imgs = dataset_normalized(train_imgs)
    train_imgs = clahe_equalized(train_imgs)
    train_imgs = adjust_gamma(train_imgs, 1.2)
    return train_imgs / 255.

def paint_border_overlap(full_imgs, patch_h, patch_w, stride_h, stride_w):
    img_h = full_imgs.shape[2]
    img_w = full_imgs.shape[3]
    leftover_h = (img_h - patch_h) % stride_h
    leftover_w = (img_w - patch_w) % stride_w
    if leftover_h != 0:
        tmp = np.zeros((full_imgs.shape[0], full_imgs.shape[1], img_h + (stride_h - leftover_h), img_w))
        tmp[:, :, :img_h, :img_w] = full_imgs
        full_imgs = tmp
    if leftover_w != 0:
        tmp = np.zeros((full_imgs.shape[0], full_imgs.shape[1], full_imgs.shape[2], img_w + (stride_w - leftover_w)))
        tmp[:, :, :, :img_w] = full_imgs
        full_imgs = tmp
    return full_imgs

def extract_ordered_overlap(full_imgs, patch_h, patch_w, stride_h, stride_w):
    img_h = full_imgs.shape[2]
    img_w = full_imgs.shape[3]
    N_patches_img = ((img_h - patch_h) // stride_h + 1) * ((img_w - patch_w) // stride_w + 1)
    N_patches_tot = N_patches_img * full_imgs.shape[0]
    patches = np.empty((N_patches_tot, full_imgs.shape[1], patch_h, patch_w))
    iter_tot = 0
    for i in range(full_imgs.shape[0]):
        for h in range((img_h - patch_h) // stride_h + 1):
            for w in range((img_w - patch_w) // stride_w + 1):
                patch = full_imgs[i, :, h*stride_h:h*stride_h+patch_h, w*stride_w:w*stride_w+patch_w]
                patches[iter_tot] = patch
                iter_tot += 1
    return patches

def recompone_overlap(preds, img_h, img_w, stride_h, stride_w):
    patch_h = preds.shape[2]
    patch_w = preds.shape[3]
    N_patches_h = (img_h - patch_h) // stride_h + 1
    N_patches_w = (img_w - patch_w) // stride_w + 1
    N_full_imgs = preds.shape[0] // (N_patches_h * N_patches_w)
    full_prob = np.zeros((N_full_imgs, preds.shape[1], img_h, img_w))
    full_sum = np.zeros((N_full_imgs, preds.shape[1], img_h, img_w))
    k = 0
    for i in range(N_full_imgs):
        for h in range(N_patches_h):
            for w in range(N_patches_w):
                full_prob[i, :, h*stride_h:h*stride_h+patch_h, w*stride_w:w*stride_w+patch_w] += preds[k]
                full_sum[i, :, h*stride_h:h*stride_h+patch_h, w*stride_w:w*stride_w+patch_w] += 1
                k += 1
    return full_prob / full_sum

def pred_to_imgs(pred, patch_height, patch_width, mode="original"):
    pred_images = np.empty((pred.shape[0], pred.shape[1]))
    for i in range(pred.shape[0]):
        for pix in range(pred.shape[1]):
            if mode == "original":
                pred_images[i, pix] = pred[i, pix, 1]
            elif mode == "threshold":
                pred_images[i, pix] = 1 if pred[i, pix, 1] >= 0.5 else 0
    return pred_images.reshape((pred.shape[0], 1, patch_height, patch_width))

def segment_image_bytes(image_bytes):
    patch_h, patch_w, stride = 48, 48, 5
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((256, 256))
    np_img = np.array(pil_img).reshape((1, 256, 256, 3))
    np_img = np.transpose(np_img, (0, 3, 1, 2))  # [1, 3, H, W]
    preproc_img = my_PreProc(np_img)

    padded = paint_border_overlap(preproc_img, patch_h, patch_w, stride, stride)
    patches = extract_ordered_overlap(padded, patch_h, patch_w, stride, stride)

    preds = model.predict(patches, batch_size=1, verbose=0)
    pred_patches = pred_to_imgs(preds, patch_h, patch_w)
    pred_imgs = recompone_overlap(pred_patches, padded.shape[2], padded.shape[3], stride, stride)

    output_img = (pred_imgs[0, 0, 0:256, 0:256] * 255).astype(np.uint8)
    pil_output = Image.fromarray(output_img)

    buffered = io.BytesIO()
    pil_output.save(buffered, format="PNG")
    encoded = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return encoded

@app.route('/api/segment', methods=['POST'])
def segment():
    if 'images' not in request.files:
        return jsonify({'error': 'No images part in the request'}), 400

    files = request.files.getlist('images')
    segmented_images = []

    for file in files:
        img_bytes = file.read()
        encoded_img = segment_image_bytes(img_bytes)
        segmented_images.append(encoded_img)

    return jsonify({'segmented_images': segmented_images}), 200





@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not all(key in data for key in ['email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    if mongo.db.doctors.find_one({"email": data['email']}) or mongo.db.admins.find_one({"email": data['email']}):
        return jsonify({'error': 'Email already exists'}), 400
    new_user = {
        "email": data.get('email'),
        "password": data.get('password'),  # Plain text
        "nom": data.get('nom', ''),
        "prenom": data.get('prenom', ''),
        "affiliation": data.get('affiliation', ''),
        "telephone": data.get('telephone', ''),
        "titre": data.get('titre', ''),
        "specialite": data.get('specialite', ''),
        "approved": False,
        "role": "doctor"
    }
    result = mongo.db.doctors.insert_one(new_user)
    return jsonify({'message': 'Registration successful, awaiting admin approval', 'id': str(result.inserted_id)}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not all(key in data for key in ['email', 'password']):
        return jsonify({'message': 'Missing email or password'}), 400
    user = mongo.db.doctors.find_one({"email": data['email']})
    if user and user['password'] == data['password']:  # Plain text comparison
        if not user.get('approved', False):
            return jsonify({'message': 'Account not approved yet'}), 403
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': str(user['_id']),
                'role': 'doctor',
                'nom': user.get('nom', ''),
                'prenom': user.get('prenom', ''),
                'email': user.get('email', ''),
                'affiliation': user.get('affiliation', ''),
                'telephone': user.get('telephone', ''),
                'titre': user.get('titre', ''),
                'specialite': user.get('specialite', '')
            }
        }), 200

    return jsonify({'message': 'Invalid credentials'}), 401


@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    if not data or not all(key in data for key in ['email', 'password']):
        return jsonify({'message': 'Missing email or password'}), 400
    user = mongo.db.admins.find_one({"email": data['email']})
    if user and user['password'] == data['password']:
        return jsonify({
            'message': 'Login successful',
            'role': 'admin',
            'id': str(user['_id']),
            'email': user.get('email', '')
        }), 200
    return jsonify({'message': 'Invalid credentials'}), 401



#list des admin
@app.route('/api/admins', methods=['GET'])
def get_admins():
    admins = list(mongo.db.admins.find({'role': 'admin'}))
    for admin in admins:
        admin['_id'] = str(admin['_id'])  # Convert ObjectId to string
    return jsonify(admins), 200

#edit admin 
@app.route('/api/admins/<admin_id>', methods=['PUT'])
def update_admin(admin_id):
    data = request.get_json()
    update_fields = {}

    if 'email' in data:
        update_fields['email'] = data['email']
    if 'password' in data:
        update_fields['password'] = data['password']

    if not update_fields:
        return jsonify({'message': 'Nothing to update'}), 400

    result = mongo.db.admins.update_one(
        {'_id': ObjectId(admin_id)},
        {'$set': update_fields}
    )

    if result.matched_count == 0:
        return jsonify({'message': 'Admin not found'}), 404

    return jsonify({'message': 'Admin updated successfully'}), 200

#delete admin:

@app.route('/api/admins/<admin_id>', methods=['DELETE'])
def delete_admin(admin_id):
    result = mongo.db.admins.delete_one({'_id': ObjectId(admin_id)})

    if result.deleted_count == 0:
        return jsonify({'message': 'Admin not found'}), 404

    return jsonify({'message': 'Admin deleted successfully'}), 200


# Send email

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(to_email, password):
    from_email = os.getenv('MAIL_USER')
    app_password = os.getenv('MAIL_PASSWORD')

    if not from_email or not app_password:
        raise Exception("Missing email credentials in environment")

    subject = " Accès administrateur MedScan AI"
    body = f"""
        Bonjour,

        Voici vos informations d'accès administrateur :

        🔑 Email : {to_email}
        🔒 Mot de passe : {password}

        Veuillez les conserver en lieu sûr.

        -- MedScan AI
    """

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = to_email

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(from_email, app_password)
        server.sendmail(from_email, [to_email], msg.as_string())

@app.route('/api/send_admin_credentials', methods=['POST'])
def send_admin_credentials():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Email and password are required'}), 400

    try:
        send_email(data['email'], data['password'])
        return jsonify({'message': '✅ Email sent successfully'}), 200
    except Exception as e:
        return jsonify({'message': f' Failed to send email: {str(e)}'}), 500



#adding admins




@app.route('/api/create_admin', methods=['POST'])
def create_admin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    if mongo.db.admins.find_one({'email': email}):
        return jsonify({'message': 'Admin with this email already exists'}), 400

    admin_data = {
        'email': email,
        'password': password,
        'role': 'admin',  
    }

    inserted = mongo.db.admins.insert_one(admin_data)

    return jsonify({'message': 'Admin created successfully', 'id': str(inserted.inserted_id)}), 201







# Routes gestion doctors 
@app.route('/api/admin/doctors', methods=['GET'])
def get_doctors():
    doctors = list(mongo.db.doctors.find())
    return jsonify([{
        'id': str(d['_id']),
        'email': d['email'],
        'nom': d.get('nom', ''),
        'prenom': d.get('prenom', ''),
        'affiliation': d.get('affiliation', ''),
        'telephone': d.get('telephone', ''),
        'titre': d.get('titre', ''),
        'specialite': d.get('specialite', ''),
        'approved': d.get('approved', False)
    } for d in doctors]), 200

@app.route('/api/admin/doctors/<doctor_id>', methods=['PUT'])
def update_doctor(doctor_id):
    data = request.get_json()
    mongo.db.doctors.update_one({"_id": ObjectId(doctor_id)}, {"$set": {
        "nom": data.get('nom'),
        "prenom": data.get('prenom'),
        "affiliation": data.get('affiliation'),
        "telephone": data.get('telephone'),
        "titre": data.get('titre'),
        "specialite": data.get('specialite'),
        "password": data.get('password', '')  # No hashing for now
    }})
    return jsonify({'message': 'Doctor updated'}), 200

@app.route('/api/admin/approve/<doctor_id>', methods=['PUT'])
def approve_doctor(doctor_id):
    mongo.db.doctors.update_one({"_id": ObjectId(doctor_id)}, {"$set": {"approved": True}})
    return jsonify({'message': 'Doctor approved'}), 200

@app.route('/api/admin/reject/<doctor_id>', methods=['PUT'])
def reject_doctor(doctor_id):
    mongo.db.doctors.update_one({"_id": ObjectId(doctor_id)}, {"$set": {"approved": False}})
    return jsonify({'message': 'Doctor rejected  and ready to be removed'}), 200

@app.route('/api/admin/doctors/<doctor_id>', methods=['DELETE'])
def delete_doctor(doctor_id):
    mongo.db.doctors.delete_one({"_id": ObjectId(doctor_id)})
    return jsonify({'message': 'Doctor deleted'}), 200





# add patient
@app.route('/api/patients/create', methods=['POST'])
def create_patient():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    patient = {
        'nom': data.get('nom', ''),
        'prenom': data.get('prenom', ''),
        'code': data.get('code', ''),
        'num_dossier': data.get('num_dossier', ''),
        'date_de_naissance': data.get('date_de_naissance', ''),
        'autre_infos': data.get('autre_infos', ''),
        'images_input': [],
        'images_output': [],
        'segmented': False,
        'doctor_id': data.get('doctor_id', '')
    }

    try:
        mongo.db.patients.insert_one(patient)
        return jsonify({'message': 'Patient added successfully'}), 201
    except Exception as e:
        return jsonify({'message': 'Server error: ' + str(e)}), 500


#get patients
@app.route('/api/patients', methods=['GET'])
def get_patients():
    doctor_id = request.args.get('doctor_id')
    if not doctor_id:
        return jsonify({'message': 'Missing doctor_id'}), 400

    try:
        patients = list(mongo.db.patients.find({'doctor_id': doctor_id}))
        for p in patients:
            p['_id'] = str(p['_id'])  # Convert ObjectId to string for JSON
        return jsonify(patients)
    except Exception as e:
        return jsonify({'message': f'Error fetching patients: {str(e)}'}), 500

#modifier patient
@app.route('/api/patients/<patient_id>', methods=['PUT'])
def update_patient(patient_id):
    print("🛠️ Received update for patient ID:", patient_id)  # 👈 log ici
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Missing data'}), 400

    try:
        oid = ObjectId(patient_id)
    except Exception:
        return jsonify({'message': 'Invalid patient ID'}), 400

    try:
        update_result = mongo.db.patients.update_one(
            {'_id': oid},
            {'$set': data}
        )
        if update_result.matched_count == 0:
            return jsonify({'message': 'Patient not found'}), 404

        patient = mongo.db.patients.find_one({'_id': oid})
        # Transform ObjectId to string for JSON serialization
        patient['_id'] = str(patient['_id'])
        return jsonify({'message': 'Patient updated successfully', 'patient': patient}), 200

    except Exception as e:
        return jsonify({'message': f'Update error: {str(e)}'}), 500


#get slected patient
@app.route('/api/patients/<patient_id>', methods=['GET'])
def get_patient(patient_id):
    p = mongo.db.patients.find_one({'_id': ObjectId(patient_id)})
    if not p:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({
        '_id': str(p['_id']),
        'nom': p.get('nom', ''),
        'prenom': p.get('prenom', ''),
        'code': p.get('code', ''),
        'num_dossier': p.get('num_dossier', ''),
        'date_de_naissance': p.get('date_de_naissance', ''),
        'autre_infos': p.get('autre_infos', ''),
        'segmented': p.get('segmented', False),
        'image_input': p.get('image_input', ''),
        'image_output': p.get('image_output', ''),
    })

#delete patient:
@app.route('/api/patients/<patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    try:
        result = mongo.db.patients.delete_one({'_id': ObjectId(patient_id)})
        if result.deleted_count:
            return jsonify({'message': 'Patient deleted'}), 200
        else:
            return jsonify({'message': 'Patient not found'}), 404
    except Exception as e:
        return jsonify({'message': f'Delete error: {str(e)}'}), 500
    

#update images when segmetation:

@app.route('/segment/<patient_id>/images', methods=['PUT'])
def save_segmented_images(patient_id):
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Missing data'}), 400

    try:
        result = mongo.db.patients.update_one(
            {'_id': ObjectId(patient_id)},
            {'$set': {
                'images_input': data.get('images_input', []),
                'images_output': data.get('images_output', []),
                'segmented' :data.get('segmented', False)
            }}
        )
        if result.modified_count:
            return jsonify({'message': 'Images saved successfully'}), 200
        else:
            return jsonify({'message': 'No update made'}), 404
    except Exception as e:
        return jsonify({'message': f'Error saving images: {str(e)}'}), 500

    
#changer profile de medecin

@app.route('/api/profile/doctor/<doctor_id>', methods=['PUT'])
def update_doctor_profile(doctor_id):
    data = request.json

    doctor = mongo.db.doctors.find_one({'_id': ObjectId(doctor_id)})
    if not doctor:
        return jsonify({'message': 'Doctor not found'}), 404

    # Check if password change is requested
    if data.get('currentPassword'):
        if doctor.get('password') != data['currentPassword']:
            return jsonify({'message': 'Incorrect current password'}), 400
        if not data.get('newPassword'):
            return jsonify({'message': 'New password is required'}), 400
        data['password'] = data['newPassword']

    # Prepare fields to update
    update_fields = {
        'nom': data.get('nom', doctor.get('nom')),
        'prenom': data.get('prenom', doctor.get('prenom')),
        'affiliation': data.get('affiliation', doctor.get('affiliation')),
        'telephone': data.get('telephone', doctor.get('telephone')),
        'titre': data.get('titre', doctor.get('titre')),
        'specialite': data.get('specialite', doctor.get('specialite')),
        'email': data.get('email', doctor.get('email')),
    }

    if 'password' in data:
        update_fields['password'] = data['password']

    mongo.db.doctors.update_one({'_id': ObjectId(doctor_id)}, {'$set': update_fields})

    return jsonify({'message': 'Doctor profile updated successfully'}), 200



#save data to local desktop

@app.route('/api/export/<patient_id>', methods=['GET'])
def export(patient_id):
    try:
        patient = mongo.db.patients.find_one({"_id": ObjectId(patient_id)})
        if not patient:
            return jsonify({'message': 'Patient not found'}), 404

        return jsonify({
            'images_input': patient.get('images_input', []),
            'images_output': patient.get('images_output', [])
        }), 200

    except Exception as e:
        return jsonify({'message': f'Error during export: {str(e)}'}), 500







#model 3d

# Assuming images stored in database as base64, decode and clean first
def clean_base64_image(base64_str):
    import base64
    img_data = base64.b64decode(base64_str)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)

    # Denoise
    img = cv2.medianBlur(img, 5)
    # Threshold
    _, img_thresh = cv2.threshold(img, 30, 255, cv2.THRESH_BINARY)
    return img_thresh

'''@app.route('/api/visualize/<patient_id>')
def get_cleaned_volume(patient_id):
    # Fetch base64 images from DB here (pseudo-code)
    patient = mongo.db.patients.find_one({"_id": ObjectId(patient_id)})
    base64_images = patient.get('images_output', [])

    volume_slices = []
    for b64 in base64_images:
        img = clean_base64_image(b64)
        volume_slices.append(img)

    # Stack into 3D volume (assuming all images are same size)
    volume = np.stack(volume_slices, axis=-1)  # shape: (height, width, depth)

    # Normalize to 0-1 for marching cubes
    volume = volume / 255.0

    # Extract surface mesh via marching cubes
    verts, faces, normals, values = measure.marching_cubes(volume, level=0.5)

    # Create trimesh mesh and export to file
    mesh = trimesh.Trimesh(vertices=verts, faces=faces)
    output_path = f"./models/{patient_id}.glb"
    mesh.export(output_path)

    return jsonify({"model_url": f"/api/model/{patient_id}"})'''


@app.route('/api/model/<patient_id>')
def serve_model(patient_id):
    path = f"./models/{patient_id}.glb"
    if os.path.exists(path):
        return send_file(path, mimetype='model/gltf-binary')
    else:
        return jsonify({"error": "Model not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)