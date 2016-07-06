import { put } from 'redux-saga/effects'
import { ACTION_IGNORE_LOCAL, ACTION_DISPATCH_GLOBAL, META_GLOBAL_ACTION } from '../constants'

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
	// 		When the action has a globalType = ACTION_DISPATCH_GLOBAL, 
	// 		then the wrapped action in the meta-data META_GLOBAL_ACTION will be dispatched instead
	return { 
		type: ACTION_IGNORE_LOCAL, 
		globalType: ACTION_DISPATCH_GLOBAL, 
		meta: {
			[META_GLOBAL_ACTION]: action
		}
	}

}
