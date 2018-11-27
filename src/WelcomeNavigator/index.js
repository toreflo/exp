import React from "react";
import { createStackNavigator } from 'react-navigation';
import { Header, Left, Right, Body, Title, Icon, Button } from 'native-base';
import WelcomeScreen from './WelcomeScreen';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';

const WelcomeStackNavigator = createStackNavigator({
  WelcomeScreen: { screen: WelcomeScreen },
  LoginScreen: { screen: LoginScreen },
  SignUpScreen: { screen: SignUpScreen },
}, {
  navigationOptions: ({ navigation }) => ({
    header: (
        <Header>
          <Left>
            <Button
              transparent
              onPress={() => navigation.goBack()}
            >
              <Icon type="Ionicons" name="ios-arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>{navigation.state.routeName}</Title>
          </Body>
          <Right/>
        </Header>
    ),
  }),
});

export default WelcomeStackNavigator;