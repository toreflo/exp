import React, { Component } from "react";
import { 
  View,
  StyleSheet
} from "react-native";
import { Container, Content, Card, CardItem, Body, H1, Icon, Text } from 'native-base';
import firebase from 'firebase';

class MessageDetailsScreen extends Component {
  constructor(props) {
    super(props);

    this.editMessage = this.editMessage.bind(this);
    this.removeMessage = this.removeMessage.bind(this);
  }
  componentDidMount() {
    const { title } = this.props.navigation.getParam('message').val();
    let headerTitle = [<Text key={1}>{title}</Text>];
    this.props.navigation.setParams({ title: headerTitle});
    this.props.navigation.setParams({
      rightButtons: [{
        key: 1,
        callback: this.editMessage,
        icon: <Icon type="FontAwesome" name="pencil" />,
      }, {
        key: 2,
        callback: this.removeMessage,
        icon: <Icon type="Ionicons" name="ios-trash" />,
      }],
    });
  }

  removeMessage() {
    const { key } = this.props.navigation.getParam('message');
    firebase.database().ref('/messages/board/' + key).set(null)
    .then(() => this.props.navigation.goBack())
    .catch((error) => {
      console.log(JSON.stringify(error));
      alert(`${error.name}: ${error.message}`);
    });
  }
  
  editMessage() {
    const { title, body } = this.props.navigation.getParam('message').val();
    const { key } = this.props.navigation.getParam('message');
    this.props.navigation.navigate('WriteMessageScreen', {
      editInfo: {
        key,
        title,
        body,
      }
    });
  }

  render() {
    const { body, timestamp } = this.props.navigation.getParam('message').val();

    return (
      <Container>
        <Content>
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