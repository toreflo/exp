import React, { Component } from "react";
import { 
  View,
  Text,
  StyleSheet
} from "react-native";
import { connect } from 'react-redux';

class UserDetailsScreen extends Component {
  render() {
    let groupList = null;
    const key = this.props.navigation.getParam('userKey');
    const user = this.props.users.find(user => user.key === key);
    if (!user) return null;

    const { name, surname, email, groups } = user;
    if (groups) {
      groupList = Object.keys(groups).map((groupKey) => {
        const group = this.props.groups.find(g => g.key === groupKey);
        return (
          <Text key={groupKey}>
            {group ? group.name : `${groupKey} (not found!)`}
          </Text>
      )});
    }

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
  users: state.users,
});

export default connect(mapStateToProps)(UserDetailsScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
