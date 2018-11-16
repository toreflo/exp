import React, { Component } from "react";
import { 
  View,
  Text,
  StyleSheet
} from "react-native";

class BoardScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>BoardScreen</Text>
        
      </View>
    );
  }
}
export default BoardScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});