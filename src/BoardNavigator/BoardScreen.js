import React, { Component } from "react";
import { View, StyleSheet, ListView } from "react-native";
import { 
  Container,
  Fab,
  List,
  Spinner,
  ListItem,
  Text,
  Button,
  Icon,
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
  }

  componentDidMount() {
    this.db.ref('/messages/board/').on('child_added', (snapshot) => {
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

  render() {

    let content;
    const spinner = (<Spinner />);
    const list = (
      <List
        style={{ paddingTop: 24 }}
        rightOpenValue={-75}
        dataSource={this.ds.cloneWithRows(this.state.messages)}
        renderRow={(data) => (
          <ListItem onPress={() => this.props.navigation.navigate(
            'MessageDetailScreen',
            { message: data.val() },
            )}
          >
            <Text> {data.val().title} </Text>
          </ListItem>
        )}
        renderRightHiddenRow={(data, secId, rowId, rowMap) => (
          <Button full danger onPress={() => {}}>
            <Icon active name="trash" />
          </Button>
        )}
      />);
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