import React, { Component } from "react";
import { 
  View,
  StyleSheet
} from "react-native";
import { Container, Content, Card, CardItem, Body, H1, Icon, Text } from 'native-base';
import firebase from 'firebase';
import Dialog from "react-native-dialog";

import * as gbl from '../gbl';

class MessageDetailsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    
    this.editMessage = this.editMessage.bind(this);
    this.removeMessage = this.removeMessage.bind(this);
    this.showConfirmDialog = this.showConfirmDialog.bind(this);
    this.hideConfirmDialog = this.hideConfirmDialog.bind(this);
}
  componentDidMount() {
    const { title } = this.props.navigation.getParam('message');
    const admin = this.props.navigation.getParam('admin');
    let headerTitle = [<Text key={1}>{title}</Text>];
    this.props.navigation.setParams({ title: headerTitle});
    if (admin) {
      this.props.navigation.setParams({
        rightButtons: [{
          key: 1,
          callback: this.editMessage,
          icon: <Icon type="FontAwesome" name="pencil" />,
        }, {
          key: 2,
          callback: this.showConfirmDialog,
          icon: <Icon type="Ionicons" name="ios-trash" />,
        }],
      });
    }
  }

  showConfirmDialog() {
    this.setState({showConfirm: true});
  }

  hideConfirmDialog() {
    this.setState({showConfirm: false}) 
  }
  
  removeMessage() {
    this.hideConfirmDialog();
    const { key } = this.props.navigation.getParam('message');
    firebase.database().ref('/messages/board/' + key).set(null)
      .then(() => this.props.navigation.goBack())
      .catch((error) => {
        console.log(JSON.stringify(error));
        alert(`${error.name}: ${error.message}`);
      });
  }
  
  editMessage() {
    const { key, title, body, creationTime, pinned } = this.props.navigation.getParam('message');
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

  render() {
    const { body, timestamp } = this.props.navigation.getParam('message');

    return (
      <Container style={{ backgroundColor: gbl.backgroundColor }}>
        <Content style={{ padding: 15, paddingBottom: 75 }} >
          <Card style={{ borderRadius: 10, overflow: 'hidden' }} >
            <CardItem>
              <Body>
                <Text> {body} </Text>
              </Body>
            </CardItem>
            <CardItem footer>
              <Text> {timestamp} </Text>
            </CardItem>
          </Card>
        </Content>
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
export default MessageDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});