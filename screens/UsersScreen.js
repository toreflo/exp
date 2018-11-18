import React, { Component } from "react";
import { 
  View,
  ListView,
  StyleSheet
} from "react-native";
import { Container, Header, Content, Button, Icon, List, ListItem, Text } from 'native-base';

const datas = [
  'Simon Mignolet',
  'Nathaniel Clyne',
  'Dejan Lovren',
  'Mama Sakho',
  'Alberto Moreno',
  'Emre Can',
  'Joe Allen',
  'Phil Coutinho',
  'Simon Mignolet',
  'Nathaniel Clyne',
  'Dejan Lovren',
  'Mama Sakho',
  'Alberto Moreno',
  'Emre Can',
  'Joe Allen',
  'Phil Coutinho',
  'Simon Mignolet',
  'Nathaniel Clyne',
  'Dejan Lovren',
  'Mama Sakho',
  'Alberto Moreno',
  'Emre Can',
  'Joe Allen',
  'Phil Coutinho',
];

class UsersScreen extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      basic: true,
      ListViewData: datas,
    };
  }
  deleteRow(secId, rowId, rowMap) {
    rowMap[`${secId}${rowId}`].props.closeRow();
    const newData = [...this.state.ListViewData];
    newData.splice(rowId, 1);
    this.setState({ ListViewData: newData });
  }
  render() {
    return (
      <Container>
        <Content>
          <List
            leftOpenValue={75}
            rightOpenValue={-75}
            dataSource={this.ds.cloneWithRows(this.state.ListViewData)}
            renderRow={(data) => (
              <ListItem onPress={() => this.props.navigation.navigate(
                'UserDetailsScreen',
                { user: data },
                )}
              >
                <Text> {data} </Text>
              </ListItem>
            )}
            renderLeftHiddenRow={(data) => (
              <Button full onPress={() => alert(data)}>
                <Icon active name="information-circle" />
              </Button>
            )}
            renderRightHiddenRow={(data, secId, rowId, rowMap) => (
              <Button full danger onPress={() => this.deleteRow(secId, rowId, rowMap)}>
                <Icon active name="trash" />
              </Button>
            )}
          />
        </Content>
      </Container>
    );
  }
}
export default UsersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});