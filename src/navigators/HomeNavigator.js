import React from "react";
import { Footer, FooterTab, Button, Icon, Text, StyleProvider } from 'native-base';
import { createBottomTabNavigator } from 'react-navigation';

import getTheme from '../../native-base-theme/components';
import exp from '../../native-base-theme/variables/exp';
import BoardNavigator from './BoardNavigator';
import UsersNavigator from './UsersNavigator';
import GroupsNavigator from './GroupsNavigator';
import MeScreen from '../screens/MeScreen';

const HomeTabNavigator = createBottomTabNavigator({
  BoardNavigator: { screen: BoardNavigator },
  GroupsNavigator: { screen: GroupsNavigator },
  UsersNavigator: { screen: UsersNavigator },
  MeScreen: { screen: MeScreen },
}, {
  tabBarComponent: ({ navigation }) => {
    return (
      <StyleProvider style={getTheme(exp)}>
        <Footer>
          <FooterTab>
            <Button
              vertical
              active={navigation.state.index === 0}
              onPress={() => navigation.navigate('BoardNavigator')}
            >
              <Icon type="FontAwesome" name="home" />
            </Button>
            <Button
              vertical
              active={navigation.state.index === 1}
              onPress={() => navigation.navigate('GroupsNavigator')}
            >
              <Icon type="FontAwesome" name="envelope" />
            </Button>
            <Button
              vertical
              active={navigation.state.index === 2}
              onPress={() => navigation.navigate('UsersNavigator')}
            >
              <Icon type="FontAwesome" name="group" />
            </Button>
            <Button
              vertical
              active={navigation.state.index === 3}
              onPress={() => navigation.navigate('MeScreen')}
            >
              <Icon type="FontAwesome" name="user" />
              {/* <Text>Me</Text> */}
            </Button>
          </FooterTab>
        </Footer>
      </StyleProvider>      
    );
  }
});

export default HomeTabNavigator;