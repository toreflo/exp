import React, { Component } from "react";
import { 
  View,
  Text,
  StyleSheet
} from "react-native";

class UsersScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>UsersScreen</Text>
      </View>
    );
  }
}
export default UsersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});