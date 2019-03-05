import React, { Component } from 'react';
import { 
  View,
  ListView,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Content,
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

  removeUser(user) {
    const { key: groupKey } = this.props.navigation.getParam('group');

    const updates = {};
    updates[`/users/${user.key}/groups/${groupKey}`] = null;
    updates[`/groups/${groupKey}/users/${user.key}`] = null;
  
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

  showActionSheet(mode, data) {
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
        options: [`Rimuovi l\'utente ${data.name} ${data.surname}`, 'Annulla'],
        action: () => this.removeUser(data),
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
    const listItems = [].concat(
      { itemType: 'addUser' },
      { itemType: 'truncate' },
      users,
      { itemType: 'delete' },
    );
    const content = (
      <View style={{ paddingTop: 24, paddingBottom: 24 }}>
        <Text style={{ padding: 5, color: '#9e9e9e', fontSize: 12 }}>{`${users.length} PARTECIPANTI`}</Text>
        <List
          removeClippedSubviews={false}
          enableEmptySections
          // disableRightSwipe
          // disableLeftSwipe
          dataSource={this.ds.cloneWithRows(listItems)}
          renderRightHiddenRow={(data, secId, rowId, rowMap) => (
            <Button full danger onPress={() => this.removeUser(data, secId, rowId, rowMap)}>
              <Icon active name="trash" />
            </Button>
          )}
          renderRow={(data) => {
            if (data.itemType === 'addUser') {
              return (
                <ListItem style={{ paddingLeft: 5 }}>
                  <View style={{ flex: 1 }}>
                    <TouchableOpacity onPress={() => {
                      this.props.navigation.navigate(
                        'UserToGroupScreen',
                        { group, mode: 'ADD' },
                      ); 
                    }}>
                      <View style={{ flexDirection: 'row' }}>
                        <Icon type="Ionicons" name="ios-add-circle-outline" style={{ color: nativeBaseTheme.brandPrimary }} />
                        <Text style={{ color: nativeBaseTheme.brandPrimary, paddingLeft: 10 }}>Aggiungi partecipanti</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </ListItem>
              );
            } else if (data.itemType === 'truncate') {
              return (
                <ListItem style={{ paddingLeft: 5 }}>
                  <View style={{ flex: 1 }}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate(
                      'UserToGroupScreen',
                      { group, mode: 'REMOVE' },
                    )}>
                      <View style={{ flexDirection: 'row' }}>
                        <Icon type="Ionicons" name="ios-remove-circle-outline" style={{ color: nativeBaseTheme.brandDanger }} />
                        <Text style={{ color: nativeBaseTheme.brandDanger, paddingLeft: 10 }}>Rimuovi partecipanti</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </ListItem>
              );
            } else if (data.itemType === 'delete') {
              return ([
                <ListItem key={0} itemDivider />,
                <ListItem
                  key={1}
                  style={{ paddingLeft: 5 }}
                >
                  <View style={{ flex: 1 }}>
                    <TouchableOpacity onPress={() => this.showActionSheet('removeGroup')}>
                      <View style={{ flexDirection: 'row' }}>
                        <Icon type="Ionicons" name="ios-trash" style={{ color: nativeBaseTheme.brandDanger }} />
                        <Text style={{ color: nativeBaseTheme.brandDanger, paddingLeft: 10 }}>Elimina gruppo</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  {/* <Text style={{ color: nativeBaseTheme.brandDanger }}>Elimina gruppo</Text> */}
                </ListItem>
              ]);
            } else {
              return (
                <ListItem onPress={() => this.showActionSheet('removeUser', data)}>
                  <Text> {`${data.name} ${data.surname}`} </Text>
                </ListItem>
              );
            }
          }}
        />
      </View>
    );

    return (
      <Root>
        <Container style={{ backgroundColor: '#dddddd' }}>
          <Content>
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
            </View>
            {content}
          </Content>
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