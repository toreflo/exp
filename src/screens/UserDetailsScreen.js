import React, { Component } from "react";
import { 
  View,
  Text,
  StyleSheet
} from "react-native";
import { connect } from 'react-redux';
import moment from 'moment';
import 'moment/locale/it';

class UserDetailsScreen extends Component {

  componentDidMount() {
    const key = this.props.navigation.getParam('userKey');
    const { name, surname } = this.props.users.find(user => user.key === key);
    this.props.navigation.setParams({title: `${name} ${surname}`});
  }

  render() {
    let groupList = null;
    const key = this.props.navigation.getParam('userKey');
    const { name, surname, email, groups } = this.props.users.find(user => user.key === key);
    if (groups) {
      groupList = Object.keys(groups).map((groupKey) => {
        const group = this.props.groups.find(g => g.key === groupKey);
        const { unread, lastMessageRead } = groups[groupKey];
        return (
          <Text key={groupKey}>
            {`${group.name} (unread: ${unread}, lastRead: ${moment.unix(lastMessageRead/1000).format('LLL')})`}
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
