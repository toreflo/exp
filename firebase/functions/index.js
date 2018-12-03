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
  const { idToken, name, surname, email, password } = req.body;
/*  let found = false;
  
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
      return admin.auth().createUser({
        email,
        emailVerified: false,
        password,
        name,
        surname,
        disabled: false
      })      
    }) */

  admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => admin.database().ref('/users/' + decodedToken.uid).once('value'))
    .then((snapshot) => {
      if (!snapshot || !snapshot.val() || !snapshot.val().admin) {
        throw new Error(`Non hai i privilegi per creare nuovi utenti!`);
      }
      return admin.auth().createUser({
        email,
        emailVerified: false,
        password,
        name,
        surname,
        disabled: false
      });
    })
    .then((userRecord) => admin.database().ref('/users/').child(userRecord.uid).set({
      name,
      surname,
      email,
    }))
    .then(() => res.send({
      message: `Creato utente ${email}!`
      }))
    .catch((error) => res.status(500).send({
      error: true,
      message: error.message,
    }));
});
