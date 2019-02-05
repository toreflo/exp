import React, { Component } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { 
  Container,
  Content,
  Fab,
  Left,
  Spinner,
  Text,
  Button,
  Icon,
  Card,
  CardItem,
  Body,
  H1,
} from 'native-base';
import moment from 'moment';
import 'moment/locale/it';
import firebase from 'firebase';
import { connect } from 'react-redux';
import Lightbox from 'react-native-lightbox';
import Dialog from "react-native-dialog";

import * as gbl from '../gbl';
import * as fileStorage from '../lib/fileStorage';

const LIST_PADDING  = 0;  // 15;
const ITEM_PADDING  = 0;  //  5;
const BORDER_RADIUS = 0;  // 10;
const IMAGE_WIDTH = Dimensions.get('window').width - 2 * (LIST_PADDING + ITEM_PADDING);

class BoardScreen extends Component {
  constructor(props) {
    super(props);
    this.state = { fabActive: false };
    this.db = firebase.database();
    this.goToDetails = this.goToDetails.bind(this);
    this.sortMessages = this.sortMessages.bind(this);
    this.togglePinned = this.togglePinned.bind(this);
    this.showIfActive = this.showIfActive.bind(this);
    this.onViewableItemsChanged = this.onViewableItemsChanged.bind(this);
    this.editMessage = this.editMessage.bind(this);
    this.removeMessage = this.removeMessage.bind(this);
    this.deleteImage = this.deleteImage.bind(this);
    this.showConfirmDialog = this.showConfirmDialog.bind(this);
    this.hideConfirmDialog = this.hideConfirmDialog.bind(this);

    this.viewabilityConfig = {
      itemVisiblePercentThreshold: 60,
    };

    this.state = {};
  }

  componentDidMount() {
    this.props.navigation.setParams({title: 'Bacheca'});
  }

  togglePinned(data) {
    this.db.ref().update({['/messages/board/' + data.key + '/pinned/']: !data.pinned})
      .catch((error) => {
        console.log(JSON.stringify(error));
        alert(`${error.name}: ${error.message}`);
      });
  }

  sortMessages(a, b) {
    if (a.pinned === b.pinned) return (b.creationTime - a.creationTime);
    if (a.pinned) return -1;
    return 1;
  }

  goToDetails(message) {
    this.props.navigation.navigate(
      'MessageDetailsScreen',
      { message, admin: this.props.admin },
    );
  }

  navigate(screen) {
    this.setState({ fabActive: false });
    this.props.navigation.navigate(screen);
  }

  upload = async ({ uri }) => {
    const timeNow = Date.now();
    const { key } = firebase.database().ref(`/messages/board/`).push();
    const message = {
      creationTime: firebase.database.ServerValue.TIMESTAMP,
      pinned: false,
      image: key,
    };
    const updates = {
      [`/messages/board/${key}`]: message,
      [`/images/board/${key}`]: timeNow,
    };

    try {
      this.setState({ uploading: true });
      await fileStorage.uploadImageAsync(uri, `/images/board/${key}`); 
      await fileStorage.saveFile(uri, 'image', key);
      await firebase.database().ref().update(updates);
      this.setState({ uploading: false });
    } catch (error) {
      this.setState({ uploading: false });
      alert(`${error.name}: ${error.message}`);
    }
  }

  pickFromGallery = async () => {
    this.setState({ fabActive: false });
    await fileStorage.pickFromGallery({
      imageManipulatorActions: [{ resize: { width: 900 }}],
      imageManipulatorSaveOptions: { compress: 0 },
    }, this.upload);
  }

  showIfActive(component) {
    if (this.state.fabActive) return component;
    return null;
  }

  onViewableItemsChanged(info) {
    const { messages, admin, uid } = this.props;
    if (!admin && (messages.length > 0)) {
      const lastMessageTime = messages.reduce((max, item) => {
        if (item.creationTime > max) return item.creationTime;
        if (item.lastUpdate && (item.lastUpdate > max)) return item.lastUpdate;
        return max;
      }, 0);
      const lastVisible = info.viewableItems.find((item) => (
        item.isViewable
        && ((item.item.creationTime === lastMessageTime)
        ||  (item.item.lastUpdate === lastMessageTime))
      ));
      if (lastVisible) {
        firebase.database().ref().update({
          [`/users/${uid}/board/lastMessageRead`]: lastMessageTime,
          [`/users/${uid}/board/unread`]: 0,
        })
          .catch((error) => alert(`${error.name}: ${error.message}`));  
      }
    }
  }

  showConfirmDialog(data) {
    this.setState({message: data, showConfirm: true});
  }

  hideConfirmDialog() {
    this.setState({message: undefined, showConfirm: false}) 
  }

  renderTextMessage(data) {
    const MAX_LEN = 100;
    const text = data.body.length > MAX_LEN ?
      data.body.substring(0, MAX_LEN) + '...' :
      data.body; 
    return <Text> {text} </Text>
  }

  renderImageMessage(data) {
    if (!this.props.images) return null;
    const imageUri = this.props.images[data.image];
    if (!imageUri) return null;
    
    return (
      <View>
        <Lightbox
          springConfig={{ tension: 100000, friction: 100000 }}
          activeProps={{
            style: {
              flex: 1,
              resizeMode: 'contain',
            },
          }}
        >
          <Image
            source={{ uri: imageUri }}
            style={{
              borderRadius: BORDER_RADIUS,
              width: IMAGE_WIDTH,
              height: IMAGE_WIDTH,
              resizeMode: 'cover',
            }}
          />
        </Lightbox>
      </View>
    );
  }

