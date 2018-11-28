import React from "react";
import { createStackNavigator } from 'react-navigation';

import UsersScreen from './UsersScreen';
import UserDetailsScreen from './UserDetailsScreen';
import StackHeader from '../components/StackHeader';
import { initialRouteKey } from '../gbl';

const UsersStackNavigator = createStackNavigator({
  UsersScreen: { screen: UsersScreen },
  UserDetailsScreen: { screen: UserDetailsScreen },
}, {
  initialRouteName: 'UsersScreen',
  initialRouteKey,
  navigationOptions: ({ navigation }) => ({
    header: <StackHeader navigation={navigation} />
  }),
});

export default UsersStackNavigator;