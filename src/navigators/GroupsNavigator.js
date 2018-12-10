import React from "react";
import { createStackNavigator } from 'react-navigation';

import GroupsScreen from '../screens/GroupsScreen';
import GroupDetailsScreen from '../screens/GroupDetailsScreen';
import AddUserToGroupScreen from '../screens/AddUserToGroupScreen';
import ChatScreen from '../screens/ChatScreen';
import StackHeader from '../components/StackHeader';
import { initialRouteKey } from '../gbl';

const ChatStackNavigator = createStackNavigator({
  GroupsScreen: { screen: GroupsScreen },
  GroupDetailsScreen: { screen: GroupDetailsScreen },
  AddUserToGroupScreen: { screen: AddUserToGroupScreen },
  ChatScreen: { screen: ChatScreen },
}, {
  mode: 'modal',
  initialRouteName: 'GroupsScreen',
  initialRouteKey,
  navigationOptions: ({ navigation }) => ({
    header: <StackHeader navigation={navigation} modal />
  }),
});

export default ChatStackNavigator;