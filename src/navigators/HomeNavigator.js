import React from "react";
import { View } from 'react-native';
import { Footer, FooterTab, Button, Icon, Text, StyleProvider, Badge } from 'native-base';
import { createBottomTabNavigator } from 'react-navigation';

import getTheme from '../../native-base-theme/components';
import exp from '../../native-base-theme/variables/exp';
import BoardNavigator from './BoardNavigator';
import UsersNavigator from './UsersNavigator';
import GroupsNavigator from './GroupsNavigator';
import MeScreen from '../screens/MeScreen';
import { connect } from 'react-redux';

const getIcon = (icon, number) => (
  number ? 
  <View style={{ flexDirection: "row" }}>
    {icon}
    <View>
      <Badge style={{ position: "absolute", top: -12, left: -25 }}>
        <Text>{number}</Text>
      </Badge>
    </View>
  </View> :
  icon
)
class HomeTabNavigator extends React.Component {
  render() {
    let unread = 0;
    if (!this.props.admin) {
      const user = this.props.users.find(user => user.key === this.props.uid);
      if (user && user.groups) {
        unread = Object.values(user.groups).reduce((count, groupInfo) => (count + groupInfo.unread), 0);
      }
    }
    let index = 0;
    const screens = {
      BoardNavigator: {
        component: BoardNavigator,
        index: index++,
        icon: getIcon(<Icon type="FontAwesome" name="home" />, 0),
      },
      GroupsNavigator: {
        component: GroupsNavigator,
        index: index++,
        icon: getIcon(<Icon type="FontAwesome" name="envelope" />, unread),
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

const mapStateToProps = (state) => ({
  admin: state.info.admin,
  uid: state.info.uid,
  users: state.users,
});

export default connect(mapStateToProps)(HomeTabNavigator);
