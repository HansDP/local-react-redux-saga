## API

### `localSagaMiddleware([options])`

The local saga middleware allows you to run [`Sagas` (redux-saga)](https://github.com/yelouafi/redux-saga) in isolation for a given [`container` (local-react-redux)](https://github.com/HansDP/local-react-redux). Every instance of such a container can work with its own action types, without running into conflict with other containers (be it the same type or another container type).

To enable local sagas in your containers, the hosting application must add this middleware to the global Redux store. 

#### Arguments

* [`options`] *(Object)* If specified, further customizes the behavior when running a saga.
  * [`monitor`] *(Function)*:  Enables monitoring redux-saga. See the [`redux-saga` sagaMonitor](https://github.com/yelouafi/redux-saga/tree/master/examples/sagaMonitor) example for usage.
  * [`logger`] *(Function)*: A function that logs all Saga related events. *Defaults to the built-in Saga event logger.*

#### Example usage

```javascript
import { createStore, compose, applyMiddleware } from 'redux'
import { localSagaMiddleware } from 'local-react-redux-saga'

const storeFactory = compose(
  applyMiddleware(localSagaMiddleware())
)(createStore)

```

### `sagaContainerEnhancer([createSaga])`

Enables a [`local-react-redux` container](https://github.com/HansDP/local-react-redux) to run isolated [`Sagas` (redux-saga)](https://github.com/yelouafi/redux-saga).

This method creates a higher-order component for a `container`/

#### Arguments

* [`createSaga: saga`] \(*Function*): If specified, the container will call this function on mount. When called, you must return a valid Saga. This enables you to provide a default saga for your container.

  >Note: when you provide a createSaga method, the containerEnhancer will automatically call `cancel()` on the created Saga when the container gets `unmounted`.

  >Note: in advanced scenarios you may need more control over the Saga being created. For those scenario's, this container enhancer provides the `runSaga prop` to your component. To start a saga from within your code, pass the saga to `props.runSaga(saga)`. The function will return a reference to the running saga. It is your responsability to `cancel()` those sagas (e.g. on unmount of your component).

#### Example usage

```javascript
import React from 'react'
import { compose } from 'redux'
import { container } from 'local-react-redux'
import sagaContainerEnhancer from 'local-react-redux-saga'

import localReducer from './reducer'
import rootSaga from './saga'

const createSaga = () => {
  return rootSaga()
}

const containerWithMiddleware = compose(sagaContainerEnhancer(createSaga))(container)

export default containerWithMiddleware(localReducer)(({ runSaga, dispatch }) => (
  <div>My container</div>
))
```

### `putGlobal([channel], action)`

TODO: same as redux-saga, but global

### `selectGlobal(selector, ...args)`

TODO: same as redux-saga, but global

### takeEvery(local | global)

TODO: this is not needed, but in case there are naming conflict
we suggest you prefix global actions, eg. GLOBAL_xyz or @@xyz. Those prefixes should not be used by (local) containers. In such cases, you do not need to do takeEvery(local(...)) or takeEvery(global(...))
but it will make your code more robust.

