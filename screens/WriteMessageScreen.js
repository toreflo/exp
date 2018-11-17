import React, { Component } from "react";
import { 
  View,
  Text,
  StyleSheet
} from "react-native";

class WriteMessageScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>WriteMessageScreen</Text>
      </View>
    );
  }
}
export default WriteMessageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});