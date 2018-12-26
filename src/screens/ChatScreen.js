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
import * as actions from '../actions';
import * as gbl from '../gbl';

class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.sendMessage = this.sendMessage.bind(this);
    this.loadEarlier = this.loadEarlier.bind(this);
  }

  componentDidMount() {
    const { name } = this.props.navigation.getParam('group');
    this.props.navigation.setParams({title: name});
  }

  sendMessage(messages = []) {
    const { key: groupKey } = this.props.navigation.getParam('group');
    let minTime;
    messages.forEach((message) => {
      const { key } = firebase.database().ref(`/messages/groups/${groupKey}`).push();
      const createdAt = message.createdAt.getTime();
      if ((minTime === undefined) || (createdAt < minTime)) minTime = createdAt;
      firebase.database().ref(`/messages/groups/${groupKey}/${key}`).set({
        ...message,
        createdAt,
      })
        .then(() => {
          if (this.props.groupInfo.firstMessageTime) return Promise.resolve();
          return firebase.database().ref(`/groups/${groupKey}/`).update({firstMessageTime: minTime});
        })
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
  
  render() {
    let messages = [];
    let avatar = null;
    let showLoadEarlier = false;
    if (this.props.messages) {
      this.props.messages
        .forEach(message => {
          if (this.props.avatars[message.user._id])
            avatar = this.props.avatars[message.user._id];
          messages = GiftedChat.append(messages, [{
            _id: message.key,
            createdAt: new Date(message.createdAt),
            text: message.text,
            user: {
              ...message.user,
              avatar,
            },
          }]);
        });
      if ((this.props.messages.length > 0) && 
          (this.props.messages[0].createdAt > this.props.groupInfo.firstMessageTime)) {
        showLoadEarlier = true;
      }
    }
    return (
      <GiftedChat
        messages={messages}
        onSend={newMessages => this.sendMessage(newMessages)}
        locale="it"
        isAnimated
        loadEarlier={showLoadEarlier}
        onLoadEarlier={this.loadEarlier}
        // keyboardShouldPersistTaps={'never'}
        renderInputToolbar={this.props.admin ? undefined : () => null}
        user={{
          _id: this.props.uid,
          name: this.props.username,
        }}
      />
    );
  }
}
const mapStateToProps = (state, ownProps) => ({
  uid: state.info.uid,
  admin: state.info.admin,
  username: state.info.name,
  avatars: state.info.avatars,
  messages: state.groupMessages[ownProps.navigation.getParam('group', {}).key],
  groupInfo: state.groups.find(group => group.key === ownProps.navigation.getParam('group', {}).key),
});

export default connect(mapStateToProps)(ChatScreen);
