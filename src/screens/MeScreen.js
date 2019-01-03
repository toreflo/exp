import React, { Component } from "react";
import { Image } from "react-native";
import { Button, Text, Container, Content, Header } from 'native-base';
import { connect } from 'react-redux';
import firebase from 'firebase';

import * as actions from '../actions';
import * as fileStorage from '../lib/fileStorage';
import config from '../../config';

const IMAGE_DIM = 140;

class MeScreen extends Component {
  constructor(props) {
    super(props);

    this.upload = this.upload.bind(this);
    this.cleanOldImages = this.cleanOldImages.bind(this);
  }

  upload = async ({ uri }) => {
    await fileStorage.uploadImageAsync(uri, `/avatars/${this.props.uid}`); 
    this.props.dispatch(actions.updateAvatar(this.props.uid, uri));
    alert('Immagine caricata');
  }

  pickFromGallery = async () => {
    await fileStorage.pickFromGallery(
      {
        imagePicker: {
          allowsEditing: true,
          aspect: [1, 1],
        },
        imageManipulator: [{ resize: { width: IMAGE_DIM }}],
      },
      this.upload,
    )
  }

  cleanOldImages() {
    firebase.auth().currentUser.getIdToken(true)
      .then((idToken) => fetch(
        config.httpURL, 
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'deleteOldImages',
            idToken,
            interval: 120,
          }),
        }))
        .then((response) => response.json())
        .then((responseJson) => {
          if (responseJson.error) alert(responseJson.message);
          console.log(responseJson.message)
        })
        .catch((error) => alert(`${error.name}: ${error.message}`));
    }

  render() {
    const adminTools = !this.props.admin ? null : [
      <Image
        key="avatar"
        source={{uri: this.props.avatar}}
        style={{
          height: IMAGE_DIM,
          width: IMAGE_DIM,
          borderRadius: IMAGE_DIM/2,
          flex: 1,
        }}
      />,
      <Button
        key="loadAvatar"
        small
        onPress={this.pickFromGallery}
      >
        <Text>Carica avatar</Text>
      </Button>,
      <Button
        key="cleanOldImages"
        small
        onPress={this.cleanOldImages}
      >
        <Text>Cancella vecchie immagini</Text>
      </Button>
    ];

    return (
      <Container>
        <Header/>
        <Content>
          <Text>{JSON.stringify(firebase.auth().currentUser.email)}</Text>
          {adminTools}
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
  admin: state.info.admin,
  uid: state.info.uid,
  avatar: state.info.avatars[state.info.uid],
});

export default connect(mapStateToProps)(MeScreen);
