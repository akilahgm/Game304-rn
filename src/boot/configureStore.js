import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { persistStore, persistReducer } from "redux-persist";
import storage from 'redux-persist/lib/storage'
import reducer from "../store";
import { createLogger } from "redux-logger";

const persistConfig = {
  key: 'root',
  storage,
}

const log =  createLogger({ diff: true, collapsed: true });

export default function configureStore(onCompletion: () => void): any {

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const middleware = [thunk, log];

  const persistedReducer = persistReducer(persistConfig, reducer);

  const enhancer = composeEnhancers(
    applyMiddleware(...middleware)
  );

  const store = createStore(persistedReducer, enhancer);
  persistStore(store,onCompletion);

  return store;
}
