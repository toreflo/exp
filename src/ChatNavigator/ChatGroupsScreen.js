import React, { Component } from "react";
import { 
  View,
  Text,
  Button,
  StyleSheet
} from "react-native";

class ChatGroupsScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>ChatGroupsScreen</Text>
        <Button
          title="+"
          onPress={ () => this.props.navigation.navigate('ChatScreen') }
        />
      </View>
    );
  }
}
export default ChatGroupsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});