const initialState = {
  player: {},
  name: "",
  id: "",
  playerNo: null,
  cards: [{ type: '', value: '' }, { type: '', value: '' }, { type: '', value: '' }, { type: '', value: '' }, { type: '', value: '' }, { type: '', value: '' }],
  output: {
    player1: null,
    player2: null,
    player3: null,
    player4: null,
  }
};

export default function (state: any = initialState, action: Function) {
  if (action.type === "UPDATE_PLAYER") {
    return {
      ...state,
      player: action.payload
    };
  }
  if (action.type === "UPDATE_PLAYER_NAME") {
    return {
      ...state,
      name: action.payload
    };
  }
  if (action.type === "UPDATE_PLAYER_ID") {
    return {
      ...state,
      id: action.payload
    };
  }
  if (action.type === "UPDATE_PLAYER_NO") {
    return {
      ...state,
      playerNo: action.payload
    };
  }
  if (action.type === "UPDATE_CARDS") {
    return {
      ...state,
      cards: action.payload
    };
  }
  if (action.type === "UPDATE_OUTPUT") {
    return {
      ...state,
      output: action.payload
    };
  }

  return state;
}
