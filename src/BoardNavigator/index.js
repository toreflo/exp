import { createStackNavigator } from 'react-navigation';

import BoardScreen from './BoardScreen';
import WriteMessageScreen from './WriteMessageScreen';

const BoardStackNavigator = createStackNavigator({
  BoardScreen: { screen: BoardScreen },
  WriteMessageScreen: { screen: WriteMessageScreen },
}, {
  // headerMode: 'none',
});

export default BoardStackNavigator;