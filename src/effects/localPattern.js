import pattern from './pattern'

/**
* Creates a pattern (to be used as pattern argument of [takeEvery](http://yelouafi.github.io/redux-saga/docs/api/index.html#takeeverypattern-saga-args) or [takeLatest](http://yelouafi.github.io/redux-saga/docs/api/index.html#takelatestpattern-saga-args))
* that ensures that only local actions are consumed.
*
* **Example**
* ```javascript
* function* incrementAsync() {
*	yield* takeEvery(local('INCREMENT_ASYNC'), increment)
* }
* ```
*
* > In most cases, you don't need to create local(...) patterns. This method is only provided when your application has
*   a naming conflict between global and local action types. In those cases, you can limit the name of the action to
*   local-only action types by specifying the local(...) pattern. However, it is adviced to prefix global action types (eg.
*   @@NOTIFICATION_SEND or GLOBAL_NOTIFICATION_SEND). This will ensure there are no collisisions with local dispatch actions
*   (eg. INCREMENT)
*
* The pattern argument is interpreted using the following rules:
* * If the pattern equals to the string '*', all local dispatched actions are matched (e.g. takeEvery(local('*')) will match all local actions)
* * If it is a RegExp, the action type is matched with the provided regular expression (e.g. takeEvery(local(/ASYNC$/i)))
* * If it is a string, the action is matched if action.type === pattern (e.g. takeEvery(local('INCREMENT_ASYNC')))
* * If it is an array, action.type is matched against all items in the array (e.g. takeEvery(local(['INCREMENT', 'DECREMENT'])) will match either actions of type 'INCREMENT' or 'DECREMENT').
*
* @param {string|array|RegExp} pattern The pattern of the action-type to match
* @returns {Function} A redux-saga compatible pattern
*/
export default pattern(false)
