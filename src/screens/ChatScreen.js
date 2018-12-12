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

class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.sendMessage = this.sendMessage.bind(this);
  }

  sendMessage(messages = []) {
    const { key: groupKey } = this.props.navigation.getParam('group');
    messages.forEach((message) => {
      const { key } = firebase.database().ref(`/messages/groups/${groupKey}`).push();
      firebase.database().ref(`/messages/groups/${groupKey}/${key}`).set({
        ...message,
        createdAt: message.createdAt.getTime(),
      })
        .catch((error) => alert(`${error.name}: ${error.message}`));   
    });
  }

  render() {
    let messages = [];
    if (this.props.messages) {
      this.props.messages
        .forEach(message => {
          messages = GiftedChat.append(messages, [{
            _id: message.key,
            createdAt: new Date(message.createdAt),
            text: message.text,
            user: {
              ...message.user,
              avatar: 'https://placeimg.com/140/140/any',
            },
          }]);
        });
    }

    return (
      <GiftedChat
        messages={messages}
        onSend={newMessages => this.sendMessage(newMessages)}
        locale="it"
        isAnimated
        // loadEarlier
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
  messages: state.groupMessages[ownProps.navigation.getParam('group', {}).key],
});

export default connect(mapStateToProps)(ChatScreen);
