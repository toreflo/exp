import firebase from 'firebase';

let subscriptions = [];

export const on = (path, event, callback) => {
  firebase.database().ref(path).on(event, callback);
  subscriptions.push({path, event});
}

export const once = (path, event, callback) => {
  firebase.database().ref(path).once(event, callback);
}

export const unregister = (path, event) => {
  const idx = subscriptions.findIndex(item => (item.path === path) && (item.event === event));
  if (idx !== -1) {
    firebase.database().ref(path).off(event);
    subscriptions = [...subscriptions.slice(0, idx), ...subscriptions.slice(idx + 1)];
  }
}

export const unregisterAll = () => {
  subscriptions.forEach(item => {
    console.log('Unregistering', item.path, item.event, '...');
    firebase.database().ref(item.path).off(item.event);
  });
  subscriptions = [];
}