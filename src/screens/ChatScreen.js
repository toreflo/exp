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

class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {};
    this.db = firebase.database();
  }

  render() {
    const messages = this.props.messages ? this.props.messages : [];
    const content = (
      <Content>
        <ListView
          removeClippedSubviews={false}
          enableEmptySections
          style={{ padding: 15, paddingBottom: 75 }}
          dataSource={this.ds.cloneWithRows(messages)}
          renderRow={(data) => {
            return (
              <Card style={{ borderRadius: 10, overflow: 'hidden' }}>
                <CardItem>
                  <Body>
                    <Text> {data.body} </Text>
                  </Body>
                </CardItem>
                <CardItem style={{justifyContent: 'flex-end'}}>
                  <Text style={{fontSize: 10}}>
                    {/* {moment.unix(data.creationTime/1000).format('LLL')}  */}
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
          <Fab
            active={true}
            direction="up"
            containerStyle={{ }}
            style={{ backgroundColor: '#5067FF' }}
            position="bottomRight"
            onPress={() => this.props.navigation.navigate('xxx')}>
            <Icon type="FontAwesome" name="pencil" />
          </Fab>
        </View>
      </Container>
    );
  }
}
const mapStateToProps = (state, ownProps) => ({
  messages: state.groupMessages[ownProps.navigation.getParam('group', {}).key],
});

export default connect(mapStateToProps)(ChatScreen);
