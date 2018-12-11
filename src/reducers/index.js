import { combineReducers } from 'redux';
import users from './users';
import groups from './groups';
import boardMessages from './boardMessages';

export default combineReducers({
  users,
  groups,
  boardMessages,
});
