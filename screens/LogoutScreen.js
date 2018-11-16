import React, { Component } from "react";
import { 
  View,
  Text,
  StyleSheet
} from "react-native";

class LogoutScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>LogoutScreen</Text>
      </View>
    );
  }
}
export default LogoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});