// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

const createUser = (req, res) => {
  const { idToken, name, surname, email, password } = req.body;

  admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => admin.database().ref('/admins/' + decodedToken.uid).once('value'))
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
}

const deleteUser = (req, res) => {
  const { idToken, uid } = req.body;

  admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => admin.database().ref('/admins/' + decodedToken.uid).once('value'))
    .then((snapshot) => {
      if (!snapshot || !snapshot.val() || !snapshot.val().admin) {
        throw new Error(`Non hai i privilegi per eliminare utenti!`);
      }
      return admin.auth().deleteUser(uid);
    })
    .then(() => admin.database().ref(`/users/${uid}`).once('value'))
    .then((userSnapshot) => {
      const { groups } = userSnapshot.val();
      let updates = {
        [`/users/${uid}`]: null,
      };
      if (groups) {
        Object.keys(groups).forEach(groupKey => {
          updates[`/groups/${groupKey}/users/${uid}`] = null;
        });
      }
      return admin.database().ref().update(updates);
    })
    // .then(() => admin.database().ref(`/users/${uid}`).set(null))
    .then(() => res.send({
      message: `Eliminato utente ${uid}!`
    }))
    .catch((error) => res.status(500).send({
      error: true,
      message: error.message,
    }));
}

exports.httpRequests = functions.https.onRequest((req, res) => {
  if (req.body.type === 'createUser') return createUser(req, res);
  if (req.body.type === 'deleteUser') return deleteUser(req, res);
});
