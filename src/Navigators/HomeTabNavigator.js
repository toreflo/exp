import React, { Component } from "react";
import { StyleSheet } from "react-native";
import { Footer, FooterTab, Button, Icon, Text, StyleProvider } from 'native-base';
import {
  createSwitchNavigator,
  createStackNavigator,
  createDrawerNavigator,
  createBottomTabNavigator
} from 'react-navigation';

import getTheme from '../../native-base-theme/components';
import exp from '../../native-base-theme/variables/exp';
import BoardScreen from '../BoardScreen';
import MessageGroupsScreen from '../MessageGroupsScreen';
import UsersScreen from '../UsersScreen';
import GroupsScreen from '../GroupsScreen';

const HomeTabNavigator = createBottomTabNavigator({
  BoardScreen: { screen: BoardScreen },
  MessageGroupsScreen: { screen: MessageGroupsScreen },
  UsersScreen: { screen: UsersScreen },
  GroupsScreen: { screen: GroupsScreen },
}, {
  tabBarComponent: ({ navigation }) => {
    return (
      <StyleProvider style={getTheme(exp)}>
        <Footer>
          <FooterTab>
            <Button
              vertical
              active={navigation.state.index === 0}
              onPress={() => navigation.navigate('BoardScreen')}
            >
              <Icon type="FontAwesome" name="home" />
            </Button>
            <Button
              vertical
              active={navigation.state.index === 1}
              onPress={() => navigation.navigate('MessageGroupsScreen')}
            >
              <Icon type="FontAwesome" name="envelope" />
            </Button>
            <Button
              vertical
              active={navigation.state.index === 2}
              onPress={() => navigation.navigate('UsersScreen')}
            >
              <Icon type="FontAwesome" name="user" />
            </Button>
            <Button
              vertical
              active={navigation.state.index === 3}
              onPress={() => navigation.navigate('GroupsScreen')}
            >
              <Icon type="FontAwesome" name="users" />
              {/* <Text>Gruppi</Text> */}
            </Button>
          </FooterTab>
        </Footer>
      </StyleProvider>      
    );
  }
});


export default HomeTabNavigator;