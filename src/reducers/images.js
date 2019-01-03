import * as types from '../actions/actionTypes';

const images = (state = {}, action) => {
  switch (action.type) {
    case types.IMAGE_ADDED:
      return {
        ...state,
        [action.groupKey]: {
          ...state[action.groupKey],
          [action.imageKey]: action.imageUri,
        },
      };
    default:
      return state
  }
};

export default images;