import React, { Component } from "react";
import { 
  View,
  Text,
  StyleSheet
} from "react-native";
import { connect } from 'react-redux';

class UserDetailsScreen extends Component {

  componentDidMount() {
    const { name, surname } = this.props.navigation.getParam('user');
    this.props.navigation.setParams({title: `${name} ${surname}`});
  }

  render() {
    let groupList = null;
    const { name, surname, email, groups } = this.props.navigation.getParam('user');

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
});

export default connect(mapStateToProps)(UserDetailsScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
