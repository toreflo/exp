import React, { Component } from "react";
import { 
  View,
  Text,
  Button,
  StyleSheet
} from "react-native";

class GroupsScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>GroupsScreen</Text>
        <Button
          title="Details"
          onPress={ () => this.props.navigation.navigate('GroupDetailsScreen') }
        />
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