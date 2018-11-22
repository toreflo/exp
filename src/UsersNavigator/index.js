import { createStackNavigator } from 'react-navigation';

import UsersScreen from './UsersScreen';
import UserDetailsScreen from './UserDetailsScreen';

const UsersStackNavigator = createStackNavigator({
  UsersScreen: { screen: UsersScreen },
  UserDetailsScreen: { screen: UserDetailsScreen },
}, {
  // headerMode: 'none',
});

export default UsersStackNavigator;