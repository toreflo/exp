import React, { Component } from "react";
import { 
  View,
  Text,
  StyleSheet
} from "react-native";

class GroupsScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>GroupsScreen</Text>
      </View>
    );
  }
}
export default GroupsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});