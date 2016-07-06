## API

### `sagaContainerMiddleware([options])`

The local saga middleware allows you to run [`Sagas` (redux-saga)](https://github.com/yelouafi/redux-saga) 
in isolation for a given [`container` (local-react-redux)](https://github.com/HansDP/local-react-redux). 
Every instance of such a container can work with its own action types, without running into conflict 
with other containers (be it the same type or another container type).

To enable local sagas in your containers, the hosting application must add this middleware to the global 
Redux store. 

#### Arguments

* [`options`] *(Object)* If specified, further customizes the behavior when running a saga.
  * [`monitor`] *(Function)*:  Enables monitoring redux-saga. See the [`redux-saga` sagaMonitor](https://github.com/yelouafi/redux-saga/tree/master/examples/sagaMonitor)
    example for usage.
  * [`logger`] *(Function)*: A function that logs all Saga related events. *Defaults to the built-in Saga
    event logger.*

#### Example usage

```javascript
import { createStore, compose, applyMiddleware } from 'redux'
import { sagaContainerMiddleware } from 'local-react-redux-saga'

const storeFactory = compose(
  applyMiddleware(sagaContainerMiddleware())
)(createStore)

```

### `sagaContainer([createSaga])`

Enhances a [`local-react-redux` container](https://github.com/HansDP/local-react-redux) to run isolated 
[`Sagas` (redux-saga)](https://github.com/yelouafi/redux-saga).

This method creates a higher-order component for a `connectContainer`/

#### Arguments

* [`createSaga: saga`] \(*Function*): If specified, the container will call this function on mount. When 
  called, you must return a valid Saga. This enables you to provide a default saga for your container.

  > Note: when you provide a createSaga method, the sagaContainer will automatically call `cancel()` on 
    the created Saga when the container gets unmounted.

#### Example usage

```javascript
import React from 'react'
import { compose } from 'redux'
import { connectContainer } from 'local-react-redux'
import sagaContainer from 'local-react-redux-saga'

import localReducer from './reducer'
import rootSaga from './saga'

const createSaga = () => {
  return rootSaga()
}

const createContainerWithMiddleware = compose(sagaContainer(createSaga))(connectContainer)

export default createContainerWithMiddleware(localReducer)(({ runSaga, dispatch }) => (
  <div>My container</div>
))
```

#### Advanced scenarios

In advanced scenarios you may need more control over the Saga being created. For those scenario's, 
this container enhancer provides the `runSaga` prop to your component. To start a saga from within your 
code, pass the saga to `props.runSaga(saga)`. The function will return a reference to the running saga. 
It is your responsability to `cancel()` those sagas (e.g. on unmount of your component).

```javascript
import React from 'react'
import { compose } from 'redux'
import { connectContainer } from 'local-react-redux'
import sagaContainer from 'local-react-redux-saga'

import localReducer from './reducer'
import saga1 from './saga1'
import saga2 from './saga2'

const createContainerWithMiddleware = compose(sagaContainer())(connectContainer)

export default createContainerWithMiddleware(localReducer)(class MyContainer extends React.Component {

  componentWillMount() {
    const { runSaga } = this.props

    if (mustRunSaga1()) {
      this.saga1 = runSaga(saga1())
    }
    if (mustRunSaga2()) {
      this.saga2 = runSaga(saga2())
    }
  }

  componentWillUnmount() {
    if (this.saga1) {
    	this.saga1.cancel()
    	this.saga1 = null
    }
    if (this.saga2) {
    	this.saga2.cancel()
    	this.saga2 = null
    }
  }

  render() {
    return <div>My container</div>
  }
})
```

### Effect helpers

The effect helpers are available from the `effects` folder within the package

##### Example

```javascript
import { putGlobal, selectGlobal, local, global } from 'local-react-redux-saga/effects'
```

#### `putGlobal([channel], action)`

Creates an effect description that instructs the middleware to dispatch a global action to the store.

##### Arguments

* [`channel`] \(*Channel*): Optional parameter that instructs the putGlobal to put the action on the 
  provided [channel](http://yelouafi.github.io/redux-saga/docs/api/index.html#channel).
* `action` (*Object*): The redux action to dispatch.

#### `selectGlobal(selector, ...args)`

Creates an effect that instructs the middleware to invoke the provided selector on the global redux 
store's state (i.e. returns the result of `selector(store.getState(), ...args)`).

If selectGlobal is called without argument (i.e. `yield selectGlobal()`) then the effect is resolved 
with the entire state (the same result of a `store.getState()` call).

> It's important to note that when an action is dispatched to the store, the middleware first 
  forwards the action to the reducers and then notifies the Sagas. This means that when you 
  query the global redux store's state, you get the state after the action has been applied.


**Note:** Preferably, a Saga should be autonomous and should not depend on the global redux 
store's state. This makes it easy to modify the state implementation without affecting the 
Saga code. A saga should preferably depend only on its own internal control state when 
possible. But sometimes, one could find it more convenient for a Saga to query the state 
instead of maintaining the needed data by itself (for example, when a Saga duplicates the 
logic of invoking some reducer to compute a state that was already computed by the store).

##### Arguments

* `selector` (*Function*): A function of signature `(state, ...args) => args`. It takes the 
  current global store's state and optionally some arguments and returns a slice of the 
  global redux store's state
* [`...args`] \(*...object*):  Optional arguments to be passed to the selector.


### Redux-saga patterns

In `redux-saga`, when creating an effect description that instructs the middleware to wait for a specified action on the store (e.g. [takeEvery](http://yelouafi.github.io/redux-saga/docs/api/index.html#takeeverypattern-saga-args) or [takeLatest](http://yelouafi.github.io/redux-saga/docs/api/index.html#takelatestpattern-saga-args)), you pass in a pattern.

Because `local-react-redux-saga` is bound to a specific instance of a `local-react-redux` container, actions dispatched can be both local or global. In most cases, your application will use prefixed global action types (e.g. @@NOTIFICATION_RECEIVED or MYAPP/NOTIFICATION_RECEIVED) and your container will use unprefixed actions (e.g. USER_REQUEST_PENDING). However, if you run in the case where you have a naming conflict between global and locat actions (if they both have the same name), you can instruct `redux-saga` to explicitly take only `local` or `global` actions, using following methods:

#### `global(pattern)`

Creates a pattern that ensures only global actions are matched.

##### Arguments

* `pattern` \(*String|Array|RegExp*): The pattern of the global action-type to match. See pattern rules below for allowed patterns.

##### Example

```javascript
function* watchGlobalNotifications() {
  yield* takeEvery(global('@@NOTIFICATION_RECEIVED'), handleNotification)
}
```

#### `local(pattern)`

Creates a pattern that ensures only local actions are matched.

##### Arguments

* `pattern` \(*String|Array|RegExp*): The pattern of the local action-type to match. See pattern rules below for allowed patterns.

##### Example

```javascript
function* watchUserRequest() {
  yield* takeEvery(local('@@USER_REQUEST'), handleUserRequest)
}
```

#### Patterns

The pattern argument of `global(pattern)` and `local(pattern)` is interpreted using the following rules:

* If the pattern equals to the string '*', all global dispatched actions are matched (e.g. 
  `takeEvery(global('*'))` will match ALL global actions)
* If it is a RegExp, the action type is matched with the provided regular expression (e.g.
  `takeEvery(local(/REQUEST$/i))`)
* If it is a string, the action is matched if action.type === pattern (e.g.
  `takeEvery(global('INCREMENT_ASYNC'))`)
* If it is an array, action.type is matched against all items in the array (e.g.
  `takeEvery(local(['INCREMENT', 'DECREMENT']))` will match either actions of type 'INCREMENT' or 
  'DECREMENT').