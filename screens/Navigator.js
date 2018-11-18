import React, { Component } from "react";
import { 
  View,
  Text,
  Button,
  StyleSheet
} from "react-native";
import {
  createSwitchNavigator,
  createStackNavigator,
  createDrawerNavigator,
  createBottomTabNavigator
} from 'react-navigation';

import WelcomeScreen from './WelcomeScreen';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import LogoutScreen from './LogoutScreen';
import BoardScreen from './BoardScreen';
import WriteMessageScreen from './WriteMessageScreen';
import MessageGroupsScreen from './MessageGroupsScreen';
import MessagesScreen from './MessagesScreen';
import UsersScreen from './UsersScreen';
import UserDetailsScreen from './UserDetailsScreen';
import GroupsScreen from './GroupsScreen';
import GroupDetailsScreen from './GroupDetailsScreen';

const OpenDrawerNavigationOptions = ({ navigation }) => ({
  headerLeft: (
    <Button
      title="Menu"
      onPress={ () => navigation.toggleDrawer() }
    />
  ),
});

const HomeTabNavigator = createBottomTabNavigator({
  BoardScreen: { screen: BoardScreen },
  MessageGroupsScreen: { screen: MessageGroupsScreen },
  UsersScreen: { screen: UsersScreen },
  GroupsScreen: { screen: GroupsScreen },
});

const HomeStackNavigator = createStackNavigator({
  HomeTabNavigator: { screen: HomeTabNavigator },
  WriteMessageScreen: { screen: WriteMessageScreen },
  MessagesScreen: { screen: MessagesScreen },
  UserDetailsScreen: { screen: UserDetailsScreen },
  GroupDetailsScreen: { screen: GroupDetailsScreen },
}, {
  navigationOptions: ({ navigation }) => {
    let opts = {};
    if (navigation.state.routeName === 'HomeTabNavigator') {
      opts = { 
        ...opts,
        headerLeft: (
          <Button
            title="Menu"
            onPress={ () => navigation.toggleDrawer() }
          />
        ),
      }
    }
    return opts;
  },
});

const AppDrawerNavigator = createDrawerNavigator({
  HomeStackNavigator: { screen: HomeStackNavigator },
  LogoutScreen: { screen: LogoutScreen },
});

const WelcomeStackNavigator = createStackNavigator({
  WelcomeScreen: { screen: WelcomeScreen },
  LoginScreen: { screen: LoginScreen },
  SignUpScreen: { screen: SignUpScreen },
});

const RootNavigator = createSwitchNavigator({
  WelcomeStackNavigator: { screen: WelcomeStackNavigator },
  AppDrawerNavigator: { screen: AppDrawerNavigator },
});

export default RootNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});