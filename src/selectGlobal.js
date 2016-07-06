import warning from 'warning'
import { select, put } from 'redux-saga/effects'

/**
* Creates an effect that instructs the middleware to invoke the provided selector 
* on the global redux store's state (i.e. returns the result of selector(getState(), ...args)).
*
* If selectGlobal is called without argument (i.e. yield selectGlobal()) then the effect is 
* resolved with the entire state (the same result of a getState() call).
*
* > It's important to note that when an action is dispatched to the store, the middleware first 
*   forwards the action to the reducers and then notifies the Sagas. This means that when you 
*   query the global redux store's state, you get the state after the action has been applied.
*
* **Note:** Preferably, a Saga should be autonomous and should not depend on the global redux 
* store's state. This makes it easy to modify the state implementation without affecting the 
* Saga code. A saga should preferably depend only on its own internal control state when 
* possible. But sometimes, one could find it more convenient for a Saga to query the state 
* instead of maintaining the needed data by itself (for example, when a Saga duplicates the 
* logic of invoking some reducer to compute a state that was already computed by the store).
* 
* @summary Creates an effect that returns (some parts) of the global redux store's state.
*
* @param {Function} selector A function of signature (state, ...args) => args. It takes the current state and optionally some arguments and returns a slice of the global redux store's state
* @param {...object} [args] Optional arguments to be passed to the selector.
* @returns {object} The selected state
*/
export default function* selectGlobal(selector, ...args) {	

	// Use the middleware to get the action store-state
	// In the middleware, if the action has a property globalType = '@@LOCAL_REDUX_SAGA_GET_STATE', then the middleware
	// will return the global state.
	const globlState = yield put({ 
		type: '@@LOCAL_REDUX_SAGA', 
		globalType: '@@LOCAL_REDUX_SAGA_GET_STATE' 
	})

	warning(globlState, 'Could not determine global state. Ensure that ' + 
						'localSagaMiddleware is applied to your redux store. ' +
						'If it has been applied, this problem most likely occurs ' +
						'due to some other midleware that does not return the value ' +
						'of its next() middleware. Try putting localSagaMiddleware as ' +
						'the first middleware in the list')
	
	// TODO: is this correct implementation? maybe should return a promise?

	// Now we have the global state, go and let user-land select the global data.
	return selector(globlState, ...args)
}
