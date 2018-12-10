import React, { Component } from "react";
import { View, StyleSheet, ListView } from "react-native";
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
} from "native-base";
import 'moment/locale/it';
import firebase from 'firebase';
import Dialog from "react-native-dialog";

import * as gbl from '../gbl';

class ChatGroupsScreen extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      messages: [],
      groups: [],
      loading: true,
    };
    this.db = firebase.database();
    this.goToDetails = this.goToDetails.bind(this);
    this.childAdded = this.childAdded.bind(this);
    this.childRemoved = this.childRemoved.bind(this);
    this.childChanged = this.childChanged.bind(this);
    this.sortGroups = this.sortGroups.bind(this);
    this.createGroup = this.createGroup.bind(this);
    this.showGroupDialog = this.showGroupDialog.bind(this);
    this.hideGroupDialog = this.hideGroupDialog.bind(this);
  }

  componentDidMount() {
    this.db.ref('/groups/').on('child_added', this.childAdded);
    this.db.ref('/groups/').on('child_removed', this.childRemoved);
    this.db.ref('/groups/').on('child_changed', this.childChanged);
    this.db.ref('/dummy').once('value', (snapshot) => {
      if (this.state.loading) this.setState({loading: false});
    });
  }

  componentWillUnmount() {
    this.db.ref('/groups/').off('child_added');
    this.db.ref('/groups/').off('child_removed');
    this.db.ref('/groups/').off('child_changed');
  }

  childAdded(snapshot) {
    const newData = [...this.state.groups];
    newData.push(snapshot);
    this.setState({groups: newData.sort(this.sortGroups)});
  }

  childChanged(snapshot) {
    const newData = [...this.state.groups];
    const idx = newData.findIndex(item => item.key === snapshot.key);
    if (idx !== -1) {
      newData[idx] = snapshot;
      this.setState({ groups: newData.sort(this.sortGroups) });
    }
  }
  
  childRemoved(snapshot) {
    const idx = this.state.groups.findIndex(groups => groups.key === snapshot.key);
    if (idx === -1) return;

    const newData = [...this.state.groups];
    newData.splice(idx, 1);
    this.setState({ groups: newData.sort(this.sortGroups) });
  }

  createGroup() {
    const { key } = this.db.ref('/groups/').push();
    this.db.ref('/groups/' + key).set({
      name: this.state.newGroupName,
    })
      .then(() => this.hideGroupDialog())
      .catch((error) => {
        this.hideGroupDialog();
        alert(`${error.name}: ${error.message}`);
      });
  }

  sortGroups(a, b) {
    return (b.val().name < a.val().name);
  }

  goToDetails(group) {
    this.props.navigation.navigate(
      'ChatScreen',
      { group },
    );
  }

  showGroupDialog() {
    this.setState({showAddGroup: true});
  }

  hideGroupDialog() {
    this.setState({showAddGroup: false, newGroupName: ''}) 
  }

  render() {
    const MAX_LEN = 100;
    let content;
    const spinner = (<Spinner />);
    const list = (
      <Content>
        <ListView
          style={{ padding: 15, paddingBottom: 75 }}
          enableEmptySections
          dataSource={this.ds.cloneWithRows(this.state.groups)}
          renderRow={(data) => {
            return (
              <Card style={{ borderRadius: 10, overflow: 'hidden' }}>
                <CardItem
                  button
                  onPress={ () => this.goToDetails(data) }
                >
                  <Body>
                    <Text> {data.val().name} </Text>
                  </Body>
                </CardItem>
                <CardItem style={{justifyContent: 'flex-end'}}>
                  <Right>
                    <Button
                      transparent
                      onPress={() => this.props.navigation.navigate('GroupDetailsScreen', { group: data })}
                    >
                      <Icon type="Ionicons" name="md-cog" style={{fontSize: 20}}/>
                    </Button>
                  </Right>
                </CardItem>
              </Card>
            );
          }}
        />
      </Content>
    );

    if (this.state.loading) content = spinner;
    else content = list;

    return (
      <Container  style={{ backgroundColor: gbl.backgroundColor }}>
        <View style={{ flex: 1 }}>
          {content}
          <Fab
            active={true}
            direction="up"
            containerStyle={{ }}
            style={{ backgroundColor: '#5067FF' }}
            position="bottomRight"
            onPress={this.showGroupDialog}>
            <Icon type="Ionicons" name="ios-add" />
          </Fab>
        </View>
        <View>
          <Dialog.Container visible={this.state.showAddGroup}>
            <Dialog.Title>Nuovo gruppo</Dialog.Title>
            <Dialog.Description>
              Scegli il nome del nuovo gruppo da creare:
            </Dialog.Description>
            <Dialog.Input 
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
export default ChatGroupsScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});