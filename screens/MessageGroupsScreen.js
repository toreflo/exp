import React, { Component } from "react";
import { 
  View,
  Text,
  StyleSheet
} from "react-native";

class MessageGroupsScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>MessageGroupsScreen</Text>
      </View>
    );
  }
}
export default MessageGroupsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});