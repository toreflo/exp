import React, { Component } from "react";
import { View, StyleSheet, ListView } from "react-native";
import { 
  Container,
  Content,
  Fab,
  List,
  Spinner,
  ListItem,
  Text,
  Button,
  Icon,
  Card,
  CardItem,
  Body,
  H1,
} from "native-base";
import moment from 'moment';
import 'moment/locale/it';
import firebase from 'firebase';

import * as gbl from '../gbl';

class BoardScreen extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      messages: [],
      loading: true,
    };
    this.db = firebase.database();
    this.goToDetails = this.goToDetails.bind(this);
    this.childAdded = this.childAdded.bind(this);
    this.childRemoved = this.childRemoved.bind(this);
    this.childChanged = this.childChanged.bind(this);
    this.sortMessages = this.sortMessages.bind(this);
    this.togglePinned = this.togglePinned.bind(this);
  }

  componentDidMount() {
    this.db.ref('/messages/board/').on('child_added', this.childAdded);
    this.db.ref('/messages/board/').on('child_removed', this.childRemoved);
    this.db.ref('/messages/board/').on('child_changed', this.childChanged);
  }

  componentWillUnmount() {
    this.db.ref('/messages/board/').off('child_added');
    this.db.ref('/messages/board/').off('child_removed');
    this.db.ref('/messages/board/').off('child_changed');
  }

  childAdded(snapshot) {
    const newState = {};
    if (this.state.loading) newState.loading = false;

    const newData = [...this.state.messages];
    newData.push(snapshot);
    newState.messages = newData.sort(this.sortMessages);
    this.setState(newState);
  }

  childChanged(snapshot) {
    const newData = [...this.state.messages];
    const idx = newData.findIndex(item => item.key === snapshot.key);
    if (idx !== -1) {
      newData[idx] = snapshot;
      this.setState({ messages: newData.sort(this.sortMessages) });
    }
  }
  
  childRemoved(snapshot) {
    const idx = this.state.messages.findIndex(user => user.key === snapshot.key);
    if (idx === -1) return;

    const newData = [...this.state.messages];
    newData.splice(idx, 1);
    this.setState({ messages: newData.sort(this.sortMessages) });
  }

  togglePinned(data) {
    this.db.ref().update({['/messages/board/' + data.key + '/pinned/']: !data.val().pinned})
      .catch((error) => {
        console.log(JSON.stringify(error));
        alert(`${error.name}: ${error.message}`);
      });
  }

  sortMessages(a, b) {
    if (a.val().pinned === b.val().pinned) return (b.val().creationTime - a.val().creationTime);
    if (a.val().pinned) return -1;
    return 1;
  }

  goToDetails(message) {
    this.props.navigation.navigate(
      'MessageDetailsScreen',
      { message },
    );
  }

  render() {
    const MAX_LEN = 100;
    let content;
    const spinner = (<Spinner />);
    const list = (
      <Content>
        <ListView
          style={{ padding: 15, paddingBottom: 75 }}
          dataSource={this.ds.cloneWithRows(this.state.messages)}
          renderRow={(data) => {
            const body = data.val().body.length > MAX_LEN ?
              data.val().body.substring(0, MAX_LEN) + '...' :
              data.val().body; 
            const right = (
              <Button
                transparent
                warning={data.val().pinned}
                light={!data.val().pinned}
                onPress={() => this.togglePinned(data)}
              >
                <Icon type="Ionicons" name="ios-star" style={{fontSize: 20}}/>
              </Button>
            );
  
            return (
              <Card style={{ borderRadius: 10, overflow: 'hidden' }}>
                <CardItem header>
                  <Body style={{alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                    <H1> {data.val().title} </H1>
                  </Body>
                  {right}
                </CardItem>
                <CardItem
                  button
                  onPress={ () => this.goToDetails(data) }
                >
                  <Body>
                    <Text> {body} </Text>
                  </Body>
                </CardItem>
                <CardItem style={{justifyContent: 'flex-end'}}>
                  <Text style={{fontSize: 10}}>
                    {moment.unix(data.val().creationTime/1000).format('LLL')} 
                  </Text>
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
      <Container style={{ backgroundColor: gbl.backgroundColor }}>
        <View style={{ flex: 1 }}>
          {content}
          <Fab
            active={true}
            direction="up"
            containerStyle={{ }}
            style={{ backgroundColor: '#5067FF' }}
            position="bottomRight"
            onPress={() => this.props.navigation.navigate('WriteMessageScreen')}>
            <Icon type="FontAwesome" name="pencil" />
          </Fab>
        </View>
      </Container>
    );
  }
}
export default BoardScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});