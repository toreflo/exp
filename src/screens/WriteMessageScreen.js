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
  Icon,
} from "native-base";
import { StackActions, NavigationActions } from 'react-navigation';
import firebase from 'firebase';
import StackHeader from '../components/StackHeader';

class WriteMessageScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return ({
      header: <StackHeader navigation={navigation} modal />
    });
  }

  constructor(props) {
    super(props);

    this.state = {
      title: '',
      body: '',
    };

    this.sendMessage = this.sendMessage.bind(this);
    this.updateMessage = this.updateMessage.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({title: ''});
    const editInfo = this.props.navigation.getParam('editInfo', null);
    let callback = this.sendMessage;
    let iconName = 'ios-send';
    if (editInfo) {
      this.setState({
        title: editInfo.title,
        body: editInfo.body,
        key: editInfo.key,
        creationTime: editInfo.creationTime,
        pinned: editInfo.pinned,
      })
      callback = this.updateMessage;
      iconName = 'ios-checkmark-circle';      
    }
    this.props.navigation.setParams({
      rightButtons: [{
        key: 1,
        callback,
        icon: <Icon type="Ionicons" name={iconName} />,
      }],
    });
  }
  
  updateMessage() {
    this.sendMessage(true);
  }

  sendMessage(updateMode) {
    const { title, body, creationTime, pinned } = this.state;

    let key;
    const message = { title, body };
    if (updateMode) {
      ({ key } = this.state);
      message.lastUpdate = firebase.database.ServerValue.TIMESTAMP;
      message.creationTime = creationTime;
      message.pinned = pinned;
    } else {
      ({ key } = firebase.database().ref('/messages/board/').push());
      message.creationTime = firebase.database.ServerValue.TIMESTAMP;
      message.pinned = false;
    }
    firebase.database().ref('/messages/board/' + key).set(message)
      .then(() => {
        if (updateMode) {
          this.props.navigation.popToTop();
        } else {
          this.props.navigation.goBack();
        }
      })
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