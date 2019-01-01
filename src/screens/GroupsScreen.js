import React, { Component } from 'react';
import { View, StyleSheet, ListView } from 'react-native';
import { 
  Container,
  Content,
  Fab,
  Spinner,
  Text,
  Icon,
  Card,
  CardItem,
  Body,
  Button,
  Left,
  Right,
} from 'native-base';
import firebase from 'firebase';
import Dialog from 'react-native-dialog';
import { connect } from 'react-redux';
import moment from 'moment';
import 'moment/locale/it';

import * as gbl from '../gbl';

class GroupsScreen extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {};
    this.goToDetails = this.goToDetails.bind(this);
    this.createGroup = this.createGroup.bind(this);
    this.showGroupDialog = this.showGroupDialog.bind(this);
    this.hideGroupDialog = this.hideGroupDialog.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({title: 'Chat gruppi'});
  }

  createGroup() {
    const { key } = firebase.database().ref('/groups/').push();
    firebase.database().ref('/groups/' + key).set({
      name: this.state.newGroupName,
      lastMessageTime: 0,
    })
      .then(() => this.hideGroupDialog())
      .catch((error) => {
        this.hideGroupDialog();
        alert(`${error.name}: ${error.message}`);
      });
  }

  sortGroups(a, b) {
    return (b.name < a.name);
  }

  goToDetails(group) {
    this.props.navigation.navigate(
      'ChatScreen',
      { group, admin: this.props.admin },
    );
  }

  showGroupDialog() {
    this.setState({showAddGroup: true});
  }

  hideGroupDialog() {
    this.setState({showAddGroup: false, newGroupName: ''}) 
  }

  render() {
    const getAdminSection = (data) => {
      if (this.props.admin) {
        return (
          <CardItem style={{justifyContent: 'flex-end'}}>
            <Right>
              <Button
                transparent
                onPress={() => this.props.navigation.navigate(
                  'GroupDetailsScreen',
                  { group: data },
                )}
              >
                <Icon type="Ionicons" name="md-cog" style={{fontSize: 20}}/>
              </Button>
            </Right>
          </CardItem>
        );
      }
      return null;
    } 
    const content = (
      <Content>
        <ListView
          style={{ padding: 15, paddingBottom: 75 }}
          enableEmptySections
          // dataSource={this.ds.cloneWithRows(this.state.groups)}
          dataSource={this.ds.cloneWithRows(this.props.groups.sort(this.sortGroups))}
          renderRow={(data) => {
            let info = null;
            if (!this.props.admin) {
              const userInfo = this.props.userGroups[data.key];
              info = <Text> {`${moment.unix(userInfo.lastMessageRead/1000).format('LLL')} (${userInfo.unread})`} </Text>
            }
            return (
              <Card style={{ borderRadius: 10, overflow: 'hidden' }}>
                <CardItem
                  button
                  onPress={ () => this.goToDetails(data) }
                >
                  <Body>
                    <Text> {data.name} </Text>
                    {info}
                  </Body>
                </CardItem>
                {getAdminSection(data)}
              </Card>
            );
          }}
        />
      </Content>
    );

    const fab = this.props.admin ? (
      <Fab
        active={true}
        direction="up"
        containerStyle={{ }}
        style={{ backgroundColor: '#5067FF' }}
        position="bottomRight"
        onPress={this.showGroupDialog}>
        <Icon type="Ionicons" name="ios-add" />
      </Fab>
    ) : null;

    return (
      <Container  style={{ backgroundColor: gbl.backgroundColor }}>
        <View style={{ flex: 1 }}>
          {content}
          {fab}
        </View>
        <View>
          <Dialog.Container visible={this.state.showAddGroup}>
            <Dialog.Title>Nuovo gruppo</Dialog.Title>
            <Dialog.Description>
              Scegli il nome del nuovo gruppo da creare:
            </Dialog.Description>
            <Dialog.Input 
              autoFocus={this.state.showAddGroup}
              onChangeText={(newGroupName) => this.setState({ newGroupName })}
              value={this.state.newGroupName}
            />
            <Dialog.Button label="Annulla" onPress={this.hideGroupDialog}/>
            <Dialog.Button label="Conferma" onPress={ this.createGroup }/>
          </Dialog.Container>
        </View>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  admin: state.info.admin,
  groups: state.groups,
  userGroups: state.info.admin ? undefined : state.users.find(user => user.key === state.info.uid).groups,
});

export default connect(mapStateToProps)(GroupsScreen);
