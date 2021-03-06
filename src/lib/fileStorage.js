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
        if (options.imageManipulatorActions || options.imageManipulatorSaveOptions) {
          image = await ImageManipulator.manipulateAsync(
            image.uri,
            options.imageManipulatorActions,
            options.imageManipulatorSaveOptions,
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


export const downloadFile = (type, firebasePath, name, checkTime = true) => new Promise((resolve, reject) => {
  const ref = firebase.storage().ref().child(firebasePath + '/' + name);
  let filename;
  let remoteTime;

  ref.getMetadata()
    .then((remoteInfo) => {
      remoteTime = new Date(remoteInfo.timeCreated).getTime()/1000;
      if (type === 'groupAvatar') {
        filename = getFileUri(type, name, Number.parseInt(remoteTime));
      } else filename = getFileUri(type, name);
      return FileSystem.getInfoAsync(filename);
    })
    .then((localInfo) => {
      if (localInfo.exists && ((localInfo.modificationTime >= remoteTime) || !checkTime)) {
        console.log('File', firebasePath + '/' + name, 'is up to date');
        return resolve(filename);
      }
      ref.getDownloadURL()
        .then((url) => FileSystem.downloadAsync(url, filename))
        .then(({ uri }) => {
          console.log('File', firebasePath + '/' + name, 'downloaded in', filename);
          return resolve(uri);
        })
        .catch(error => reject(error));
    })
    .catch(error => reject(error));
})

export const saveFile = async (uri, type, name, postfix) => {
  const to = getFileUri(type, name, postfix);
  await FileSystem.copyAsync({ from: uri, to, });

  return to;
}

export const mkdirIfNotExists = async (type) => {
  const dir = FileSystem.documentDirectory + type + 's';
  info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir);
  }
}

const getFileUri = (type, name, postfix) => {
  const dir = FileSystem.documentDirectory + type + 's';
  return dir + '/' + name + (postfix ? '_' + postfix : '') + '.jpeg';
}

