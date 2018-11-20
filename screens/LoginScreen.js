import React, { Component } from "react";
import { 
  View,
  Text,
  Button,
  TextInput,
  Alert,
  StyleSheet
} from "react-native";
import firebase from 'firebase';

class LoginScreen extends Component {
  constructor() {
    super();

    this.state = {
      email: '',
      password: '',
    }

    this.login = this.login.bind(this);
  }

  login() {
    const { email, password } = this.state;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((user) => {
      })
      .catch((error) => {
        const { code, message } = error;
        Alert.alert(code, message);
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>LoginScreen</Text>
        <TextInput
          placeholder="username"
          onChangeText={(email) => this.setState({ email })}
          value={ this.state.email }
          autoCapitalize="none"
        />
        <TextInput
          placeholder="password"
          onChangeText={(password) => this.setState({ password })}
          value={ this.state.password }
          autoCapitalize="none"
          secureTextEntry
        />
        <Button
          title="login"
          onPress={this.login}
        />
      </View>
    );
  }
}
export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});