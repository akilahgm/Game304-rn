export function updateTeam(data: any) {
  return dispatch => {
    dispatch({
      type: "UPDATE_TEAM",
      payload: data
    });
  };
}
export function updateTeamName(data: any) {
  return dispatch => {
    dispatch({
      type: "UPDATE_TEAM_NAME",
      payload: data
    });
  };
}
