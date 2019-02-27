import React, { Component } from 'react';
import { 
  View,
  ListView,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Container,
  Button,
  Icon,
  List,
  ListItem,
  Text,
  Fab,
  ActionSheet,
  Root,
} from 'native-base';
import firebase from 'firebase';
import Dialog from 'react-native-dialog';
import { connect } from 'react-redux';

import * as fileStorage from '../lib/fileStorage';
import * as actions from '../actions';

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
    this.upload = this.upload.bind(this);
    this.pickFromGallery = this.pickFromGallery.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({title: name});
  }
  
  componentDidMount() {
    const { name } = this.props.navigation.getParam('group');
    this.props.navigation.setParams({ title: name });
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

  render() {
    const options = ['Modifica immagine', 'Annulla'];
    const CHANGE_IMAGE_IDX = 0;
    const CANCEL_IDX = 1;
    const { key: groupKey } = this.props.navigation.getParam('group');
    const group = this.props.groups.find(item => item.key === groupKey);
    const users = this.getGroupUsers();
    const content = (
      <View style={{ paddingTop: 24 }}>
        <Text style={{ padding: 5, color: '#9e9e9e', fontSize: 12 }}>{`${users.length} PARTECIPANTI`}</Text>
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
            <Button full danger onPress={() => this.deleteUser(data, secId, rowId, rowMap)}>
              <Icon active name="trash" />
            </Button>
          )}
        />
        
        <List style={{ paddingTop: 24, paddingLeft: 0, marginLeft: 0 }}>
          <ListItem
            style={{ paddingLeft: 0, marginLeft: 0, backgroundColor: 'white' }}
            onPress={this.showConfirmDialog}
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
              onPress={() => ActionSheet.show({
                options,
                cancelButtonIndex: CANCEL_IDX,
                // title: "Testing ActionSheet"
              },
              (buttonIndex) => {
                if (buttonIndex === CHANGE_IMAGE_IDX) {
                  this.pickFromGallery();
                }
              },
            )}>
              <Image
                key="avatar"
                // source={{uri: `https://via.placeholder.com/${Dimensions.get('window').width}?text=group`}}
                source={{uri: group.avatar}}
                style={{
                  height: 100,
                  width: Dimensions.get('window').width,
                  resizeMode: 'cover',
                }}
              />
            </TouchableOpacity>
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
      </Root>
    );
  }
}

const mapStateToProps = (state) => ({
  groups: state.groups,
  users: state.users,
});

export default connect(mapStateToProps)(GroupDetailsScreen);