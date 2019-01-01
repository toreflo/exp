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

exports.newGroupMessage = functions.database.ref('/messages/groups/{groupKey}/{messageKey}')
  .onCreate((snapshot, context) => {
    const message = snapshot.val();
    const { groupKey } = context.params;
    // console.log('New message on', context.params.groupKey, context.params.messageKey, message);
    return admin.database().ref(`/groups/${groupKey}/users`).once('value')
      .then((groupUsers) => {
        const promises = [];
        groupUsers.forEach((user) => {
          const { key: userKey} = user;
          promises.push(admin.database().ref(`/users/${userKey}/`).once('value'));
          // console.log('1) >>>', userKey)
        })
        return Promise.all(promises);
      })
      .then((users) => {
        const updates = {};
        let doUpdate = false;
        users.forEach((userSnapshot) => {
          const user = userSnapshot.val();
          // console.log('2) >>>', userSnapshot.key, user.name, user.groups)
          if (!user.groups) return;

          const groupMessageInfo = user.groups[groupKey];
          // console.log('3) >>>', userSnapshot.key, message.createdAt, groupMessageInfo.lastMessageRead)
          if (message.createdAt <= groupMessageInfo.lastMessageRead) return;

          // console.log('4) >>>', userSnapshot.key, groupMessageInfo.unread)
          doUpdate = true;
          updates[`/users/${userSnapshot.key}/groups/${groupKey}/unread`] = groupMessageInfo.unread + 1; 
        });
        // console.log('5) >>>', updates)
        if (!doUpdate) return null;
        
        return admin.database().ref().update(updates);
      })
      // .then(() => console.log('END'))
  });