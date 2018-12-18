import React, { Component } from "react";
import { Image } from "react-native";
import { Button, Text, Container, Content, Header } from 'native-base';
import { ImagePicker, ImageManipulator, Permissions } from 'expo';
import { connect } from 'react-redux';
import firebase from 'firebase';

import * as actions from '../actions';

const IMAGE_DIM = 140;

class MeScreen extends Component {

  pickFromGallery = async () => {
    const permissions = Permissions.CAMERA_ROLL;
    try {
      const { status } = await Permissions.askAsync(permissions);

      if (status === 'granted') {
        const image = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'Images',
          allowsEditing: true,
          aspect: [1, 1],
        })
        if (!image.cancelled) {
          const resizedImage = await ImageManipulator.manipulateAsync(
            image.uri,
            [{ resize: { width: IMAGE_DIM }}],
          );
          await this.uploadImageAsync(resizedImage.uri); 
          this.props.dispatch(actions.setAvatar(resizedImage.uri));
          alert('Immagine caricata')
        }
      }  
    } catch (error) {
      console.log(error)
      alert(`${error.name}: ${error.message}`)
    }
  }

  uploadImageAsync = async (uri) => {
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
  
    const name = `${this.props.uid}`;
    var ref = firebase.storage().ref().child('/images/' + name);
    await ref.put(blob);

    blob.close();
  }

  render() {
    return (
      <Container>
        <Header/>
        <Content>
          <Text>{JSON.stringify(firebase.auth().currentUser.email)}</Text>
          <Image
            source={{uri: this.props.avatar}}
            style={{
              height: IMAGE_DIM,
              width: IMAGE_DIM,
              borderRadius: IMAGE_DIM/2,
              flex: 1,
            }}
          />
          <Button
            small
            onPress={this.pickFromGallery}
          >
            <Text>Carica avatar</Text>
          </Button>
          <Button
            small
            onPress={() => {
              firebase.auth().signOut()
                .catch((error) => {
                  const { code, message } = error;
                  alert(`${code}: ${message}`)
                });
            }}
          >
            <Text>logout</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  uid: state.info.uid,
  avatar: state.info.avatarUrl,
});

export default connect(mapStateToProps)(MeScreen);
