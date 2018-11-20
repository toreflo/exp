import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import firebase from 'firebase';

import { WelcomeStackNavigator, AppDrawerNavigator} from './screens/Navigator.js';
import config from './config';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
    };
  }

  componentWillMount() {
    firebase.initializeApp(config.firebaseConfig);
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
    if (this.state.loading) return (<View style={styles.container}><Text>Loading...</Text></View>);

    // The user is an Object, so they're logged in
    if (this.state.user) return (<AppDrawerNavigator />);

    // The user is null, so they're logged out
    return (<WelcomeStackNavigator />);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
