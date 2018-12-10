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
import Dialog from "react-native-dialog";

class GroupDetailsScreen extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      users: [],
      loading: true,
    };
    this.db = firebase.database();
    this.deleteUser = this.deleteUser.bind(this);
    this.removeGroup = this.removeGroup.bind(this);
    this.showConfirmDialog = this.showConfirmDialog.bind(this);
    this.hideConfirmDialog = this.hideConfirmDialog.bind(this);
  }

  componentDidMount() {
    const { key } = this.props.navigation.getParam('group');
    this.db.ref(`/groups/${key}/users/`).on('child_added', ({key: userKey}) => {
      this.db.ref(`/users/${userKey}`).once('value', (snapshot) => {
        const newData = [...this.state.users];
        newData.push(snapshot);
        this.setState({users: newData});  
      });
    });
    this.db.ref(`/groups/${key}/users/`).on('child_removed', ({key: userKey}) => {
      const idx = this.state.users.findIndex(user => user.key === userKey);
      if (idx === -1) return;

      const newData = [...this.state.users];
      newData.splice(idx, 1);
      this.setState({ users: newData });
    });
    this.props.navigation.setParams({
      rightButtons: [{
        key: 1,
        callback: this.showConfirmDialog,
        icon: <Icon type="Ionicons" name="ios-trash" />,
      }],
    });
    this.db.ref('/dummy').once('value', () => {
      if (this.state.loading) this.setState({loading: false});
    });
  }

  componentWillUnmount() {
    const { key } = this.props.navigation.getParam('group');
    this.db.ref(`/groups/${key}/users/`).off('child_added');
    this.db.ref(`/groups/${key}/users/`).off('child_removed');
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

    const updates = this.state.users.reduce((userUpdates, user) => ({
      ...userUpdates,
      [`/users/${user.key}/groups/${groupKey}`]: null,
    }), {});

    updates[`/groups/${groupKey}`] = null;
    this.db.ref().update(updates)
      .then(() => this.props.navigation.navigate('GroupsScreen'))
      .catch((error) => alert(`${error.name}: ${error.message}`));
  }

  render() {
    let content;
    const group = this.props.navigation.getParam('group');
    const spinner = (<Spinner />);
    const list = (
      <List
        style={{ paddingTop: 24 }}
        enableEmptySections
        rightOpenValue={-75}
        dataSource={this.ds.cloneWithRows(this.state.users)}
        renderRow={(data) => (
          <ListItem>
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
