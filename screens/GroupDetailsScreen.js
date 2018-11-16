import React, { Component } from "react";
import { 
  View,
  Text,
  StyleSheet
} from "react-native";

class GroupDetailsScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>GroupDetailsScreen</Text>
      </View>
    );
  }
}
export default GroupDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});