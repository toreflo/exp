import React from "react";
import { createStackNavigator } from 'react-navigation';

import BoardScreen from './BoardScreen';
import WriteMessageScreen from './WriteMessageScreen';
import StackHeader from '../components/StackHeader';
import { initialRouteKey } from '../gbl';

const BoardStackNavigator = createStackNavigator({
  BoardScreen: { screen: BoardScreen },
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