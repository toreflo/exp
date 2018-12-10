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
  Fab,
} from 'native-base';
import firebase from 'firebase';

import config from '../../config';

class GroupDetailsScreen extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      users: [],
      newUser: '',
      loading: true,
    };
    this.db = firebase.database();
    this.deleteUser = this.deleteUser.bind(this);
  }

  componentDidMount() {
    const { key } = this.props.navigation.getParam('group');
    this.db.ref(`/groups/${key}/users/`).on('child_added', ({key: userKey}) => {
      const newState = {};
      if (this.state.loading) newState.loading = false;
  
      this.db.ref(`/users/${userKey}`).once('value', (snapshot) => {
        const newData = [...this.state.users];
        newData.push(snapshot);
        newState.users = newData;
        this.setState(newState);  
      });
    });
    this.db.ref(`/groups/${key}/users/`).on('child_removed', ({key: userKey}) => {
      const idx = this.state.users.findIndex(user => user.key === userKey);
      if (idx === -1) return;

      const newData = [...this.state.users];
      newData.splice(idx, 1);
      this.setState({ users: newData });
    });
  }

  componentWillUnmount() {
    const { key } = this.props.navigation.getParam('group');
    this.db.ref(`/groups/${key}/users/`).off('child_added');
    this.db.ref(`/groups/${key}/users/`).off('child_removed');
  }

  deleteUser(user, secId, rowId, rowMap) {
    rowMap[`${secId}${rowId}`].props.closeRow();
    const { key: groupKey } = this.props.navigation.getParam('group');

    const updates = {};
    updates[`/users/${user.key}/groups/${groupKey}`] = null;
    updates[`/groups/${groupKey}/users/${user.key}`] = null;
  
    this.db.ref().update(updates)
      .catch((error) => alert(`${error.name}: ${error.message}`));
  }

  render() {
    let content;
    const group = this.props.navigation.getParam('group');
    const spinner = (<Spinner />);
    const list = (
      <List
        style={{ paddingTop: 24 }}
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
        renderRightHiddenRow={(data, secId, rowId, rowMap) => (
          <Button full danger onPress={() => this.deleteUser(data, secId, rowId, rowMap)}>
            <Icon active name="trash" />
          </Button>
        )}
      />);
    if (this.state.loading) content = spinner;
    else content = list;

    return (
      <Container>
        <View style={{ flex: 1 }}>
          {content}
          <Fab
            active={true}
            direction="up"
            containerStyle={{ }}
            style={{ backgroundColor: '#5067FF' }}
            position="bottomRight"
            onPress={() => this.props.navigation.navigate('AddUserToGroupScreen', { group })}>
            <Icon type="FontAwesome" name="user-plus" />
          </Fab>
        </View>
      </Container>
    );
  }
}
export default GroupDetailsScreen;

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
