import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import PlayerReducer from "./player/reducer";
import TeamReducer from "./team/reducer";
import RootReducer from "./root/reducer";

export default combineReducers({
  playerReducer: PlayerReducer,
  teamReducer: TeamReducer,
  rootReducer: RootReducer
});
