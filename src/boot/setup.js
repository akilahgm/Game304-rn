import * as React from "react";
import { Provider } from "react-redux";
import { View } from "react-native";
import configureStore from "./configureStore";
import Router from "../router";
import Home from "../pages/home";
import { PersistGate } from "redux-persist/integration/react";

export default class Setup extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      store: configureStore(() => this.setState({ isLoading: false })),
      isReady: false
    };
    console.log(this.state);
  }

  componentDidMount() {
    this.setState({ isReady: true });
  }

  render() {
    if (!this.state.isReady || this.state.isLoading) {
      return null;
    }
    return (
      <Provider store={this.state.store}>
        <Home />
      </Provider>
    );
  }
}
