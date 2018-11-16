import React, { Component } from "react";
import { 
  View,
  Text,
  Button,
  StyleSheet
} from "react-native";

class LoginScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>LoginScreen</Text>
        <Button
          title="Valida il login"
          onPress={ () => this.props.navigation.navigate('HomeTabNavigator') }
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