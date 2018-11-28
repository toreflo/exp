import React from "react";
import { createStackNavigator } from 'react-navigation';

import ChatGroupsScreen from './ChatGroupsScreen';
import ChatScreen from './ChatScreen';
import StackHeader from '../components/StackHeader';
import { initialRouteKey } from '../gbl';

const ChatStackNavigator = createStackNavigator({
  ChatGroupsScreen: { screen: ChatGroupsScreen },
  ChatScreen: { screen: ChatScreen },
}, {
  initialRouteName: 'ChatGroupsScreen',
  initialRouteKey,
  navigationOptions: ({ navigation }) => ({
    header: <StackHeader navigation={navigation} />
  }),
});

export default ChatStackNavigator;