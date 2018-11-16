import React, { Component } from "react";
import { 
  View,
  Text,
  StyleSheet
} from "react-native";

class UserDetailsScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>UserDetailsScreen</Text>
      </View>
    );
  }
}
export default UserDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});