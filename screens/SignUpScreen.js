import React, { Component } from "react";
import { 
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet
} from "react-native";
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
      <View style={styles.container}>
        <Text>SignUpScreen</Text>
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
          title="Crea account"
          onPress={this.register}
        />
      </View>
    );
  }
}

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});