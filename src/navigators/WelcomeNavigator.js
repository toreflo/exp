import React from "react";
import { createStackNavigator } from 'react-navigation';
import { Header, Left, Right, Body, Title, Icon, Button } from 'native-base';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import StackHeader from '../components/StackHeader';
import { initialRouteKey } from '../gbl';

const WelcomeStackNavigator = createStackNavigator({
  WelcomeScreen: { screen: WelcomeScreen },
  LoginScreen: { screen: LoginScreen },
  SignUpScreen: { screen: SignUpScreen },
}, {
  navigationOptions: ({ navigation }) => ({
    initialRouteName: 'WelcomeScreen',
    initialRouteKey,
    header: <StackHeader navigation={navigation} />
  }),
});

export default WelcomeStackNavigator;