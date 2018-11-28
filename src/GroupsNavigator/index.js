import React from "react";
import { createStackNavigator } from 'react-navigation';

import GroupsScreen from './GroupsScreen';
import GroupDetailsScreen from './GroupDetailsScreen';
import StackHeader from '../components/StackHeader';
import { initialRouteKey } from '../gbl';

const GroupsStackNavigator = createStackNavigator({
  GroupsScreen: { screen: GroupsScreen },
  GroupDetailsScreen: { screen: GroupDetailsScreen },
}, {
  initialRouteName: 'GroupsScreen',
  initialRouteKey,
  navigationOptions: ({ navigation }) => ({
    header: <StackHeader navigation={navigation} />
  }),
});

export default GroupsStackNavigator;