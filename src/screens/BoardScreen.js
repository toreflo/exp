import React, { Component } from 'react';
import { View, StyleSheet, ListView } from 'react-native';
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
} from 'native-base';
import moment from 'moment';
import 'moment/locale/it';
import firebase from 'firebase';
import { connect } from 'react-redux';

import * as gbl from '../gbl';

class BoardScreen extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {};
    this.db = firebase.database();
    this.goToDetails = this.goToDetails.bind(this);
    this.sortMessages = this.sortMessages.bind(this);
    this.togglePinned = this.togglePinned.bind(this);
  }

  togglePinned(data) {
    this.db.ref().update({['/messages/board/' + data.key + '/pinned/']: !data.pinned})
      .catch((error) => {
        console.log(JSON.stringify(error));
        alert(`${error.name}: ${error.message}`);
      });
  }

  sortMessages(a, b) {
    if (a.pinned === b.pinned) return (b.creationTime - a.creationTime);
    if (a.pinned) return -1;
    return 1;
  }

  goToDetails(message) {
    this.props.navigation.navigate(
      'MessageDetailsScreen',
      { message, admin: this.props.admin },
    );
  }

  render() {
    const MAX_LEN = 100;
    const fab = this.props.admin ? (
      <Fab
        active={true}
        direction="up"
        containerStyle={{ }}
        style={{ backgroundColor: '#5067FF' }}
        position="bottomRight"
        onPress={() => this.props.navigation.navigate('WriteMessageScreen')}>
        <Icon type="FontAwesome" name="pencil" />
      </Fab>
    ) : null;

    const content = (
      <Content>
        <ListView
          removeClippedSubviews={false}
          enableEmptySections
          style={{ padding: 15, paddingBottom: 75 }}
          dataSource={this.ds.cloneWithRows(this.props.messages.sort(this.sortMessages))}
          renderRow={(data) => {
            const body = data.body.length > MAX_LEN ?
              data.body.substring(0, MAX_LEN) + '...' :
              data.body; 
            const right = (
              <Button
                transparent
                warning={data.pinned}
                light={!data.pinned}
                onPress={() => {
                  if (this.props.admin) this.togglePinned(data);
                }}
              >
                <Icon type="Ionicons" name="ios-star" style={{fontSize: 20}}/>
              </Button>
            );
  
            return (
              <Card style={{ borderRadius: 10, overflow: 'hidden' }}>
                <CardItem header>
                  <Body style={{alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                    <H1> {data.title} </H1>
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
                    {moment.unix(data.creationTime/1000).format('LLL')} 
                  </Text>
                </CardItem>
              </Card>
            );
          }}
        />
      </Content>
    );

    return (
      <Container style={{ backgroundColor: gbl.backgroundColor }}>
        <View style={{ flex: 1 }}>
          {content}
          {fab}
        </View>
      </Container>
    );
  }
}
const mapStateToProps = (state) => ({
  admin: state.info.admin,
  messages: state.boardMessages,
});

export default connect(mapStateToProps)(BoardScreen);
