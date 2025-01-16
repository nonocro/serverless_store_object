require('dotenv').config();
const express = require('express');
const multer = require('multer');
const Minio = require('minio');
const fs = require('fs');

const app = express();
const port = 3000;

// Initialiser le client MinIO
const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

const bucketName = process.env.MINIO_BUCKET;

// Vérifier si le bucket existe, sinon le créer
const exists = minioClient.bucketExists(bucketName)

if(!exists)
    minioClient.makeBucket(bucketName)

// Configuration de Multer pour l'upload de fichiers
const upload = multer({ dest: 'uploads/' });

// Route d'upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {  

        if (!req.file) {
            return res.status(400).send('No file was uploaded.');
        }
        // Upload the file to MinIO. req.file.path is the temporary file path created by multer
        await minioClient.fPutObject(bucketName, req.file.originalname, req.file.path);
  
        return res.status(200).send('File uploaded successfully.');
    } catch (error) {
        console.error('Error uploading file to MinIO:', error);
        return res.status(500).send('Error uploading file to MinIO.');
    }
  });

// Route de téléchargement
app.get('/download/:filename', async (req, res) => {
    try {
        // Get the object stream from MinIO
        const fileStream = await minioClient.getObject(bucketName, req.params.filename);
    
        // Pipe the file directly to the response
        fileStream.on('data', (chunk) => {
          res.write(chunk);
        });
        
        // End the response once the stream is finished
        fileStream.on('end', () => {
          res.end();
        });
    
        // Handle any errors that occur
        fileStream.on('error', (err) => {
          console.error('Error streaming file from MinIO:', err);
          res.status(500).send('Error retrieving the file.');
        });
    
      } catch (error) {
        console.error('Error retrieving file from MinIO:', error);
        res.status(500).send('Could not retrieve file.');
      }
    
});

// Route de suppression
app.delete('/delete/:filename', (req, res) => {
    minioClient.removeObject(bucketName, req.params.filename)

    return res.status(200).send('OK')
});

// Lancer le serveur
app.listen(port, () => {
    console.log(`API démarrée sur http://localhost:${port}`);
});
