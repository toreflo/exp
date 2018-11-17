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

const MessagesStackNavigator = createStackNavigator({
  MessageGroupsScreen: { screen: MessageGroupsScreen },
  MessagesScreen: { screen: MessagesScreen },
}, {
  navigationOptions: OpenDrawerNavigationOptions,
});

const UsersStackNavigator = createStackNavigator({
  UsersScreen: { screen: UsersScreen },
  UserDetailsScreen: { screen: UserDetailsScreen },
}, {
  navigationOptions: OpenDrawerNavigationOptions,
});

const GroupsStackNavigator = createStackNavigator({
  GroupsScreen: { screen: GroupsScreen },
  GroupDetailsScreen: { screen: GroupDetailsScreen },
}, {
  navigationOptions: OpenDrawerNavigationOptions,
});

const BoardStackNavigator = createStackNavigator({
  BoardScreen: { screen: BoardScreen },
}, {
  navigationOptions: OpenDrawerNavigationOptions,
});

const HomeTabNavigator = createBottomTabNavigator({
  BoardStackNavigator: { screen: BoardStackNavigator },
  MessagesStackNavigator: { screen: MessagesStackNavigator },
  UsersStackNavigator: { screen: UsersStackNavigator },
  GroupsStackNavigator: { screen: GroupsStackNavigator },
});

const AppDrawerNavigator = createDrawerNavigator({
  HomeTabNavigator: { screen: HomeTabNavigator },
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