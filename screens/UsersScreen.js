import React, { Component } from "react";
import { 
  View,
  Text,
  Button,
  StyleSheet
} from "react-native";

class UsersScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>UsersScreen</Text>
        <Button
          title="Details"
          onPress={ () => this.props.navigation.navigate('UserDetailsScreen') }
        />
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