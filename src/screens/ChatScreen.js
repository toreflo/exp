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
import firebase from 'firebase';
import { connect } from 'react-redux';
import Dialog from 'react-native-dialog';

import * as gbl from '../gbl';

class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {};
    this.showNewMessageDialog = this.showNewMessageDialog.bind(this);
    this.hideNewMessageDialog = this.hideNewMessageDialog.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  sendMessage() {
    const { key: groupKey } = this.props.navigation.getParam('group');
    const { key } = firebase.database().ref(`/messages/groups/${groupKey}`).push();
    firebase.database().ref(`/messages/groups/${groupKey}/${key}`).set({
      body: this.state.newMessage,
    })
      .then(() => this.hideNewMessageDialog())
      .catch((error) => {
        this.hideNewMessageDialog();
        alert(`${error.name}: ${error.message}`);
      });
  }

  showNewMessageDialog() {
    this.setState({showNewMessage: true});
  }

  hideNewMessageDialog() {
    this.setState({showNewMessage: false, newMessage: ''}) 
  }

  render() {
    const admin = this.props.navigation.getParam('admin');
    const messages = this.props.messages ? this.props.messages : [];
    const fab = admin ? (
      <Fab
        active={true}
        direction="up"
        containerStyle={{ }}
        style={{ backgroundColor: '#5067FF' }}
        position="bottomRight"
        onPress={this.showNewMessageDialog}>
        <Icon type="FontAwesome" name="pencil" />
      </Fab>
    ) : null;
    const content = (
      <Content>
        <ListView
          removeClippedSubviews={false}
          enableEmptySections
          style={{ padding: 15, paddingBottom: 75 }}
          dataSource={this.ds.cloneWithRows(messages)}
          renderRow={(data) => {
            return (
              <Card style={{ borderRadius: 10, overflow: 'hidden' }}>
                <CardItem>
                  <Body>
                    <Text> {data.body} </Text>
                  </Body>
                </CardItem>
                <CardItem style={{justifyContent: 'flex-end'}}>
                  <Text style={{fontSize: 10}}>
                    {/* {moment.unix(data.creationTime/1000).format('LLL')}  */}
                  </Text>
                </CardItem>
              </Card>
            );
          }}
        />
      </Content>
    );

    return (
      <Container style={{ backgroundColor: gbl.backgroundColor }}>
        <View style={{ flex: 1 }}>
          {content}
          {fab}
        </View>
        <View>
          <Dialog.Container visible={this.state.showNewMessage}>
            <Dialog.Title>Nuovo messaggio</Dialog.Title>
            <Dialog.Description>
              Inserisci messaggio:
            </Dialog.Description>
            <Dialog.Input 
              autoFocus={this.state.showNewMessage}
              onChangeText={(newMessage) => this.setState({ newMessage })}
              value={this.state.newMessage}
            />
            <Dialog.Button label="Annulla" onPress={this.hideNewMessageDialog}/>
            <Dialog.Button label="Conferma" onPress={ this.sendMessage }/>
          </Dialog.Container>
        </View>
      </Container>
    );
  }
}
const mapStateToProps = (state, ownProps) => ({
  messages: state.groupMessages[ownProps.navigation.getParam('group', {}).key],
});

export default connect(mapStateToProps)(ChatScreen);
