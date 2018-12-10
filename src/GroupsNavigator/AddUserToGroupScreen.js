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
  Button,
  Icon,
  List,
  Spinner,
  ListItem,
  Text,
  Body,
  Segment,
} from 'native-base';
import firebase from 'firebase';

import config from '../../config';

class AddUserToGroupScreen extends Component {
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
    const { key: groupKey } = this.props.navigation.getParam('group');
    this.db.ref('/users/').on('child_added', (snapshot) => {
      if (!snapshot.val().groups || !snapshot.val().groups[groupKey]) {
        this.userAdded(snapshot);
      }
    });
    this.db.ref('/users/').on('child_changed', (snapshot) => {
      if (!snapshot.val().groups || !snapshot.val().groups[groupKey]) {
        this.userAdded(snapshot);
      } else if (snapshot.val().groups && snapshot.val().groups[groupKey]) {
        this.userRemoved(snapshot.key);
      }
    });
    this.db.ref('/users/').on('child_removed', (snapshot) => {
      if (snapshot.val().groups && snapshot.val().groups[groupKey]) {
        this.userRemoved(snapshot.key);
      }
    });
  }

  userAdded(userSnapshot) {
    const idx = this.state.users.findIndex(user => user.key === userSnapshot.key);
    if (idx !== -1) return;

    const newState = {};
    if (this.state.loading) newState.loading = false;

    const newData = [...this.state.users];
    newData.push(userSnapshot);
    newState.users = newData;
    this.setState(newState);  
  }

  userRemoved(userKey) {
    const idx = this.state.users.findIndex(user => user.key === userKey);
    if (idx === -1) return;

    const newData = [...this.state.users];
    newData.splice(idx, 1);
    this.setState({ users: newData });
  }

  componentWillUnmount() {
    this.db.ref('/users/').off('child_added');
    this.db.ref('/users/').off('child_removed');
  }

  addUser(user, secId, rowId, rowMap) {
    const { key: groupKey } = this.props.navigation.getParam('group');
    rowMap[`${secId}${rowId}`].props.closeRow();

    const updates = {};
    updates[`/users/${user.key}/groups/${groupKey}`] = true;
    updates[`/groups/${groupKey}/users/${user.key}`] = true;
  
    this.db.ref().update(updates)
      .catch((error) => alert(`${error.name}: ${error.message}`));
  }

  render() {
    let content;
    const { key: groupKey } = this.props.navigation.getParam('group');
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
            { user: data.val() },
            )}
          >
            <Text> {`${data.val().name} ${data.val().surname}`} </Text>
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
        renderRightHiddenRow={(data, secId, rowId, rowMap) => {
          return (
            <Button full onPress={() => this.addUser(data, secId, rowId, rowMap)}>
              <Icon active name="add" />
            </Button>
          );
        }}
      />);
    if (this.state.loading) content = spinner;
    else content = list;

    return (
      <Container>
        <View style={{ flex: 1 }}>
          {content}
        </View>
      </Container>
    );
  }
}
export default AddUserToGroupScreen;

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
