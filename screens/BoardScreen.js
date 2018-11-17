import React, { Component } from "react";
import { 
  View,
  Text,
  Button,
  StyleSheet
} from "react-native";

class BoardScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>BoardScreen</Text>
        <Button
          title="+"
          onPress={ () => this.props.navigation.navigate('WriteMessageScreen') }
        />
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