import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Spinner } from 'native-base';
import firebase from 'firebase';
import { Font } from "expo";
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';

import { HomeNavigator, WelcomeNavigator, pippo } from './src/navigators';
import config from './config';
import * as gbl from './src/gbl';
import rootReducer from './src/reducers';
import { addUser, delUser, logout } from './src/actions';

const store = createStore(rootReducer);

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
      const newState = {
        loading: false,
        user,
      };
      if (user) {
        /* let currentValue;
        this.unsubscribe = store.subscribe(() => {
          let previousValue = currentValue;
          currentValue = store.getState().users;

          if (previousValue !== currentValue) {
            console.log('>>>', currentValue.map(user => ({key: user.key, name: user.name})));
          }
        }); */
        newState.dbSubscription = true;
        firebase.database().ref('/users/').on('child_added', (snapshot) => {
          store.dispatch(addUser({
            key: snapshot.key,
            ...snapshot.val(),
          }))
        });
        firebase.database().ref('/users/').on('child_removed', (snapshot) => {
          store.dispatch(delUser(snapshot.key));
        });
      } else if (this.state.dbSubscription) {
        store.dispatch(logout());
        newState.dbSubscription = false;
        firebase.database().ref('/users/').off('child_added');
        firebase.database().ref('/users/').off('child_removed');
        // this.unsubscribe();
      }
      this.setState(newState);
    });
  }

  /* Stop listening for authentication state changes
   * when the component unmounts.
   */
  componentWillUnmount() {
    this.authRemoveSubscription();
  }


  render() {
    let app;
    if (this.state.loading) {
      app = (
        <View style={styles.container}>
          <Spinner />
        </View>
      );
    } else if (this.state.user) {
      app = <HomeNavigator />;
    } else app = <WelcomeNavigator />;

    return (
      <Provider store={ store }>
        {app}
      </Provider>
    );
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
