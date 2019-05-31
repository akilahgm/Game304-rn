const initialState = {
  status: "home",
  bidVal: 100,
  bidder: ""
};

export default function(state: any = initialState, action: Function) {
  if (action.type === "UPDATE_STATUS") {
    return {
      ...state,
      status: action.payload
    };
  }
  if (action.type === "UPDATE_BID") {
    return {
      ...state,
      bidVal: action.payload.bidVal,
      bidder: action.payload.bidder
    };
  }

  return state;
}
