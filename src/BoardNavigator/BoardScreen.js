import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import { 
  Container,
  Icon,
  Fab,
} from "native-base";

class BoardScreen extends Component {
  render() {
    return (
      <Container>
        <View style={{ flex: 1 }}>
          <Fab
            active={true}
            direction="up"
            containerStyle={{ }}
            style={{ backgroundColor: '#5067FF' }}
            position="bottomRight"
            onPress={() => this.props.navigation.navigate('WriteMessageScreen')}>
            <Icon type="FontAwesome" name="pencil" />
          </Fab>
        </View>
      </Container>
    );
  }
}
export default BoardScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});