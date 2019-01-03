import firebase from 'firebase';
import { ImagePicker, ImageManipulator, Permissions, FileSystem } from 'expo';

export const uploadImageAsync = async (uri, ref) => {
  // Why are we using XMLHttpRequest? See:
  // https://github.com/expo/expo/issues/2402#issuecomment-443726662
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      resolve(xhr.response);
    };
    xhr.onerror = function(e) {
      console.log(e);
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  var ref = firebase.storage().ref().child(ref);
  await ref.put(blob);

  blob.close();
}

export const pickFromGallery = async (options, callbackAsync) => {
  const permissions = Permissions.CAMERA_ROLL;
  try {
    const { status } = await Permissions.askAsync(permissions);

    if (status === 'granted') {
      let image = await ImagePicker.launchImageLibraryAsync({
        ...options.imagePicker,
        mediaTypes: 'Images',
      })
      if (!image.cancelled) {
        if (options.imageManipulator) {
          image = await ImageManipulator.manipulateAsync(
            image.uri,
            [...options.imageManipulator],
          );
        }
        await callbackAsync(image);
      }
    }  
  } catch (error) {
    console.log(error)
    alert(`${error.name}: ${error.message}`)
  }
}


export const downloadFile = (firebasePath, name, checkTime = true) => new Promise((resolve, reject) => {
  const ref = firebase.storage().ref().child(firebasePath + '/' + name);
  const filename = getFileUri(name);
  
  Promise.all([FileSystem.getInfoAsync(filename), ref.getMetadata()])
    .then(([localInfo, remoteInfo]) => {
      const remoteTime = new Date(remoteInfo.timeCreated).getTime()/1000
      if (localInfo.exists && ((localInfo.modificationTime >= remoteTime) || !checkTime)) {
        console.log('File', firebasePath + '/' + name, 'is up to date');
        return resolve(filename);
      }
      return ref.getDownloadURL();
    })
    .then((url) => FileSystem.downloadAsync(url, filename))
    .then(({ uri }) => {
      console.log('File', firebasePath + '/' + name, 'downloaded in', FileSystem.documentDirectory);
      return resolve(uri);
    })
    .catch(error => reject(error));
})

export const getFileUri = (name) => FileSystem.documentDirectory + name + '.jpeg'

export const saveFile = async (uri, name) => {
  const to = getFileUri(name);
  await FileSystem.copyAsync({ from: uri, to, });
}
