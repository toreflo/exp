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
      board: {
        lastMessageRead: 0,
        unread: 0,
      }
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

const deleteGroupImages = (groupKey, start) => new Promise((resolve, reject) => {
  let deleteCount = 0;
  admin.database().ref(`/images/groups/${groupKey}`).once('value')
    .then((images) => {
      const updates = {};
      const promises = [];
      images.forEach((image) => {
        if (image.val() < start) {
          deleteCount++;
          const path = `/images/groups/${groupKey}/${image.key}`;
          updates[path] = null;
          promises.push(admin.storage().bucket().file(path).delete());
        };
      });
      if (deleteCount === 0) return resolve(0);

      promises.push(admin.database().ref().update(updates))
      Promise.all(promises)
        .then(() => resolve(deleteCount))
        .catch(error => reject(error));
    })
    .catch(error => reject(error));
})

const deleteOldImages =  (req, res) => {
  const { idToken, interval } = req.body;
  const timeStart = Date.now() - (interval * 1000);
  
  // admin.database().ref(`/groups`).once('value')
  admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => admin.database().ref('/admins/' + decodedToken.uid).once('value'))
    .then((snapshot) => {
      if (!snapshot || !snapshot.val() || !snapshot.val().admin) {
        throw new Error(`Non hai i privilegi per eliminare utenti!`);
      }
      return admin.database().ref(`/groups`).once('value');
    })
    .then((groups) => {
      const promises = [];
      groups.forEach(({ key }) => {
        promises.push(deleteGroupImages(key, timeStart));
      })
      return Promise.all(promises);
    })
    .then((count) => {
      res.send({
        message: `Done (deleted: ${count.reduce((cnt, item) => cnt + item, 0)})`
      });
    })
    .catch((error) => res.status(500).send({
      error: true,
      message: error.message,
    }));
}

exports.httpRequests = functions.https.onRequest((req, res) => {
  if (req.body.type === 'createUser') return createUser(req, res);
  if (req.body.type === 'deleteUser') return deleteUser(req, res);
  if (req.body.type === 'deleteOldImages') return deleteOldImages(req, res);
  res.status(500).send({ error: true, message: 'Invalid operation type' });
});

exports.newGroupMessage = functions.database.ref('/messages/groups/{groupKey}/{messageKey}')
  .onCreate((snapshot, context) => {
    const message = snapshot.val();
    const { groupKey } = context.params;
    return admin.database().ref(`/groups/${groupKey}/users`).once('value')
      .then((groupUsers) => {
        const promises = [];
        groupUsers.forEach((user) => {
          const { key: userKey} = user;
          promises.push(admin.database().ref(`/users/${userKey}/`).once('value'));
        })
        return Promise.all(promises);
      })
      .then((users) => {
        const updates = {};
        let doUpdate = false;
        users.forEach((userSnapshot) => {
          const user = userSnapshot.val();
          if (!user.groups) return;

          const groupMessageInfo = user.groups[groupKey];
          if (message.createdAt <= groupMessageInfo.lastMessageRead) return;

          doUpdate = true;
          updates[`/users/${userSnapshot.key}/groups/${groupKey}/unread`] = groupMessageInfo.unread + 1; 
        });
        if (!doUpdate) return null;
        
        return admin.database().ref().update(updates);
      })
  });

  exports.newBoardMessage = functions.database.ref('/messages/board/{messageKey}')
  .onCreate((snapshot) => {
    const message = snapshot.val();
    return admin.database().ref(`/users`).once('value')
      .then((users) => {
        let doUpdate = false;
        const updates = {};
        users.forEach((user) => {
          const { key: userKey} = user;
          const { board } = user.val();
          if (message.creationTime <= board.lastMessageRead) return;

          doUpdate = true;
          updates[`/users/${userKey}/board/unread`] = board.unread + 1; 
        })
        if (!doUpdate) return null;

        return admin.database().ref().update(updates);
      })
  });