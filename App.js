import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Spinner } from 'native-base';
import firebase from 'firebase';
import { Font } from "expo";

import { HomeNavigator, WelcomeNavigator, pippo } from './src/navigators';
import config from './config';
import * as gbl from './src/gbl';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
    };
  }

  async componentWillMount() {
    const firebaseApp = firebase.initializeApp(config.firebaseConfig);
    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
    });
  }

  /**
   * When the App component mounts, we listen for any authentication
   * state changes in Firebase. 
   */
  componentDidMount() {
    this.authRemoveSubscription = firebase.auth().onAuthStateChanged((user) => {
      this.setState({
        loading: false,
        user,
      });
    });
  }

  /* Stop listening for authentication state changes
   * when the component unmounts.
   */
  componentWillUnmount() {
    this.authRemoveSubscription();
  }


  render() {
    if (this.state.loading) return (
      <View style={styles.container}>
        <Spinner />
      </View>
    );

    // The user is an Object, so they're logged in
    // if (this.state.user) return (<AppDrawerNavigator />);
    if (this.state.user) return (<HomeNavigator />);

    // The user is null, so they're logged out
    return (<WelcomeNavigator />);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gbl.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
