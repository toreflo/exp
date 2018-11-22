import { createStackNavigator } from 'react-navigation';

import GroupsScreen from './GroupsScreen';
import GroupDetailsScreen from './GroupDetailsScreen';

const GroupsStackNavigator = createStackNavigator({
  GroupsScreen: { screen: GroupsScreen },
  GroupDetailsScreen: { screen: GroupDetailsScreen },
}, {
  // headerMode: 'none',
});

export default GroupsStackNavigator;