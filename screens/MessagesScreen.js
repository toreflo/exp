import React, { Component } from "react";
import { 
  View,
  Text,
  StyleSheet
} from "react-native";

class MessagesScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>MessagesScreen</Text>
      </View>
    );
  }
}
export default MessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});