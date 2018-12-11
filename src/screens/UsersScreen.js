import React, { Component } from 'react';
import { connect } from 'react-redux';
import { 
  View,
  ListView,
  StyleSheet
} from 'react-native';
import {
  Container,
  Header,
  Left,
  Right,
  Button,
  Icon,
  List,
  Spinner,
  ListItem,
  Text,
  Body,
  Segment,
  Fab,
} from 'native-base';
import firebase from 'firebase';

import config from '../../config';

class UsersScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const activeSegment = navigation.getParam('activeSegment', 'users');
    return {
      header: (
        <Header hasSegment>
          <Left />
          <Body>
            <Segment>
              <Button
                first
                active={ activeSegment === 'users' }
                onPress={ () => navigation.setParams({ activeSegment: 'users' }) }
              >
                <Text>Utenti</Text>
              </Button>
              <Button
                last
                active={ activeSegment === 'groups' }
                onPress={ () => navigation.setParams({ activeSegment: 'groups' }) }
              >
                <Text>Gruppi</Text>
              </Button>
            </Segment>
          </Body>
          <Right />
        </Header>
      ),
    }
  };

  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      newUser: '',
    };
    this.db = firebase.database();
    this.addUser = this.addUser.bind(this);
  }

  addUser() {
    this.props.navigation.navigate('AddUserScreen');
  }

  async deleteRow(data, secId, rowId, rowMap) {
    rowMap[`${secId}${rowId}`].props.closeRow();

    firebase.auth().currentUser.getIdToken(true)
      .then((idToken) => fetch(
        config.httpURL, 
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'deleteUser',
            idToken,
            uid: data.key,
          }),
        }))
      .then((response) => response.json())
      .then((responseJson) => alert(responseJson.message))
      .catch((error) => alert(`${error.name}: ${error.message}`));
  }

  render() {
    const content = (
      <List
        style={{ paddingTop: 24 }}
        leftOpenValue={75}
        rightOpenValue={-75}
        dataSource={this.ds.cloneWithRows(this.props.users)}
        renderRow={(data) => (
          <ListItem onPress={() => this.props.navigation.navigate(
            'UserDetailsScreen',
            { user: data },
            )}
          >
            <Text> {`${data.name} ${data.surname}`} </Text>
          </ListItem>
        )}
        renderLeftHiddenRow={(data, secId, rowId, rowMap) => (
          <Button full onPress={() => {
            alert(data);
            rowMap[`${secId}${rowId}`].props.closeRow();
          }}>
            <Icon active name="information-circle" />
          </Button>
        )}
        renderRightHiddenRow={(data, secId, rowId, rowMap) => (
          <Button full danger onPress={() => this.deleteRow(data, secId, rowId, rowMap)}>
            <Icon active name="trash" />
          </Button>
        )}
      />);

    return (
      <Container>
        <View style={{ flex: 1 }}>
          {content}
          <Fab
            active={true}
            direction="up"
            containerStyle={{ }}
            style={{ backgroundColor: '#5067FF' }}
            position="bottomRight"
            onPress={() => this.props.navigation.navigate('AddUserScreen')}>
            <Icon type="FontAwesome" name="user-plus" />
          </Fab>
        </View>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  users: state.users,
});

export default connect(mapStateToProps)(UsersScreen);
