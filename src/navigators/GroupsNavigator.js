import React from "react";
import { createStackNavigator } from 'react-navigation';

import GroupsScreen from '../screens/GroupsScreen';
import GroupDetailsScreen from '../screens/GroupDetailsScreen';
import UserToGroupScreen from '../screens/UserToGroupScreen';
import ChatScreen from '../screens/ChatScreen';
import StackHeader from '../components/StackHeader';
import { initialRouteKey } from '../gbl';

const ChatStackNavigator = createStackNavigator({
  GroupsScreen: { screen: GroupsScreen },
  GroupDetailsScreen: { screen: GroupDetailsScreen },
  UserToGroupScreen: { screen: UserToGroupScreen },
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