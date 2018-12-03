import React, { Component } from "react";
import { 
  StyleSheet,
  Dimensions,
} from "react-native";
import { 
  Container,
  Content,
  Form,
  Item,
  Label,
  Input,
} from "native-base";
import firebase from 'firebase';
import StackHeader from '../components/StackHeader';
import { checkCollection } from '../lib';

class WriteMessageScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return ({
      header: <StackHeader navigation={navigation} modal sendButton/>
    });
  }

  constructor(props) {
    super(props);

    this.state = {
      title: '',
      body: '',
    };
    this.sendMessage = this.sendMessage.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({ send: this.sendMessage });
  }

  sendMessage() {
    const { title, body } = this.state;

    checkCollection('/messages/')
      .then(() => checkCollection('/messages/board/'))
      .then(() => {
        const { key } = firebase.database().ref('/messages/board/').push();
        firebase.database().ref('/messages/board/' + key).set({
          title,
          body,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
        });
      })
      .then(() => this.props.navigation.goBack())
      .catch((error) => {
        console.log(JSON.stringify(error));
        alert(`${error.name}: ${error.message}`);
      });
  }

  render() {
    const { height } = Dimensions.get('window');

    return (
      <Container>
        <Content>
          <Form>
            <Item stackedLabel>
              <Label>Titolo</Label>
              <Input
                autoFocus
                onChangeText={(title) => this.setState({ title })}
                value={this.state.title}
              />
            </Item>
            <Item
              stackedLabel
              // style={{borderBottomWidth:0}} /* since underline={false} seems to not work */
            >
              <Label>Testo</Label>
              <Input
                multiline
                numberOfLines={20}
                style={{ height: height * 0.5 }}
                onChangeText={(body) => this.setState({ body })}
                value={this.state.body}
              />
            </Item>
          </Form>
        </Content>
      </Container>
    );
  }
}
export default WriteMessageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});