import firebase from 'firebase';

exports.checkCollection = (path) => new Promise((resolve, reject) => {
  firebase.database().ref(path).limitToLast(1).once('value')
    .then((snapshot) => {
      if (snapshot.val()) {
        return resolve();
      }
      console.log('Creating', path)
      return firebase.database().ref(path).push({
        exists: true,
      });
    })
    .then(() => resolve())
    .catch(err => reject(err));
});
