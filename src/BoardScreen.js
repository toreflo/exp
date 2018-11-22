import React, { Component } from "react";
import { StyleSheet } from "react-native";
import { 
  Container,
  Header,
  Content,
  Button,
  Text,
  Icon,
} from "native-base";

class BoardScreen extends Component {
  render() {
    return (
      <Container>
        <Header />
        <Content >
          <Text >BoardScreen</Text>
          <Button
            vertical
            onPress={ () => this.props.navigation.navigate('WriteMessageScreen') }
          >
            <Icon type="FontAwesome" name="home" />
          </Button>
        </Content>
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