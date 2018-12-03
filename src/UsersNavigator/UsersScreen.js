import React, { Component } from "react";
import { 
  View,
  ListView,
  StyleSheet
} from "react-native";
import {
  Container,
  Header,
  Left,
  Right,
  Form,
  Content,
  Button,
  Icon,
  List,
  Spinner,
  ListItem,
  Item,
  Text,
  Input,
  Label,
  Body,
  Segment,
} from 'native-base';
import firebase from 'firebase';

import config from '../../config';

class UsersScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const activeSegment = navigation.getParam('activeSegment', 'users');
    return {
      header: (
        <Header hasSegment>
          <Left />
          <Body>
            {/* <Title>pippo</Title> */}
            <Segment>
              <Button
                first
                active={ activeSegment === 'users' }
                onPress={ () => navigation.setParams({ activeSegment: 'users' }) }
              >
                <Text>Utenti</Text>
              </Button>
              <Button
                last
                active={ activeSegment === 'groups' }
                onPress={ () => navigation.setParams({ activeSegment: 'groups' }) }
              >
                <Text>Gruppi</Text>
              </Button>
            </Segment>
          </Body>
          <Right />
        </Header>
      ),
    }
  };

  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      users: [],
      newUser: '',
      loading: true,
    };
    this.db = firebase.database();
    this.addUser = this.addUser.bind(this);
  }

  componentDidMount() {
    const userId = firebase.auth().currentUser.uid;
    this.db.ref('/users/').on('child_added', (snapshot) => {
      const newState = {};
      if (this.state.loading) newState.loading = false;
  
      const newData = [...this.state.users];
      newData.push(snapshot);
      newState.users = newData;
      this.setState(newState);
    });
    this.db.ref('/users/').on('child_removed', (snapshot) => {
      const idx = this.state.users.findIndex(user => user.key === snapshot.key);
      if (idx === -1) return;

      const newData = [...this.state.users];
      newData.splice(idx, 1);
      this.setState({ users: newData });
    });
  }

  componentWillUnmount() {
    this.db.ref('/users/').off('child_added');
    this.db.ref('/users/').off('child_removed');
  }

  addUser() {
    this.props.navigation.navigate('AddUserScreen');
  }

  async deleteRow(data, secId, rowId, rowMap) {
    rowMap[`${secId}${rowId}`].props.closeRow();

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
            type: 'deleteUser',
            idToken,
            uid: data.key,
          }),
        }))
      .then((response) => response.json())
      .then((responseJson) => alert(responseJson.message))
      .catch((error) => alert(`${error.name}: ${error.message}`));
  }

  render() {
    let content;
    const spinner = (<Spinner />);
    const list = (
      <List
        style={{ paddingTop: 24 }}
        leftOpenValue={75}
        rightOpenValue={-75}
        dataSource={this.ds.cloneWithRows(this.state.users)}
        renderRow={(data) => (
          <ListItem onPress={() => this.props.navigation.navigate(
            'UserDetailsScreen',
            { user: data.val().name },
            )}
          >
            <Text> {data.val().name} </Text>
          </ListItem>
        )}
        renderLeftHiddenRow={(data, secId, rowId, rowMap) => (
          <Button full onPress={() => {
            alert(data);
            rowMap[`${secId}${rowId}`].props.closeRow();
          }}>
            <Icon active name="information-circle" />
          </Button>
        )}
        renderRightHiddenRow={(data, secId, rowId, rowMap) => (
          <Button full danger onPress={() => this.deleteRow(data, secId, rowId, rowMap)}>
            <Icon active name="trash" />
          </Button>
        )}
      />);
    if (this.state.loading) content = spinner;
    else content = list;

    return (
      <Container>
        <Content>
          <Form style={styles.addUser}>
            <Item floatingLabel style={{ flex: 5 }}>
              <Label>Nuovo utente</Label>
              <Input
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={(newUser) => this.setState({ newUser })}
                value={this.state.newUser}
              />
            </Item>
            <Item style={{ flex: 1, marginRight: 20 }}>
              <Button
                rounded
                primary
                onPress={this.addUser}
              >
                <Text>+</Text>
              </Button>
            </Item>
          </Form>
          {content}
        </Content>
      </Container>
    );
  }
}
export default UsersScreen;

const styles = StyleSheet.create({
  addUser: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
