import React, { Component } from "react";
import { 
  View,
  Text,
  StyleSheet
} from "react-native";
import { Container, Content, Card, CardItem, Body, H1, text } from 'native-base';

class MessageDetailsScreen extends Component {
  render() {
    const { title, body, timestamp } = this.props.navigation.getParam('message');

    return (
      <Container>
        <Content>
          <Card style={{ borderRadius: 10, overflow: 'hidden' }} >
            <CardItem>
              <H1> {title} </H1>
            </CardItem>
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