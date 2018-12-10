import React from "react";
import { createStackNavigator } from 'react-navigation';

import GroupsScreen from './GroupsScreen';
import GroupDetailsScreen from './GroupDetailsScreen';
import AddUserToGroupScreen from './AddUserToGroupScreen';
import ChatScreen from './ChatScreen';
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