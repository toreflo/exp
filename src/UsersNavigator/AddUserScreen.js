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

class AddUserScreen extends Component {
  constructor() {
    super();

    this.state = {
      name: '',
      surname: '',
      email: '',
      password: '',
    }

    this.addUser = this.addUser.bind(this);
  }

  addUser() {
    const URL = 'https://us-central1-exp-app-6cbc4.cloudfunctions.net/createUser';
    const { email, password, name, surname } = this.state;

    firebase.auth().currentUser.getIdToken(true)
      .then((idToken) => fetch(
        URL, 
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken,
            name,
            surname,
            email,
            password,
          }),
        }))
      .then((response) => response.json())
      .then((responseJson) => alert(responseJson.message))
      .catch((error) => alert(`${error.name}: ${error.message}`));
  }

  render() {
    return (
      <Container style={styles.container} >
        <Form>
          <Item floatingLabel>
            <Label>Nome</Label>
            <Input
              autoCorrect={false}
              onChangeText={(name) => this.setState({ name })}
              value={this.state.name}

            />
          </Item>
          <Item floatingLabel>
            <Label>Cognome</Label>
            <Input
              autoCorrect={false}
              onChangeText={(surname) => this.setState({ surname })}
              value={this.state.surname}

            />
          </Item>
          <Item floatingLabel>
            <Label>Email</Label>
            <Input
              autoCorrect={false}
              autoCapitalize="none"
              onChangeText={(email) => this.setState({ email })}
              value={this.state.email}

            />
          </Item>
          <Item floatingLabel>
            <Label>Password</Label>
            <Input
              secureTextEntry
              autoCorrect={false}
              autoCapitalize="none"
              onChangeText={(password) => this.setState({ password })}
              value={this.state.password}

            />
          </Item>
          <Button
            style={{ marginTop: 10 }}
            full
            rounded
            success
            onPress={this.addUser}
          >
            <Text>Crea utente</Text>
          </Button>
        </Form>
      </Container>
    );
  }
}
export default AddUserScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    justifyContent: 'center'
  }
});