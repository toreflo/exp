import React, { Component } from "react";
import { Header, Left, Right, Body, Title, Icon, Button } from 'native-base';
import { initialRouteKey } from '../gbl';

class StackHeader extends Component {

  render() {
    const { navigation } = this.props;
    let left = <Left />;
    if (navigation.state.key !== initialRouteKey) {
      left = (
        <Left>
          <Button
            transparent
            onPress={() => navigation.goBack()}
          >
            <Icon type="Ionicons" name="ios-arrow-back" />
          </Button>
        </Left>
      );
    }
    console.log(initialRouteKey)

    return (
      <Header>
        {left}
        <Body>
          <Title>{navigation.state.routeName}</Title>
        </Body>
        <Right/>
      </Header>
    );
  }
}
export default StackHeader;