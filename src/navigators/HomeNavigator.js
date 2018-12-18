import React from "react";
import { Footer, FooterTab, Button, Icon, Text, StyleProvider } from 'native-base';
import { createBottomTabNavigator } from 'react-navigation';

import getTheme from '../../native-base-theme/components';
import exp from '../../native-base-theme/variables/exp';
import BoardNavigator from './BoardNavigator';
import UsersNavigator from './UsersNavigator';
import GroupsNavigator from './GroupsNavigator';
import MeScreen from '../screens/MeScreen';

class HomeTabNavigator extends React.Component {
  render() {
    let index = 0;
    const screens = {
      BoardNavigator: {
        component: BoardNavigator,
        index: index++,
        icon: <Icon type="FontAwesome" name="home" />,
      },
      GroupsNavigator: {
        component: GroupsNavigator,
        index: index++,
        icon: <Icon type="FontAwesome" name="envelope" />,
      },
    };
    if (this.props.admin) {
      screens.UsersNavigator = {
        component: UsersNavigator,
        index: index++,
        icon: <Icon type="FontAwesome" name="group" />,
      };
    }
    screens.MeScreen = {
      component: MeScreen,
      index: index++,
      icon: <Icon type="FontAwesome" name="user" />,
    };
    const routes = Object.entries(screens).reduce((params, entry) => {
      const [screen, item] = entry;
      return ({
        ...params,
        [screen]: {screen: item.component},
      });
    }, {});
  
    const tabBarComponent = ({ navigation }) => {
      const tabs = Object.entries(screens).map(([screen, item]) => (
        <Button
          key={item.index}
          vertical
          active={navigation.state.index === item.index}
          onPress={() => navigation.navigate(screen)}
        >
          {item.icon}
        </Button>
      ));

      return (
        <StyleProvider style={getTheme(exp)}>
          <Footer>
            <FooterTab>
              {tabs}
            </FooterTab>
          </Footer>
        </StyleProvider>      
      );
    }
    const nav = createBottomTabNavigator(routes, { tabBarComponent, title: 'pippolino' });
    return React.createElement(nav, {});
  }
}

export default HomeTabNavigator;