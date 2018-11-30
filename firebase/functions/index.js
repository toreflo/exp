// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

exports.handleNewUser = functions.auth.user().onCreate((user) => {
  const db = admin.database();

  console.log('New user:', JSON.stringify(user));
});

exports.createUser = functions.https.onRequest((req, res) => {
  const { name, surname, email, password } = req.body;
  let found = false;
  
  admin.database().ref('/users/').once('value')
    .then((snapshot) => {
      snapshot.forEach((user) => {
        if (user.val().email === email) {
          found = true;
          return;
        }
      });
      if (found) {
        throw new Error(`L'utente ${email} esiste già!`);
      }
      const key = admin.database().ref('/users/').push().key;
      return admin.database().ref('/users/').child(key).set({
        name,
        surname,
        email,
        password,
      })  
    })
    .then(() => res.send({ message: `Creato utente ${email}!` }))
    .catch((error) => {
      res.status(500).send({
        error: true,
        message: error.message,
      });
    });
});
