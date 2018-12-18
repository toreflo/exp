import React, { Component } from "react";
import { Header, Left, Right, Body, Title, Text, Icon, Button } from 'native-base';
import { initialRouteKey } from '../gbl';

class StackHeader extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.toggleButton = this.toggleButton.bind(this);
  }

  /* componentDidMount() {
    const rightButtons = this.props.navigation.getParam('rightButtons');
    const toggleButtons = {};
    if (rightButtons) {
      right = rightButtons.map((button) => {
        if (button.toggle) {
          toggleButtons[button.key] = { active: false };
        }
      });
      this.setState({ toggleButtons, })
    }
    console.log('componentDidMount completed', rightButtons, toggleButtons)
  } */

  toggleButton(key) {
    this.setState((prevState) => {
      const newState = { ...prevState };
      let active;
      if (!newState.toggleButtons) {
        newState.toggleButtons = {};
      }
      if (newState.toggleButtons[key]) {
        active = !newState.toggleButtons[key].active;
      } else {
        active = true;
      }
      newState.toggleButtons[key] = { active };
      return (newState);
    });
  }

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
        const active = (this.state.toggleButtons &&
                        this.state.toggleButtons[button.key] &&
                        this.state.toggleButtons[button.key].active);
        return (
          <Button
            key={button.key}
            danger={active}
            transparent
            onPress={() => {
              if (button.toggle) {
                this.toggleButton(button.key);
              }
              button.callback();
            }}
          >
            {button.icon}
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