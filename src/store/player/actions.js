export function updatePlayer(data: any) {
  return dispatch => {
    dispatch({
      type: "UPDATE_PLAYER",
      payload: data
    });
  };
}
export function updatePlayerName(data: any) {
  return dispatch => {
    dispatch({
      type: "UPDATE_PLAYER_NAME",
      payload: data
    });
  };
}
export function updatePlayerId(data: any) {
  return dispatch => {
    dispatch({
      type: "UPDATE_PLAYER_ID",
      payload: data
    });
  };
}
export function updatePlayerNo(data: any) {
  return dispatch => {
    dispatch({
      type: "UPDATE_PLAYER_NO",
      payload: data
    });
  };
}
export function updateCards(data: any) {
  return dispatch => {
    dispatch({
      type: "UPDATE_CARDS",
      payload: data
    });
  };
}
export function updateOutput(data: any) {
  return dispatch => {
    dispatch({
      type: "UPDATE_OUTPUT",
      payload: data
    });
  };
}
