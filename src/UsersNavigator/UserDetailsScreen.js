import React, { Component } from "react";
import { 
  View,
  Text,
  StyleSheet
} from "react-native";

class UserDetailsScreen extends Component {
  render() {
    const name = this.props.navigation.getParam('user');

    return (
      <View style={styles.container}>
        <Text>{name}</Text>
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