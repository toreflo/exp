import React, { Component } from 'react';
import { 
  View,
  ListView,
  StyleSheet
} from 'react-native';
import {
  Container,
  Button,
  Icon,
  List,
  Spinner,
  ListItem,
  Text,
} from 'native-base';
import { connect } from 'react-redux';
import firebase from 'firebase';


class AddUserToGroupScreen extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      newUser: '',
    };
    this.addUser = this.addUser.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({title: 'Aggiunta utente'});
  }

  addUser(user, secId, rowId, rowMap) {
    const { key: groupKey } = this.props.navigation.getParam('group');
    rowMap[`${secId}${rowId}`].props.closeRow();

    const updates = {};
    updates[`/users/${user.key}/groups/${groupKey}`] = {
      lastMessageRead: 0,
      unread: 0,
    };
    updates[`/groups/${groupKey}/users/${user.key}`] = true;
  
    firebase.database().ref().update(updates)
      .catch((error) => alert(`${error.name}: ${error.message}`));
  }

  render() {
    const { key: groupKey } = this.props.navigation.getParam('group');
    const users = this.props.users.filter((user) => {
      return (!user.groups || !Object.keys(user.groups).find(key => key === groupKey));
    });
    let content;
    const noUser = (<Text>Tutti gli utenti appartengono già al gruppo!</Text>);
    const list = (
      <List
        removeClippedSubviews={false}
        style={{ paddingTop: 24 }}
        leftOpenValue={75}
        rightOpenValue={-75}
        dataSource={this.ds.cloneWithRows(users)}
        renderRow={(data) => (
          <ListItem>
            <Text> {`${data.name} ${data.surname}`} </Text>
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
    if (users.length === 0) content = noUser;
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

const mapStateToProps = (state) => ({
  groups: state.groups,
  users: state.users,
});

export default connect(mapStateToProps)(AddUserToGroupScreen);
