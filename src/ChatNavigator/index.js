import { createStackNavigator } from 'react-navigation';

import ChatGroupsScreen from './ChatGroupsScreen';
import ChatScreen from './ChatScreen';

const ChatStackNavigator = createStackNavigator({
  ChatGroupsScreen: { screen: ChatGroupsScreen },
  ChatScreen: { screen: ChatScreen },
}, {
  // headerMode: 'none',
});

export default ChatStackNavigator;