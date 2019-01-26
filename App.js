import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Spinner } from 'native-base';
import firebase from 'firebase';
import { Font } from "expo";
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import { HomeNavigator, WelcomeNavigator } from './src/navigators';
import config from './config';
import * as gbl from './src/gbl';
import rootReducer from './src/reducers';
import * as actions from './src/actions';
import * as firebaseDB from './src/lib/firebaseDB';
import * as fileStorage from './src/lib/fileStorage';

const store = createStore(rootReducer, applyMiddleware(thunk));
const DEBUG_STORE = false;

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      logged: false,
      loading: true,
      imagesDownloaded: 0,
      imagesCount: undefined,
    };
  }
  
  async componentWillMount() {
    const firebaseApp = firebase.initializeApp(config.firebaseConfig);
    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
    });
    await fileStorage.mkdirIfNotExists('avatar');
    await fileStorage.mkdirIfNotExists('image');
  }
  
  /**
  * When the App component mounts, we listen for any authentication
  * state changes in Firebase. 
  */
  componentDidMount() {
    this.authRemoveSubscription = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ loading: true, logged: true });

        /* Timer in case /board/imagesCount doesn't exist on DB */
        this.loadingTimeout = setTimeout(() => {
          if (!this.state.admin) console.log('Loading timeout');
  
          this.setState({ imagesCount: 0 });
        }, 10000);

        firebaseDB.once(`/board/`, 'value', (snapshot) => {
          const board = snapshot.val();
          if (board && (board.imagesCount !== undefined)) {
            clearTimeout(this.loadingTimeout);
            this.setState({ imagesCount: board.imagesCount});
          }
        });
        firebaseDB.once(`/admins/`, 'value', (snapshot) => {
          let isAdmin = false;
          const newState = {user, dbSubscription: true};
          snapshot.forEach((child) => {
            this.getAvatar(child.key);
            if ((child.key === user.uid) && child.val().admin) isAdmin = true;
          });
          if (isAdmin) {
            this.subscribeAdmin(user.uid);
            newState.admin = true;
          } else {
            this.subscribeUser(user.uid);            
            newState.admin = false;
          }          
          this.setState(newState);
        });

        if (DEBUG_STORE) {
          let currentGroups;
          let currentGroupMessages;
          this.unsubscribe = store.subscribe(() => {
            let previousGroups = currentGroups;
            currentGroups = store.getState().groups;
            let previousGroupMessages = currentGroupMessages;
            currentGroupMessages = store.getState().groupMessages;
            
            if (previousGroups !== currentGroups) {
              console.log('GGGGGGGGGGGGGGGGGGG: App store subscription group', currentGroups);
            }
            if (previousGroupMessages !== currentGroupMessages) {
              console.log('MMMMMMMMMMMMMMMMMMM: App store subscription groupMessages', currentGroupMessages);
            }
          });
        }
      } else {
        if (this.state.dbSubscription) {
          store.dispatch(actions.logout());
          firebaseDB.unregisterAll();
          if (DEBUG_STORE) this.unsubscribe();
        } else {
        }
        this.setState({ logged: false, loading: false, user, dbSubscription: false });
      }
    });
  }
  
  componentDidUpdate() {
    if (this.state.loading && (this.state.imagesCount === this.state.imagesDownloaded)) {
      this.setState({ loading: false });
    }
  }

  /* Stop listening for authentication state changes
  * when the component unmounts.
  */
  componentWillUnmount() {
    this.authRemoveSubscription();
  }
  
  getAvatar(uid) {
    fileStorage.downloadFile('avatar', '/avatars/', uid)
      .then((filename) => store.dispatch(actions.updateAvatar(uid, filename)))
      .catch((error) => {
        if (error.code === 'storage/object-not-found') return;
        alert(error);
      });
  }
    
  subscribeAdmin(uid) {
    firebaseDB.once(`/admins/${uid}`, 'value', (snapshot) => {
      const { name } = snapshot.val();
      store.dispatch(actions.login(true, uid, name));
    });

    /* Board messages */
    this.subscribeBoardMessages();

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
      this.subscribeGroupMessages(snapshot.key);
    });
    firebaseDB.on('/groups/', 'child_changed', (snapshot) => {
      store.dispatch(actions.groupChanged({key: snapshot.key, ...snapshot.val()}));
    });
    firebaseDB.on('/groups/', 'child_removed', (snapshot) => {
      store.dispatch(actions.groupRemoved(snapshot.key));
      this.unsubscribeGroupMessages(snapshot.key);
    });    
  }
  
  subscribeUser(uid) {
    store.dispatch(actions.login(false, uid));
    
    /* Board messages */
    this.subscribeBoardMessages();
    
    let groups = {};
    let prevGroups;
    
    /* Groups and group messages */
    firebaseDB.on(`/users/${uid}`, 'value', (snapshot) => {
      store.dispatch(actions.userChanged({key: snapshot.key, ...snapshot.val()}))
      prevGroups = groups;
      ({ groups } = snapshot.val());
      if (!groups) groups = {};
      const groupsAdded = Object.keys(groups).filter(key => prevGroups[key] === undefined);
      const groupsRemoved = Object.keys(prevGroups).filter(key => groups[key] === undefined);
      
      if (groupsAdded.length > 0) {
        groupsAdded.forEach((groupKey) => {
          this.subscribeGroup(groupKey);
        });
      } else if (groupsRemoved.length > 0) {
        groupsRemoved.forEach((groupKey) => {
          this.unsubscribeGroup(groupKey);
        });
      }
    });
  }  
  
  subscribeGroup(groupKey) {
    let firstTime = true;
    /* Group */
    firebaseDB.on(`/groups/${groupKey}/`, 'value', (snapshot) => {
      if (snapshot.val()) {
        store.dispatch(actions.groupChanged({key: snapshot.key, ...snapshot.val()}))
        if (firstTime) {
          /* Group messages */
          this.subscribeGroupMessages(groupKey);
          firstTime = false;
        }
      }
    });
  }
  
  unsubscribeGroup(groupKey) {
    firebaseDB.unregister(`/groups/${groupKey}/`, 'value');
    store.dispatch(actions.groupRemoved(groupKey));
    this.unsubscribeGroupMessages(groupKey);
  }

  subscribeBoardMessages() {
    /* Messages */
    firebaseDB.on('/messages/board/', 'child_added', (snapshot) => {
      store.dispatch(actions.boardMessageAdded({key: snapshot.key, ...snapshot.val()}))
    });
    firebaseDB.on('/messages/board/', 'child_changed', (snapshot) => {
      store.dispatch(actions.boardMessageChanged({key: snapshot.key, ...snapshot.val()}));
    });
    firebaseDB.on('/messages/board/', 'child_removed', (snapshot) => {
      store.dispatch(actions.boardMessageRemoved(snapshot.key));
    });

    /* Images */
    firebaseDB.on(`/images/board/`, 'child_added', (snapshot) => {
      this.downloadImage(`/images/board/`, snapshot.key, 'board', () => {
        this.setState((prevState) => ({
          imagesDownloaded: prevState.imagesDownloaded + 1,
        }))
      });
    });
  }

  downloadImage(path, name, storeFather, callback) {
    fileStorage.downloadFile('image', path, name, false)
      .then((filename) => {
        store.dispatch(actions.imageAdded(storeFather, name, filename));
        if (callback) callback();
      })
      .catch((error) => {
        if (error.code === 'storage/object-not-found') return;
        alert(error);
      });
  }
  
  subscribeGroupMessages(groupKey) {
    /* Messages */
    firebaseDB.on(`/messages/groups/${groupKey}/`, 'child_added', (snapshot) => {
      store.dispatch(actions.groupMessageAdded({
        groupKey, 
        message: {
          key: snapshot.key,
          ...snapshot.val(),
        },
      }))
    }, gbl.MAX_NUM_MESSAGES);
    
    /* Images */
    firebaseDB.on(`/images/groups/${groupKey}/`, 'child_added', (snapshot) => {
      this.downloadImage(`/images/groups/${groupKey}`, snapshot.key, groupKey);
    });
  }
  
  unsubscribeGroupMessages(groupKey) {
    firebaseDB.unregister(`/messages/groups/${groupKey}/`, 'child_added');
    firebaseDB.unregister(`/images/groups/${groupKey}/`, 'child_added');
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
      app = <HomeNavigator admin={this.state.admin} dispatch={store.dispatch}/>;
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
