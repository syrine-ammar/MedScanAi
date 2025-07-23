# MedScanAi
# 🧠 Medical Image Segmentation Platform

A full-stack web application for **segmentation of medical images**, built using **React** for the frontend and **Flask** for the backend. The app allows doctors to register/login, manage patient data, upload and segment medical images using a deep learning model, and optionally export  and save or visualize 3d results.

---

## 📸 Screenshots

### 🔐 Login Page
![Login Screenshot](docs/screens/login.png)

### 📋 Dashboard
![Dashboard Screenshot](docs/screens/dashboard.png)

### 🧬 Segmentation Results
![Segmented Result](docs/screens/segmentation.png)

---

## 🛠️ Features

- Doctor/Admin authentication & profile management
- Add/Edit/Delete patients
- Upload multiple input images per patient
- Segment images using a pre-trained Keras model
- Save results & export as zip/PDF
- Interactive 3D model preview
- MongoDB integration with Flask backend
- Protected APIs with CORS enabled

---

## 🧱 Tech Stack

| Frontend        | Backend      | AI/ML            | DB       |
|-----------------|--------------|------------------|----------|
| React.js        | Flask (Python) | TensorFlow / Keras | MongoDB |

---

## 📦 Folder Structure

```
MedScanAi/
├── client/          # React frontend
├── server/          # Flask backend
│   ├── models/      # Model architecture/weights (JSON + H5 files)
├── docs/screens/    # Screenshots for README or documentation
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. 📥 Clone the Repository

```bash
git clone https://github.com/syrine-ammar/MedScanAi.git
cd MedScanAi
```

---

### 2. 🔙 Backend Setup (Flask)

Navigate to the `server/` directory:

```bash
cd server
```

📦 Install backend dependencies:

```bash
pip install -r requirements.txt
```

Make sure the following Python libraries are installed:

```text
Flask
Flask-Cors
Flask-PyMongo
pillow
tensorflow==2.15.0
numpy==1.26.4
opencv-python
trimesh
```

▶️ Run Flask server:

```bash
python app.py
```

By default, it runs at: [http://localhost:5000](http://localhost:5000)

---

### 3. 🧩 Frontend Setup (React)

Navigate to the `client/` directory:

```bash
cd ../client
```

📦 Install frontend dependencies:

```bash
npm install
```
```bash
npm install react-router-dom axios jszip file-saver jspdf three
```

Ensure your `package.json` includes the following dependencies:

```json
"dependencies": {
  "axios": "^1.6.0",
  "jszip": "^3.10.0",
  "file-saver": "^2.0.5",
  "react-router-dom": "^6.14.1",
  "three": "^0.157.0"
}
```

▶️ Run React app:

```bash
npm start
```

By default, it runs at: [http://localhost:3000](http://localhost:3000)

---

### 🧠 Model Files

Ensure you have the following model files inside the `server/models/` directory:

```
test_architecture.json
test_best_weights.h5
```

These files should match the architecture  trained ( U-Net ).

 #you should have tensorflow v2.15.0 to run this type of model
---

### 🌐 Environment Notes

- MongoDB must be running locally at: `mongodb://localhost:27017/myDatabase`
- 8.0 mongo version 
- ✅ Python version: **>= 3.8**
- ✅ Node.js version: **>= 16**




  ## 🧰 MongoDB Setup 

This project uses **MongoDB** as its database. Follow these steps if you're new:

### 🔧 1. Install MongoDB Community Edition

- Download: https://www.mongodb.com/try/download/community
- Install and leave all default settings.
- MongoDB will run locally at: `mongodb://localhost:27017`

---

### 📊 2. Install MongoDB Compass (Optional UI)

MongoDB Compass is a visual GUI to explore and manage your database.

- Download: https://www.mongodb.com/try/download/compass
- After installing, open Compass and connect to:

```
mongodb://localhost:27017
```

You can visually browse your collections (`doctors`, `patients`, etc.).

### ▶️ 3. Run MongoDB

MongoDB typically runs automatically as a background service. To ensure it's running:

- On **Windows**:
  - Open Command Prompt  go to where you installed monoDB server/bin:
  
  -  run:
    ```bash
    mongod
    ```
### 🧪 Test Your MongoDB Connection


in compass shell:
You should enter the Mongo shell. To view databases:

```bash
show dbs
```

---

### 🛠 Example: Creating the Project Database

Once MongoDB is running, the Flask app will automatically use:

```
mongodb://localhost:27017/myDatabase
```

You don't need to create `myDatabase` manually — it will be created when the app runs and stores data (doctors/patients).

---

✅ **You're now ready to run the Flask and React apps with MongoDB support!**



---
# 📬 Configuration de l'envoi d'e-mails - MedScan AI

Ce projet permet à un super administrateur d'envoyer par e-mail les identifiants d'accès à chaque nouvel administrateur via le serveur SMTP de Gmail.

---

## ✉️ Étapes de configuration de l’envoi d’e-mails via Gmail

###  1. Activer la validation en deux étapes (2FA) sur votre compte Google

1. Rendez-vous sur : [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Dans la section **Connexion à Google**, cliquez sur **Validation en deux étapes**.
3. Activez la 2FA si ce n’est pas déjà fait.

---

### 🛠 2. Générer un mot de passe d’application

1. Allez sur : [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Dans **Sélectionner l’application**, choisissez `Autre (personnalisée)` et nommez-la `MedScan AI Mail`.
3. Cliquez sur **Générer**.
4. Copiez le mot de passe à 16 caractères généré et **gardez-le précieusement**.

---

###  3. Créer un fichier `.env`

À la racine du projet Flask, créez un fichier `.env` :

```env
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=mot_de_passe_application de 16 caractères

```



👨‍💻 Author
Made with ❤️ by Syrine Ammar
GitHub Profile
