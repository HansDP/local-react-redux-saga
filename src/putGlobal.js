import { put } from 'redux-saga/effects'

/**
* Creates an effect description that instructs the middleware to dispatch a global 
* action to the store.
*
* @param {Object} [channel] Optional parameter that instructs the putGlobal to put the action on the provided [channel](http://yelouafi.github.io/redux-saga/docs/api/index.html#channel).
* @param {object} action The redux action to dispatch.
*/
export default (...args) => {

	// 'args' can be two cases:
	//
	// 0 or 1 arguments: action only is passed
	// 2 or more arguments: channel + action is passed
	// Those two cases require a different call to redux-saga's PUT method

	if (args.length <= 1) {
		return put(createGlobalAction(args[0]))
	}

	return put(args[0], createGlobalAction(args[1]))
}

const createGlobalAction = (action) => {

	// The middleware contains a special case:
	// 		When the action has a globalType = '@@LOCAL_REDUX_SAGA_DISPATCH_GLOBAL', 
	// 		then the wrapped action in the meta-dat 'GLOBAL_ACTION' will be dispatched instead
	return { 
		type: '@@LOCAL_REDUX_SAGA', 
		globalType: '@@LOCAL_REDUX_SAGA_DISPATCH_GLOBAL', 
		meta: {
			'GLOBAL_ACTION': action
		}
	}

}
