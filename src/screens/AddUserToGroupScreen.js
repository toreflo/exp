import React, { Component } from 'react';
import { 
  View,
  ListView,
  TouchableOpacity,
} from 'react-native';
import {
  Container,
  Button,
  Icon,
  List,
  CheckBox,
  ListItem,
  Text,
  Left,
  Right,
} from 'native-base';
import { connect } from 'react-redux';
import firebase from 'firebase';

import nativeBaseTheme from '../../native-base-theme/variables/commonColor';

class AddUserToGroupScreen extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      newUsers: [],
    };
    this.selectUser = this.selectUser.bind(this);
    this.toggleSelectAll = this.toggleSelectAll.bind(this);
    this.addUser = this.addUser.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({title: 'Aggiungi partecipanti'});
  }

  selectUser(userKey) {
    this.setState(({ newUsers: selected }) => {
      const idx = selected.findIndex(key => key === userKey);
      if (idx === -1) return({ newUsers: [...selected, userKey]});
      return ({ newUsers: [...selected.slice(0, idx), ...selected.slice(idx + 1)]})
    });
  }

  toggleSelectAll(users, allSelected) {
    if (allSelected) this.setState({ newUsers: [] });
    else this.setState({ newUsers: users.map(user => user.key) });
  }

  addUser() {
    const userKeys = this.state.newUsers;

    if (userKeys.length === 0) {
      alert('Nessun utente selezionato');
      return;
    }

    const { key: groupKey } = this.props.navigation.getParam('group');
    const updates = {};
    userKeys.forEach(userKey => {
      updates[`/users/${userKey}/groups/${groupKey}`] = {
        lastMessageRead: 0,
        unread: 0,
      };
      updates[`/groups/${groupKey}/users/${userKey}`] = true;  
    })

    firebase.database().ref().update(updates)
      .catch((error) => alert(`${error.name}: ${error.message}`));

    this.setState({ newUsers: [] });
  }

  render() {
    const { key: groupKey } = this.props.navigation.getParam('group');
    const users = this.props.users.filter((user) => {
      return (!user.groups || !Object.keys(user.groups).find(key => key === groupKey));
    });
    let content;
    const noUser = (<Text>Tutti gli utenti appartengono già al gruppo!</Text>);
    const allSelected = users.length === this.state.newUsers.length;
    const list = (
      <List
        disableRightSwipe
        disableLeftSwipe
        renderRightHiddenRow={() => {}}
        removeClippedSubviews={false}
        dataSource={this.ds.cloneWithRows(users)}
        renderRow={(data) => (
          <ListItem onPress={() => this.selectUser(data.key)}>
            <Left><Text> {`${data.name} ${data.surname}`} </Text></Left>
            <Right>
              <CheckBox
                onPress={() => this.selectUser(data.key)}
                checked={this.state.newUsers.findIndex(key => key === data.key) !== -1} />
            </Right>
          </ListItem>
        )}
      />);
    if (users.length === 0) content = noUser;
    else content = list;
    
    const addButton = this.state.newUsers.length === 0 ? null : (
      <View style={{ padding: 10, flex: 1, alignItems: 'flex-start' }}>
        <TouchableOpacity onPress={this.addUser}>
          <Text style={{ color: nativeBaseTheme.brandPrimary }}>Aggiungi</Text>
        </TouchableOpacity>
      </View>);
    const selectText = allSelected ? 'Deseleziona tutti' : 'Seleziona tutti';
    const selectAllButton = (
      <View style={{ padding: 10, flex: 1, alignItems: 'flex-end' }}>
        <TouchableOpacity onPress={() => this.toggleSelectAll(users, allSelected)}>
          <Text style={{ color: nativeBaseTheme.brandPrimary }}>{selectText}</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <View>
        <View style={{ flexDirection: 'row' }}>
          {addButton}
          {selectAllButton}
        </View>
        {content}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  groups: state.groups,
  users: state.users,
});

export default connect(mapStateToProps)(AddUserToGroupScreen);
