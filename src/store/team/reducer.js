const initialState = {
  team: {},
  teamName: ""
};

export default function(state: any = initialState, action: Function) {
  if (action.type === "UPDATE_TEAM") {
    return {
      ...state,
      team: action.payload
    };
  }
  if (action.type === "UPDATE_TEAM_NAME") {
    return {
      ...state,
      teamName: action.payload
    };
  }

  return state;
}
