import React, { Component } from 'react';
import { View, StyleSheet, ListView } from 'react-native';
import { 
  Container,
  Content,
  Fab,
  List,
  Spinner,
  ListItem,
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
import firebase, { auth } from 'firebase';
import { connect } from 'react-redux';
import Dialog from 'react-native-dialog';
import { GiftedChat } from 'react-native-gifted-chat';
import dismissKeyboard from 'dismissKeyboard';

import * as firebaseDB from '../lib/firebaseDB';
import * as fileStorage from '../lib/fileStorage';
import * as actions from '../actions';
import * as gbl from '../gbl';

class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.sendMessage = this.sendMessage.bind(this);
    this.loadEarlier = this.loadEarlier.bind(this);
    this.onViewableItemsChanged = this.onViewableItemsChanged.bind(this);
    this.renderActions = this.renderActions.bind(this);
    this.upload = this.upload.bind(this);

    this.viewabilityConfig = {
      // waitForInteraction: true,
      itemVisiblePercentThreshold: 100,
    };

    this.state = {};
  }

  componentDidMount() {
    const { name } = this.props.navigation.getParam('group');
    this.props.navigation.setParams({title: name});
  }

  sendMessage(messages = []) {
    const { key: groupKey } = this.props.navigation.getParam('group');
    let minTime;
    let maxTime;
    messages.forEach((message) => {
      const { key } = firebase.database().ref(`/messages/groups/${groupKey}`).push();
      const createdAt = message.createdAt.getTime();
      if ((minTime === undefined) || (createdAt < minTime)) minTime = createdAt;
      if ((maxTime === undefined) || (createdAt > maxTime)) maxTime = createdAt;
      const updates = {
        [`/messages/groups/${groupKey}/${key}`]: {
          ...message,
          createdAt,
        },
        [`/groups/${groupKey}/lastMessageTime`]: maxTime,
      };
      if (!this.props.groupInfo.firstMessageTime) {
        updates[`/groups/${groupKey}/firstMessageTime`] = minTime;
      }
      firebase.database().ref().update(updates)
        .catch((error) => alert(`${error.name}: ${error.message}`));
    });
  }

  loadEarlier() {
    const { key: groupKey } = this.props.navigation.getParam('group');
    const num = this.props.messages.length;
    console.log('Registering on last', num + 3, 'messages')
    firebaseDB.on(`/messages/groups/${groupKey}/`, 'child_added', (snapshot) => {
      this.props.dispatch(actions.groupMessageAdded({
        groupKey, 
        message: {
          key: snapshot.key,
          ...snapshot.val(),
        },
      }))
    }, num + gbl.MAX_NUM_MESSAGES);
  }
  
  onViewableItemsChanged(info) {
    const { uid, navigation, userGroups, messages, images } = this.props;
    const { key: groupKey} = navigation.getParam('group', {});
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (info.viewableItems.find(item => item.item._id === lastMessage.key)) {
        if (userGroups[groupKey].lastMessageRead == lastMessage.createdAt) return;
        if (lastMessage.image && !images[lastMessage.image]) return;
        
        console.log('Resetting unread messages for group', groupKey);
        firebase.database().ref().update({
          [`/users/${uid}/groups/${groupKey}/lastMessageRead`]: lastMessage.createdAt,
          [`/users/${uid}/groups/${groupKey}/unread`]: 0,
        })
          .catch((error) => alert(`${error.name}: ${error.message}`));
      }
    }
  }

  upload = async ({ uri }) => {
    const { key: groupKey } = this.props.navigation.getParam('group');
    const timeNow = Date.now();
    const { key } = firebase.database().ref(`/messages/groups/${groupKey}`).push();
    const message = {
      _id: key,
      createdAt: timeNow,
      image: key,
      user: {
        _id: this.props.uid,
        name: this.props.username,
      },
    };
    const updates = {
      [`/messages/groups/${groupKey}/${key}`]: message,
      [`/groups/${groupKey}/lastMessageTime`]: timeNow,
      [`/images/groups/${groupKey}/${key}`]: timeNow,
    };
    if (!this.props.groupInfo.firstMessageTime) {
      updates[`/groups/${groupKey}/firstMessageTime`] = timeNow;
    }
    try {
      this.setState({ uploading: true });
      await fileStorage.uploadImageAsync(uri, `/images/groups/${groupKey}/${key}`); 
      await fileStorage.saveFile(uri, 'image', key);
      await firebase.database().ref().update(updates);
      this.setState({ uploading: false });
    } catch (error) {
      this.setState({ uploading: false });
      alert(`${error.name}: ${error.message}`);
    }
  }

  pickFromGallery = async () => {
    await fileStorage.pickFromGallery({
      imageManipulatorActions: [{ resize: { width: 900 }}],
      imageManipulatorSaveOptions: { compress: 0 },
    }, this.upload);
  }

  renderActions() {
    return (
      <View>
        <Button
          transparent
          onPress={this.pickFromGallery}
        >
          <Icon type="Ionicons" name="ios-images" />
        </Button>
      </View>
    );
  }

  render() {
    let messages = [];
    let avatar = null;
    let showLoadEarlier = false;
    let imageUri;
    let text;
    const { images, avatars, } = this.props;
    if (this.props.messages) {
      this.props.messages
        .forEach((message) => {
          imageUri = undefined;
          text = undefined;
          if (message.image && images) {
            imageUri = images[message.image];
          }
          if (message.text) text = message.text;
          else if (message.image && !imageUri) {
            if (this.props.admin) return; // Waiting image is available

            text = 'Downloading image...';
          }
          
          if (avatars[message.user._id])
            avatar = avatars[message.user._id];
          messages = GiftedChat.append(messages, [{
            _id: message.key,
            createdAt: new Date(message.createdAt),
            text,
            image: message.image ? imageUri : undefined,
            user: {
              ...message.user,
              avatar,
            },
          }]);
        });
      if (this.state.uploading) {
        messages = GiftedChat.append(messages, [{
          _id: 'tempMsgUploading',
          createdAt: new Date(),
          text: 'Caricamento immagine in corso...',
          system: true,
        }]);
      }
      if ((this.props.messages.length > 0) && 
          (this.props.messages[0].createdAt > this.props.groupInfo.firstMessageTime)) {
        showLoadEarlier = true;
      }
    }
    return (
      <View style={{flex: 1}} >
      <GiftedChat
        messages={messages}
        onSend={newMessages => this.sendMessage(newMessages)}
        locale="it"
        isAnimated
        loadEarlier={showLoadEarlier}
        // isLoadingEarlier={this.state.isLoadingEarlier}
        onLoadEarlier={this.loadEarlier}
        listViewProps={this.props.admin ? null : {
          viewabilityConfig: this.viewabilityConfig,
          onViewableItemsChanged: this.onViewableItemsChanged,
          onEndReachedThreshold: 0,
          onEndReached: () => {},
        }}
        // lightboxProps={{ springConfig: { tension: 10000, friction: 10000 }}}
        lightboxProps={{ springConfig: { tension: 100000, friction: 100000 }}}
        // keyboardShouldPersistTaps={'never'}
        renderInputToolbar={this.props.admin ? undefined : () => null}
        renderActions={this.renderActions}
        // renderMessageImage={this.renderImage}
        user={{
          _id: this.props.uid,
          name: this.props.username,
        }}
      />
      </View>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  uid: state.info.uid,
  admin: state.info.admin,
  username: state.info.name,
  userGroups: state.info.admin ? undefined : state.users.find(user => user.key === state.info.uid).groups,
  avatars: state.info.avatars,
  messages: state.groupMessages[ownProps.navigation.getParam('group', {}).key],
  groupInfo: state.groups.find(group => group.key === ownProps.navigation.getParam('group', {}).key),
  images: state.images[ownProps.navigation.getParam('group', {}).key],
});

export default connect(mapStateToProps)(ChatScreen);
