import React, { Component } from "react";
import { 
  View,
  Text,
  Button,
  Alert,
  StyleSheet
} from "react-native";
import firebase from 'firebase';

class LogoutScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>LogoutScreen</Text>
        <Button
          title="logout"
          onPress={() => {
            firebase.auth().signOut()
             .catch((error) => {
               const { code, message } = error;
               Alert.alert(code, message);
             });
          }}
        />
      </View>
    );
  }
}
export default LogoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});