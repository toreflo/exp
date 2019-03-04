import React, { Component } from "react";
import { Header, Left, Right, Body, Title, Text, Icon, Button } from 'native-base';
import { initialRouteKey } from '../gbl';

class StackHeader extends Component {

  render() {
    const { navigation } = this.props;
    let left = <Left/>;
    let right = null;
    let icon = this.props.modal ? 
      <Icon type="Ionicons" name="ios-close" /> : <Icon type="Ionicons" name="ios-arrow-back" />;
    if (navigation.state.key !== initialRouteKey) {
      left = (
        <Left>
          <Button
            transparent
            onPress={() => navigation.goBack()}
          >
            {icon}
          </Button>
        </Left>
      );
    }
    const title = navigation.getParam('title', navigation.state.routeName);
    const rightButtons = navigation.getParam('rightButtons');
    if (rightButtons) {
      right = rightButtons.map((button) => {
        const content = button.icon ? button.icon : <Text>{button.text}</Text>;
        return (
          <Button
            key={button.key}
            transparent
            onPress={button.callback}
          >
            {content}
          </Button>
        );
      });
    }

    return (
      <Header>
        {left}
        <Body>
          <Text>{title}</Text>
        </Body>
        <Right>{right}</Right>
      </Header>
    );
  }
}
export default StackHeader;