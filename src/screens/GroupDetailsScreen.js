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
  ListItem,
  Text,
  Fab,
} from 'native-base';
import firebase from 'firebase';
import Dialog from 'react-native-dialog';
import { connect } from 'react-redux';

class GroupDetailsScreen extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {};
    this.db = firebase.database();
    this.deleteUser = this.deleteUser.bind(this);
    this.removeGroup = this.removeGroup.bind(this);
    this.showConfirmDialog = this.showConfirmDialog.bind(this);
    this.hideConfirmDialog = this.hideConfirmDialog.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({
      rightButtons: [{
        key: 1,
        callback: this.showConfirmDialog,
        icon: <Icon type="Ionicons" name="ios-trash" />,
      }],
    });
  }

  showConfirmDialog() {
    this.setState({showConfirm: true});
  }

  hideConfirmDialog() {
    this.setState({showConfirm: false}) 
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

  removeGroup() {
    this.setState({showConfirm: false}) 
    const { key: groupKey } = this.props.navigation.getParam('group');

    const updates = this.getGroupUsers().reduce((userUpdates, user) => ({
      ...userUpdates,
      [`/users/${user.key}/groups/${groupKey}`]: null,
    }), {});

    updates[`/groups/${groupKey}`] = null;
    updates[`/messages/groups/${groupKey}`] = null;
    this.db.ref().update(updates)
      .then(() => this.props.navigation.navigate('GroupsScreen'))
      .catch((error) => alert(`${error.name}: ${error.message}`));
  }

  getGroupUsers() {
    const { key: groupKey } = this.props.navigation.getParam('group');
    const group = this.props.groups.find(item => item.key === groupKey);
    if (group && group.users) {
      return Object.keys(group.users).map(userKey => {
        return ({
          ...this.props.users.find(user => user.key === userKey),
        });
      });
    }
    return [];
  }

  render() {
    const { key: groupKey } = this.props.navigation.getParam('group');
    const group = this.props.groups.find(item => item.key === groupKey);
    const users = this.getGroupUsers();
    const content = (
      <List
        removeClippedSubviews={false}
        style={{ paddingTop: 24 }}
        enableEmptySections
        rightOpenValue={-75}
        dataSource={this.ds.cloneWithRows(users)}
        renderRow={(data) => (
          <ListItem>
            <Text> {`${data.name} ${data.surname}`} </Text>
          </ListItem>
        )}
        renderRightHiddenRow={(data, secId, rowId, rowMap) => (
          <Button full danger onPress={() => this.deleteUser(data, secId, rowId, rowMap)}>
            <Icon active name="trash" />
          </Button>
        )}
      />);

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
        <View>
          <Dialog.Container visible={this.state.showConfirm}>
            <Dialog.Title>Conferma cancellazione</Dialog.Title>
            <Dialog.Description>
              Sei sicuro di voler cancellare il gruppo?
            </Dialog.Description>
            <Dialog.Button label="Annulla" onPress={this.hideConfirmDialog}/>
            <Dialog.Button label="Conferma" onPress={this.removeGroup}/>
          </Dialog.Container>
        </View>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  groups: state.groups,
  users: state.users,
});

export default connect(mapStateToProps)(GroupDetailsScreen);