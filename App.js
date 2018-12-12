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
import * as actions from './src/actions';
import * as firebaseDB from './src/lib/firebaseDB';

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
        firebaseDB.once(`/admins/${user.uid}`, 'value', (snapshot) => {
          if (snapshot.val() && snapshot.val().admin) {
            this.subscribeAdmin();
          } else {
            this.subscribeUser(user.uid);            
          }
        })
        newState.dbSubscription = true;

        if (false) {
          let currentGroups;
          let currentGroupMessages;
          this.unsubscribe = store.subscribe(() => {
            let previousGroups = currentGroups;
            currentGroups = store.getState().groups;
            let previousGroupMessages = currentGroupMessages;
            currentGroupMessages = store.getState().groupMessages;
  
            if (previousGroups !== currentGroups) {
              console.log('############### App store subscription group', currentGroups);
            }
            if (previousGroupMessages !== currentGroupMessages) {
              console.log('############### App store subscription groupMessages', currentGroupMessages);
            }
          });
        }
      } else if (this.state.dbSubscription) {
        store.dispatch(actions.logout());
        newState.dbSubscription = false;
        firebaseDB.unregisterAll();
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

  subscribeAdmin() {
    store.dispatch(actions.login(true));

    /* Users */
    firebaseDB.on('/users/', 'child_added', (snapshot) => {
      store.dispatch(actions.userAdded({key: snapshot.key, ...snapshot.val()}))
    });
    firebaseDB.on('/users/', 'child_changed', (snapshot) => {
      store.dispatch(actions.userChanged({key: snapshot.key, ...snapshot.val()}));
    });
    firebaseDB.on('/users/', 'child_removed', (snapshot) => {
      store.dispatch(actions.userRemoved(snapshot.key));
    });

    /* Groups */
    firebaseDB.on('/groups/', 'child_added', (snapshot) => {
      store.dispatch(actions.groupAdded({key: snapshot.key, ...snapshot.val()}))
    });
    firebaseDB.on('/groups/', 'child_changed', (snapshot) => {
      store.dispatch(actions.groupChanged({key: snapshot.key, ...snapshot.val()}));
    });
    firebaseDB.on('/groups/', 'child_removed', (snapshot) => {
      store.dispatch(actions.groupRemoved(snapshot.key));
    });

    /* Board messages */
    firebaseDB.on('/messages/board/', 'child_added', (snapshot) => {
      store.dispatch(actions.boardMessageAdded({key: snapshot.key, ...snapshot.val()}))
    });
    firebaseDB.on('/messages/board/', 'child_changed', (snapshot) => {
      store.dispatch(actions.boardMessageChanged({key: snapshot.key, ...snapshot.val()}));
    });
    firebaseDB.on('/messages/board/', 'child_removed', (snapshot) => {
      store.dispatch(actions.boardMessageRemoved(snapshot.key));
    });
  }

  subscribeUser(uid) {
    store.dispatch(actions.login(false));

    /* Board messages */
    firebaseDB.on('/messages/board/', 'child_added', (snapshot) => {
      store.dispatch(actions.boardMessageAdded({key: snapshot.key, ...snapshot.val()}))
    });
    firebaseDB.on('/messages/board/', 'child_changed', (snapshot) => {
      store.dispatch(actions.boardMessageChanged({key: snapshot.key, ...snapshot.val()}));
    });
    firebaseDB.on('/messages/board/', 'child_removed', (snapshot) => {
      store.dispatch(actions.boardMessageRemoved(snapshot.key));
    });    

    let groups = {};
    let prevGroups;

    /* Groups and group messages */
    firebaseDB.on(`/users/${uid}`, 'value', (snapshot) => {
      prevGroups = groups;
      ({ groups } = snapshot.val());
      if (!groups) groups = {};
      const groupsAdded = Object.keys(groups).filter(key => prevGroups[key] === undefined);
      const groupsRemoved = Object.keys(prevGroups).filter(key => groups[key] === undefined);

      if (groupsAdded.length > 0) {
        groupsAdded.forEach((groupKey) => {
          this.subscripeGroup(groupKey);
        });
      } else if (groupsRemoved.length > 0) {
          groupsRemoved.forEach((groupKey) => {
            this.unsubscripeGroup(groupKey);
          });
      }
    });
  }  
  
  subscripeGroup(groupKey) {
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Subscribing to group', groupKey)

    /* Group */
    firebaseDB.on(`/groups/${groupKey}/`, 'value', (snapshot) => {
      // console.log(`value  ===>  /groups/${groupKey}/`, snapshot.key)
      if (snapshot.val()) {
        store.dispatch(actions.groupChanged({key: snapshot.key, ...snapshot.val()}))
      } else {
        store.dispatch(actions.groupRemoved(snapshot.key));
      }
    });
            
    /* Group messages */
    firebaseDB.on(`/messages/groups/${groupKey}/`, 'child_added', (snapshot) => {
      // console.log(`child_added  ===>  /messages/groups/${groupKey}/`, snapshot.key)
      store.dispatch(actions.groupMessageAdded({
        groupKey, 
        message: {
          key: snapshot.key,
          ...snapshot.val(),
        },
      }))
    });
    firebaseDB.on(`/messages/groups/${groupKey}/`, 'child_changed', (snapshot) => {
      // console.log(`child_changed  ===>  /messages/groups/${groupKey}/`, snapshot.key)
      store.dispatch(actions.groupMessageChanged({
        groupKey, 
        message: {
          key: snapshot.key,
          ...snapshot.val(),
        },
      }));
    });
    firebaseDB.on(`/messages/groups/${groupKey}/`, 'child_removed', (snapshot) => {
      // console.log(`child_changed  ===>  /messages/groups/${groupKey}/`, snapshot.key)
      store.dispatch(actions.groupMessageRemoved({
        groupKey, 
        messageKey: snapshot.key,
      }));
    });
  }
  
  unsubscripeGroup(groupKey) {
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Unsubscribing from group', groupKey)
    firebaseDB.unregister(`/groups/${groupKey}/`, 'value');
    firebaseDB.unregister(`/messages/groups/${groupKey}/`, 'child_added');
    firebaseDB.unregister(`/messages/groups/${groupKey}/`, 'child_changed');
    firebaseDB.unregister(`/messages/groups/${groupKey}/`, 'child_removed');
    store.dispatch(actions.groupRemoved(groupKey));
    store.dispatch(actions.groupMessageUnsubscribed(groupKey));
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
