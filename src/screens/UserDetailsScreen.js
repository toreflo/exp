import React, { Component } from "react";
import { 
  View,
  Text,
  StyleSheet
} from "react-native";
import { connect } from 'react-redux';

class UserDetailsScreen extends Component {
  render() {
    const { name, surname, email, groups } = this.props.navigation.getParam('user');
    const groupList = Object.keys(groups).map((groupKey) => (
      <Text key={groupKey}>
        {this.props.groups.find(g => g.key === groupKey).name}
      </Text>
    ));

    return (
      <View style={styles.container}>
        <Text>{name}</Text>
        <Text>{surname}</Text>
        <Text>{email}</Text>
        <Text>Gruppi:</Text>
        {groupList}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  groups: state.groups,
});

export default connect(mapStateToProps)(UserDetailsScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
