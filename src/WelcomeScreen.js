import React, { Component } from "react";
import { 
  View,
  Text,
  Button,
  StyleSheet
} from "react-native";

class WelcomeScreen extends Component {
  static navigationOptions = {
    header: null,
  };

  render() {
    return (
      <View style={styles.container}>
        <Text>WelcomeScreen</Text>
        <Button
          title="Esegui l'accesso"
          onPress={ () => this.props.navigation.navigate('LoginScreen') }
        />
        <Button
          title="Registrati"
          onPress={ () => this.props.navigation.navigate('SignUpScreen') }
        />
      </View>
    );
  }
}
export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});