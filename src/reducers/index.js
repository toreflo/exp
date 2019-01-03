import { combineReducers } from 'redux';
import info from './info';
import users from './users';
import groups from './groups';
import images from './images';
import boardMessages from './boardMessages';
import groupMessages from './groupMessages';

export default combineReducers({
  info,
  users,
  groups,
  images,
  boardMessages,
  groupMessages,
});
