import React, { Component } from "react";
import { 
  View,
  Text,
  StyleSheet
} from "react-native";

class UserDetailsScreen extends Component {
  render() {
    const { name, surname, email } = this.props.navigation.getParam('user');

    return (
      <View style={styles.container}>
        <Text>{name}</Text>
        <Text>{surname}</Text>
        <Text>{email}</Text>
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