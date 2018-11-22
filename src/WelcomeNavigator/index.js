import { createStackNavigator } from 'react-navigation';

import WelcomeScreen from './WelcomeScreen';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';

const WelcomeStackNavigator = createStackNavigator({
  WelcomeScreen: { screen: WelcomeScreen },
  LoginScreen: { screen: LoginScreen },
  SignUpScreen: { screen: SignUpScreen },
}, {
  // headerMode: 'none',
});

export default WelcomeStackNavigator;