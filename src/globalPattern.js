import pattern from './utils/pattern'

/**
* Creates a pattern (to be used as pattern argument of [takeEvery](http://yelouafi.github.io/redux-saga/docs/api/index.html#takeeverypattern-saga-args) or [takeLatest](http://yelouafi.github.io/redux-saga/docs/api/index.html#takelatestpattern-saga-args))
* that ensures that only global actions are consumed.
*
* **Example**
* ```javascript
* function* incrementAsync() {
*	yield* takeEvery(global('@@NOTIFICATION'), handleNotification)
* }
* ```
*
* > In most cases, you don't need to create global(...) patterns. This method is only provided when your application has
*   a naming conflict between global and local action types. In those cases, you can limit the name of the action to
*   global-only action types by specifying the global(...) pattern. However, it is adviced to prefix global action types (eg.
*   @@NOTIFICATION_SEND or GLOBAL_NOTIFICATION_SEND). This will ensure there are no collisisions with local dispatch actions
*   (eg. INCREMENT)
*
* The pattern argument is interpreted using the following rules:
* * If the pattern equals to the string '*', all global dispatched actions are matched (e.g. takeEvery(global('*')) will match all global actions)
* * If it is a RegExp, the action type is matched with the provided regular expression (e.g. takeEvery(global(/ASYNC$/i)))
* * If it is a string, the action is matched if action.type === pattern (e.g. takeEvery(global('INCREMENT_ASYNC')))
* * If it is an array, action.type is matched against all items in the array (e.g. takeEvery(global(['INCREMENT', 'DECREMENT'])) will match either actions of type 'INCREMENT' or 'DECREMENT').
*
* @param {string|array|RegExp} pattern The pattern of the action-type to match
* @returns {Function} A redux-saga compatible pattern
*/
export default pattern(true)
