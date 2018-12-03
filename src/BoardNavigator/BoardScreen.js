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
import firebase from 'firebase';

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
  }

  componentDidMount() {
    this.db.ref('/messages/board/').on('child_added', (snapshot) => {
      if (snapshot.val() && snapshot.val().exists) return;

      const newState = {};
      if (this.state.loading) newState.loading = false;
  
      const newData = [...this.state.messages];
      newData.push(snapshot);
      newState.messages = newData;
      this.setState(newState);
    });
    this.db.ref('/messages/board/').on('child_removed', (snapshot) => {
      const idx = this.state.messages.findIndex(user => user.key === snapshot.key);
      if (idx === -1) return;

      const newData = [...this.state.messages];
      newData.splice(idx, 1);
      this.setState({ messages: newData });
    });
  }

  componentWillUnmount() {
    this.db.ref('/messages/board/').off('child_added');
    this.db.ref('/messages/board/').off('child_removed');
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
        style={{ paddingTop: 24 }}
        dataSource={this.ds.cloneWithRows(this.state.messages)}
        renderRow={(data) => {
          const body = data.val().body.length > MAX_LEN ?
            data.val().body.substring(0, MAX_LEN) + '...' :
            data.val().body; 
          return (
            <Card style={{ borderRadius: 10, overflow: 'hidden' }}>
              <CardItem header>
                <H1> {data.val().title} </H1>
              </CardItem>
              <CardItem
                button
                onPress={ () => this.goToDetails(data.val()) }
              >

                <Body>
                  <Text> {body} </Text>
                </Body>
              </CardItem>
              <CardItem footer>
                <Text> {data.val().timestamp} </Text>
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
      <Container>
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