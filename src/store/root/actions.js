export function updateStatus(data: any) {
  return dispatch => {
    dispatch({
      type: "UPDATE_STATUS",
      payload: data
    });
  };
}
export function updateBid(data: any) {
  return dispatch => {
    dispatch({
      type: "UPDATE_BID",
      payload: data
    });
  };
}
