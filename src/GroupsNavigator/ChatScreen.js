import React, { Component } from "react";
import { 
  View,
  Text,
  StyleSheet
} from "react-native";

class ChatScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>ChatScreen</Text>
      </View>
    );
  }
}
export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});