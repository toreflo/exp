import React, { Component } from "react";
import { 
  Alert,
  StyleSheet
} from "react-native";
import {
  Container,
  Form,
  Item,
  Label,
  Input,
  Text,
  Button,
} from "native-base";
import firebase from 'firebase';

class SignUpScreen extends Component {
  constructor() {
    super();

    this.state = {
      email: '',
      password: '',
    }

    this.register = this.register.bind(this);
  }

  register() {
    const { email, password } = this.state;
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((user) => {
      })
      .catch((error) => {
        const { code, message } = error;
        Alert.alert(code, message);
      });
  }

  render() {
    return (
      <Container style={styles.container} >
        <Form>
          <Item floatingLabel>
            <Label>Email</Label>
            <Input
              autoCorrect={false}
              autoCapitalize="none"
              onChangeText={(email) => this.setState({ email })}
            />
          </Item>
          <Item floatingLabel>
            <Label>Password</Label>
            <Input
              secureTextEntry
              autoCorrect={false}
              autoCapitalize="none"
              onChangeText={(password) => this.setState({ password })}
            />
          </Item>
          <Button
            style={{ marginTop: 10 }}
            full
            rounded
            primary
            onPress={this.register}
          >
            <Text>Registrati</Text>
          </Button>
        </Form>
      </Container>
    );
  }
}

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    justifyContent: 'center'
  }
});