import React, { Component } from "react";
import { 
  View,
  Text,
  Button,
  StyleSheet
} from "react-native";

class MessageGroupsScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>MessageGroupsScreen</Text>
        <Button
          title="+"
          onPress={ () => this.props.navigation.navigate('MessagesScreen') }
        />
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