  renderMessage (data) {
    let body = null;
    if (data.body) body = this.renderTextMessage(data);
    else body =  this.renderImageMessage(data);
    
    const left = [];
    if (this.props.admin && data.body) {
      left.push(
        <Button
          key="edit"
          transparent
          onPress={() => this.editMessage(data)}
        >
          <Icon type="FontAwesome" name="pencil" />
        </Button>
      );
    }
    left.push(
      <Button
        key="delete"
        transparent
        onPress={() => this.showConfirmDialog(data)}
      >
        <Icon type="Ionicons" name="ios-trash" />
      </Button>
    );

    const right = (
      <Button
        transparent
        warning={data.pinned}
        light={!data.pinned}
        onPress={() => {
          if (this.props.admin) this.togglePinned(data);
        }}
      >
        <Icon type="Ionicons" name="ios-star" style={{fontSize: 20}}/>
      </Button>
    );

    return (
      <Card
        style={{
          borderRadius: BORDER_RADIUS,
          overflow: 'hidden',
          paddingLeft: 0,
          marginLeft: 0,
          paddingRight: 0,
          marginRight: 0,
          marginBottom: 20,
        }}>
        <CardItem header>
          <Body style={{alignItems: 'flex-start', justifyContent: 'flex-start'}}>
            <H1> {data.title ? data.title : 'Image'} </H1>
          </Body>
          {right}
        </CardItem>
        <CardItem
          button
          onPress={ () => this.goToDetails(data) }
          style={{
            paddingLeft: ITEM_PADDING,
            marginLeft: 0,
            paddingRight: ITEM_PADDING,
            marginRight: 0,
            paddingTop: 10,
            paddingBottom: 10
          }}
        >
          {body}
        </CardItem>
        <CardItem style={{justifyContent: 'flex-end'}}>
          <Left>
            {left}
          </Left>
          <Text style={{fontSize: 10}}>
            {moment.unix(data.creationTime/1000).format('LLL')} 
          </Text>
        </CardItem>
      </Card>
    );
  }

  editMessage(message) {
    const { key, title, body, creationTime, pinned } = message;
    this.props.navigation.navigate('WriteMessageScreen', {
      editInfo: {
        key,
        title,
        body,
        creationTime,
        pinned,
      }
    });
  }

  deleteImage = (key) => {
    const path = `/images/board/${key}`;
    return ([
      firebase.database().ref(path).set(null),
      firebase.storage().ref().child(path).delete(),
    ]);
  }

  removeMessage() {
    this.hideConfirmDialog();
    const { key, image } = this.state.message;
    let promises = [firebase.database().ref('/messages/board/' + key).set(null)];
    if (image) promises.push(...this.deleteImage(image));
    Promise.all(promises)
      .then(() => this.props.navigation.goBack())
      .catch((error) => {
        console.log(JSON.stringify(error));
        alert(`${error.name}: ${error.message}`);
      });
  }

  render() {
    const { messages, admin, isVisible } = this.props;
    if (!isVisible) return null;

    const fab = admin ? (
      <Fab
        active={this.state.fabActive}
        direction="up"
        containerStyle={{ }}
        style={{ backgroundColor: '#5067FF' }}
        position="bottomRight"
        onPress={() => this.state.uploading ? null : this.setState((prevState) => ({ fabActive: !prevState.fabActive }))}
      >
        {this.state.uploading ? <Spinner color="white" /> : <Icon type="Ionicons" name="ios-add" />}
        {this.showIfActive(
          <Button
            style={{ backgroundColor: '#34A34F' }}
            onPress={() => this.navigate('WriteMessageScreen')}
          >
            <Icon type="FontAwesome" name="pencil" />
          </Button>
        )}
        {this.showIfActive(
          <Button
            style={{ backgroundColor: '#3B5998' }}
            onPress={() => this.pickFromGallery()}
          >
            <Icon type="FontAwesome" name="image" />
          </Button>
        )}
      </Fab>
    ) : null;

    const content = (
      <FlatList
        // removeClippedSubviews={false}
        viewabilityConfig={this.viewabilityConfig}
        onViewableItemsChanged={this.onViewableItemsChanged}
        style={{ paddingLeft: LIST_PADDING, paddingRight: LIST_PADDING, paddingBottom: 75 }}
        data={messages.sort(this.sortMessages)}
        renderItem={({ item: data }) => this.renderMessage(data)}
      />
    );
    return (
      <Container style={{ backgroundColor: gbl.backgroundColor }}>
        <View style={{ flex: 1 }}>
          {content}
          {fab}
        </View>
        <View>
          <Dialog.Container visible={this.state.showConfirm}>
            <Dialog.Title>Conferma cancellazione</Dialog.Title>
            <Dialog.Description>
              Sei sicuro di voler cancellare il messaggio?
            </Dialog.Description>
            <Dialog.Button label="Annulla" onPress={this.hideConfirmDialog}/>
            <Dialog.Button label="Conferma" onPress={this.removeMessage}/>
          </Dialog.Container>
        </View>
      </Container>
    );
  }
}
const mapStateToProps = (state) => ({
  uid: state.info.uid,
  admin: state.info.admin,
  isVisible: state.info.currentTab === 'BoardNavigator',
  messages: state.boardMessages,
  images: state.images['board'],
});

export default connect(mapStateToProps)(BoardScreen);
