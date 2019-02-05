import React, { Component } from "react";
import { 
  View,
  StyleSheet
} from "react-native";
import { Container, Content, Card, CardItem, Body, Text } from 'native-base';

import * as gbl from '../gbl';

class MessageDetailsScreen extends Component {
  componentDidMount() {
    const { title } = this.props.navigation.getParam('message');
    let headerTitle = [<Text key={1}>{title}</Text>];
    this.props.navigation.setParams({ title: headerTitle});
  }
  
  render() {
    const { body, timestamp } = this.props.navigation.getParam('message');

    return (
      <Container style={{ backgroundColor: gbl.backgroundColor }}>
        <Content style={{ padding: 15, paddingBottom: 75 }} >
          <Card style={{ borderRadius: 10, overflow: 'hidden' }} >
            <CardItem>
              <Body>
                <Text> {body} </Text>
              </Body>
            </CardItem>
            <CardItem footer>
              <Text> {timestamp} </Text>
            </CardItem>
          </Card>
        </Content>
      </Container>
    );
  }
}
export default MessageDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});