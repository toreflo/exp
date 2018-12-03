import React, { Component } from "react";
import { Header, Left, Right, Body, Title, Icon, Button } from 'native-base';
import { initialRouteKey } from '../gbl';

class StackHeader extends Component {

  render() {
    const { navigation } = this.props;
    let left = <Left />;
    let right = <Right />;
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
      if (this.props.sendButton) {
        const send = navigation.getParam('send', () => {});

        right = (
          <Right>
            <Button
              transparent
              onPress={() => send()}
            >
              <Icon type="Ionicons" name="ios-send" />
            </Button>
          </Right>
        );
      }
    }
    return (
      <Header>
        {left}
        <Body>
          <Title>{navigation.state.routeName}</Title>
        </Body>
        {right}
      </Header>
    );
  }
}
export default StackHeader;