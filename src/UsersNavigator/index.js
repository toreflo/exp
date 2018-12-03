import React from "react";
import { createStackNavigator } from 'react-navigation';

import UsersScreen from './UsersScreen';
import AddUserScreen from './AddUserScreen';
import UserDetailsScreen from './UserDetailsScreen';
import StackHeader from '../components/StackHeader';
import { initialRouteKey } from '../gbl';

const UsersStackNavigator = createStackNavigator({
  UsersScreen: { screen: UsersScreen },
  AddUserScreen: { screen: AddUserScreen },
  UserDetailsScreen: { screen: UserDetailsScreen },
}, {
  initialRouteName: 'UsersScreen',
  mode: 'modal',
  initialRouteKey,
  navigationOptions: ({ navigation }) => ({
    header: <StackHeader navigation={navigation} modal />
  }),
});

export default UsersStackNavigator;