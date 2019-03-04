import React, { Component } from 'react';
import { 
  View,
  ListView,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Body,
  Container,
  Button,
  Icon,
  List,
  ListItem,
  Text,
  ActionSheet,
  Root,
} from 'native-base';
import firebase from 'firebase';
import Dialog from 'react-native-dialog';
import { connect } from 'react-redux';

import * as fileStorage from '../lib/fileStorage';
import * as actions from '../actions';
import nativeBaseTheme from '../../native-base-theme/variables/commonColor';

class GroupDetailsScreen extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {};
    this.db = firebase.database();
    this.removeUser = this.removeUser.bind(this);
    this.removeAllUsers = this.removeAllUsers.bind(this);
    this.removeGroup = this.removeGroup.bind(this);
    this.upload = this.upload.bind(this);
    this.pickFromGallery = this.pickFromGallery.bind(this);
    this.showActionSheet = this.showActionSheet.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({title: name});
  }
  
  componentDidMount() {
    const { name } = this.props.navigation.getParam('group');
    this.props.navigation.setParams({ title: name });
  }

  removeUser(user, secId, rowId, rowMap) {
    rowMap[`${secId}${rowId}`].props.closeRow();
    const { key: groupKey } = this.props.navigation.getParam('group');

    const updates = {};
    updates[`/users/${user.key}/groups/${groupKey}`] = null;
    updates[`/groups/${groupKey}/users/${user.key}`] = null;
  
    this.db.ref().update(updates)
      .catch((error) => alert(`${error.name}: ${error.message}`));
  }

  removeAllUsers() {
    const { key: groupKey } = this.props.navigation.getParam('group');
    const users = this.getGroupUsers();

    const updates = {};
    users.forEach(user => {
      updates[`/users/${user.key}/groups/${groupKey}`] = null;
    });
    updates[`/groups/${groupKey}/users`] = null;
  
    this.db.ref().update(updates)
      .catch((error) => alert(`${error.name}: ${error.message}`));
  }

  removeGroup() {
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

  upload = async ({ uri }) => {
    const { key: groupKey } = this.props.navigation.getParam('group');
    await fileStorage.uploadImageAsync(uri, `/groupAvatars/${groupKey}`); 
    const filename = await fileStorage.saveFile(uri, 'groupAvatar', groupKey);  
    this.props.dispatch(actions.updateGroupAvatar(groupKey, filename));
    alert('Immagine caricata');  
  }

  pickFromGallery = async () => {
    const IMAGE_DIM = 140;
    await fileStorage.pickFromGallery(
      {
        imagePicker: {
          allowsEditing: true,
          aspect: [1, 1],
        },
        imageManipulatorActions: [{ resize: { width: IMAGE_DIM }}],
      },
      this.upload,
    )
  }

  showActionSheet(mode) {
    const config = {
      'avatar': {
        options: ['Modifica immagine', 'Annulla'],
        action: this.pickFromGallery,
      },
      'removeGroup': {
        options: ['Cancella il gruppo', 'Annulla'],
        action: this.removeGroup,
        destructiveButtonIndex: 0,
      },
      'removeUser': {
        options: ['Rimuovi l\'utente', 'Annulla'],
        action: () => {},
        destructiveButtonIndex: 0,
      },
      'removeAllUsers': {
        options: ['Svuota il gruppo', 'Annulla'],
        action: this.removeAllUsers,
        destructiveButtonIndex: 0,
      },
    };
    ActionSheet.show(
      {
        options: config[mode].options,
        destructiveButtonIndex: config[mode].destructiveButtonIndex,
        cancelButtonIndex: 1,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          config[mode].action();
        }
      },
    );
  }

  render() {
    const { key: groupKey } = this.props.navigation.getParam('group');
    const group = this.props.groups.find(item => item.key === groupKey);
    const users = this.getGroupUsers();

    const content = (
      <View style={{ paddingTop: 24 }}>
        <Text style={{ padding: 5, color: '#9e9e9e', fontSize: 12 }}>{`${users.length} PARTECIPANTI`}</Text>

        <List style={{ paddingLeft: 0, marginLeft: 0 }}>
          <ListItem style={{ paddingLeft: 5, marginLeft: 0, backgroundColor: 'white' }}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity onPress={() => { this.props.navigation.navigate('AddUserToGroupScreen', { group }); }}>
                <View style={{ flexDirection: 'row' }}>
                  <Icon type="Ionicons" name="ios-add-circle-outline" style={{ color: nativeBaseTheme.brandPrimary }} />
                  <Text style={{ color: nativeBaseTheme.brandPrimary, paddingLeft: 10 }}>Aggiungi partecipanti</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ListItem>
        </List>

        <List
          removeClippedSubviews={false}
          enableEmptySections
          rightOpenValue={-75}
          dataSource={this.ds.cloneWithRows(users)}
          renderRow={(data) => (
            <ListItem>
              <Text> {`${data.name} ${data.surname}`} </Text>
            </ListItem>
          )}
          renderRightHiddenRow={(data, secId, rowId, rowMap) => (
            <Button full danger onPress={() => this.removeUser(data, secId, rowId, rowMap)}>
              <Icon active name="trash" />
            </Button>
          )}
        />

        <List style={{ paddingLeft: 0, marginLeft: 0 }}>
          <ListItem style={{ paddingLeft: 5, marginLeft: 0, backgroundColor: 'white' }}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity onPress={() => this.showActionSheet('removeAllUsers')}>
                {/* <Icon type="Ionicons" name="ios-trash" style={{ color: nativeBaseTheme.brandDanger }} /> */}
                <Text style={{ color: nativeBaseTheme.brandDanger, paddingLeft: 10 }}>Svuota gruppo</Text>
              </TouchableOpacity>
            </View>
          </ListItem>
        </List>

        <List style={{ paddingTop: 24, paddingLeft: 0, marginLeft: 0 }}>
          <ListItem
            style={{ paddingLeft: 5, marginLeft: 0, backgroundColor: 'white' }}
            onPress={() => this.showActionSheet('removeGroup')}
          >
            <Text style={{ color: 'red' }}>Elimina gruppo</Text>
          </ListItem>
        </List>
      </View>);

    return (
      <Root>
        <Container style={{ backgroundColor: '#dddddd' }}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => this.showActionSheet('avatar')}>
              <Image
                key="avatar"
                source={{uri: group.avatar}}
                style={{
                  height: 100,
                  width: Dimensions.get('window').width,
                  resizeMode: 'cover',
                }}
              />
            </TouchableOpacity>
            {content}
          </View>
        </Container>
      </Root>
    );
  }
}

const mapStateToProps = (state) => ({
  groups: state.groups,
  users: state.users,
});

export default connect(mapStateToProps)(GroupDetailsScreen);