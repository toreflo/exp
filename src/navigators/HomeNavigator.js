import React from "react";
import { View } from 'react-native';
import { Footer, FooterTab, Button, Icon, Text, StyleProvider, Badge } from 'native-base';
import { createBottomTabNavigator } from 'react-navigation';
import { connect } from 'react-redux';

import getTheme from '../../native-base-theme/components';
import exp from '../../native-base-theme/variables/exp';
import BoardNavigator from './BoardNavigator';
import UsersNavigator from './UsersNavigator';
import GroupsNavigator from './GroupsNavigator';
import MeScreen from '../screens/MeScreen';
import * as actions from '../actions';

class iconWithBadge extends React.Component {
  render() {
    const icon = <Icon type={this.props.type} name={this.props.name} />;
    return (
      this.props.number ? 
      <View style={{ flexDirection: "row" }}>
        {icon}
        <View>
          <Badge style={{ position: "absolute", top: -12, left: -25 }}>
            <Text>{this.props.number}</Text>
          </Badge>
        </View>
      </View> :
      icon
    );
  }
}

const groupMessageUnreadMapStateToProps = (state, ownProps) => {
  let unread = 0;
  const user = state.users.find(user => user.key === state.info.uid);
  if (user && user.groups) {
    unread = Object.values(user.groups).reduce((count, groupInfo) => (count + groupInfo.unread), 0);
  }
  return ({
    number: unread,
    type: ownProps.type,
    name: ownProps.name,
  });
};

const boardMessageUnreadMapStateToProps = (state, ownProps) => {
  let unread = 0;
  const user = state.users.find(user => user.key === state.info.uid);
  if (user) unread = user.board.unread;
  return ({
    number: unread,
    type: ownProps.type,
    name: ownProps.name,
  });
};

class HomeTabNavigator extends React.Component {
  render() {  
    const icons = {
      BoardNavigator: { component: Icon, props: { type: 'FontAwesome', name: 'home' } },
      GroupsNavigator: { component: Icon, props: { type: 'FontAwesome', name: 'wechat' } },
      UsersNavigator: { component: Icon, props: { type: 'FontAwesome', name: 'group' } },
      MeScreen: { component: Icon, props: { type: 'FontAwesome', name: 'user' } },
    };

    if (!this.props.admin) {
      icons.BoardNavigator = {
        component: connect(boardMessageUnreadMapStateToProps)(iconWithBadge),
        props: icons.BoardNavigator.props,
      };
      icons.GroupsNavigator = {
        component: connect(groupMessageUnreadMapStateToProps)(iconWithBadge),
        props: icons.GroupsNavigator.props,
      };
    }

    let index = 0;
    const screens = {
      BoardNavigator: {
        component: BoardNavigator,
        index: index++,
        icon: icons.BoardNavigator,
      },
      GroupsNavigator: {
        component: GroupsNavigator,
        index: index++,
        icon: icons.GroupsNavigator,
      },
    };
    if (this.props.admin) {
      screens.UsersNavigator = {
        component: UsersNavigator,
        index: index++,
        icon: icons.UsersNavigator,
      };
    }
    screens.MeScreen = {
      component: MeScreen,
      index: index++,
      icon: icons.MeScreen,
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
          onPress={() => {
            navigation.navigate(screen);
            this.props.dispatch(actions.changeNavigatorTab(screen));
          }}
        >
          {React.createElement(
            item.icon.component,
            { ...item.icon.props, active: navigation.state.index === item.index },
          )}
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
    const nav = createBottomTabNavigator(routes, { tabBarComponent });
    return React.createElement(nav, {});
  }
}

export default HomeTabNavigator;
