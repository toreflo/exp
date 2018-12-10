import React from "react";
import { createStackNavigator } from 'react-navigation';

import BoardScreen from '../screens/BoardScreen';
import WriteMessageScreen from '../screens/WriteMessageScreen';
import MessageDetailsScreen from '../screens/MessageDetailsScreen';
import StackHeader from '../components/StackHeader';
import { initialRouteKey } from '../gbl';

const BoardStackNavigator = createStackNavigator({
  BoardScreen: { screen: BoardScreen },
  MessageDetailsScreen: { screen: MessageDetailsScreen },
  WriteMessageScreen: { screen: WriteMessageScreen },
}, {
  initialRouteName: 'BoardScreen',
  mode: 'modal',
  initialRouteKey,
  navigationOptions: ({ navigation }) => ({
    header: <StackHeader navigation={navigation} modal/>
  }),
});

export default BoardStackNavigator;