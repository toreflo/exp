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
import 'moment/locale/it';
import firebase from 'firebase';
import Dialog from 'react-native-dialog';
import { connect } from 'react-redux';

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

  createGroup() {
    const { key } = firebase.database().ref('/groups/').push();
    firebase.database().ref('/groups/' + key).set({
      name: this.state.newGroupName,
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
          // dataSource={this.ds.cloneWithRows(this.state.groups)}
          dataSource={this.ds.cloneWithRows(this.props.groups.sort(this.sortGroups))}
          renderRow={(data) => {
            return (
              <Card style={{ borderRadius: 10, overflow: 'hidden' }}>
                <CardItem
                  button
                  onPress={ () => this.goToDetails(data) }
                >
                  <Body>
                    <Text> {data.name} </Text>
                  </Body>
                </CardItem>
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
  groups: state.groups,
});

export default connect(mapStateToProps)(GroupsScreen);
