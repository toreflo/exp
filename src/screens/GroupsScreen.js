import React, { Component } from 'react';
import { View, Image, FlatList } from 'react-native';
import { 
  Container,
  Content,
  Fab,
  Text,
  Icon,
  Card,
  CardItem,
  Button,
  Right,
  Badge,
  Grid,
  Col,
  Row,
} from 'native-base';
import firebase from 'firebase';
import Dialog from 'react-native-dialog';
import { connect } from 'react-redux';
import moment from 'moment';
import 'moment/locale/it';

import * as gbl from '../gbl';

const getTimeRefs = () => {
  const now = moment();
  const today = now.clone().startOf('day');
  const yesterday = now.clone().subtract(1, 'days').startOf('day');
  const aWeekAgo = now.clone().subtract(7, 'days').startOf('day');

  return { today, yesterday, aWeekAgo };
}
const isToday = (timestamp) => moment(timestamp).isSame(getTimeRefs().today, 'd');
const isYesterday = (timestamp) => moment(timestamp).isSame(getTimeRefs().yesterday, 'd');
const isWithinAWeek = (timestamp) => moment(timestamp).isAfter(getTimeRefs().aWeekAgo, 'd');

class GroupsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.goToDetails = this.goToDetails.bind(this);
    this.createGroup = this.createGroup.bind(this);
    this.showGroupDialog = this.showGroupDialog.bind(this);
    this.hideGroupDialog = this.hideGroupDialog.bind(this);
    this.renderMessage = this.renderMessage.bind(this);
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
  
  getAdminSection = (data) => {
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

  renderMessage (data) {
    const MAX_LEN = 25;
    let info = null;
    let lastMessageText;
    const messages = this.props.messages[data.key];
    let timeInfo;
    if (messages && messages.length) {
      const lastMessage = messages[messages.length - 1];
      lastMessageText = lastMessage.text;
      if (lastMessage.text.length > MAX_LEN) {
        lastMessageText = lastMessage.text.substring(0, MAX_LEN) + '...'; 
      }
      if (isToday(lastMessage.createdAt)) timeInfo = moment(lastMessage.createdAt).format('LT');
      else if (isYesterday(lastMessage.createdAt)) timeInfo = 'Ieri';
      else if (isWithinAWeek(lastMessage.createdAt)) timeInfo = moment(lastMessage.createdAt).format('dddd');
      else timeInfo = moment(lastMessage.createdAt).calendar();
    }

    return (
      <Card style={{ borderRadius: 10, overflow: 'hidden' }}>
        <CardItem
          button
          onPress={ () => this.goToDetails(data) }
        >
          <Image
            key="avatar"
            source={{uri: 'https://via.placeholder.com/80?text=group'}}
            style={{
              height: 50,
              width: 50,
              borderRadius: 50/2,
            }}
          />
          <Grid style={{ marginLeft: 15 }}>
            <Row>
              <Col><Text style={{ fontSize: 15, fontWeight: 'bold' }}>{data.name}</Text></Col>
              <Col><Text style={{ textAlign: 'right', color: '#959595' }}>{timeInfo}</Text></Col>
            </Row>
            <Row>
              <Text style={{ marginTop: 12, color: '#959595' }}>{lastMessageText}</Text>
            </Row>
          </Grid>
          {info}
        </CardItem>
      </Card>
    );
  }

  render() {
    const content = (
      <Content>
        <FlatList
          style={{ padding: 15, paddingBottom: 75 }}
          enableEmptySections
          data={this.props.groups.sort(this.sortGroups)}
          renderItem={({ item: data }) => this.renderMessage(data)}
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

const mapStateToProps = (state) => {
  const userGroups = state.info.admin ? undefined :
    state.users.find(user => user.key === state.info.uid).groups;
  const groupKeys = state.info.admin ?
    state.groups.map(group => group.key) :
    Object.keys(userGroups);

  return {
    admin: state.info.admin,
    groups: state.groups,
    userGroups,
    messages: state.groupMessages,
  };
};

export default connect(mapStateToProps)(GroupsScreen);
