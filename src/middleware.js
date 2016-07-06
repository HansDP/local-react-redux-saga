import { runSaga } from 'redux-saga'

/**
* Creates a redux middleware and connects the local sagas to the redux store
*
* @param {object} [options] A dictionary of options to pass to the [runSaga](http://yelouafi.github.io/redux-saga/docs/api/index.html#runsagaiterator-subscribe-dispatch-getstate-monitor) method. For now there are only two supported options: monitor (which indicates a SagaMonitor) and logger (which indicates a custom log function). If a SagaMonitor is provided, the middleware will deliver monitoring events to the monitor.
*/
export default (options = {}) => (store) => {

	let localEmitters = {}

	const createSubscription = (fullKey) => {
		return (callback) => {
			if (!localEmitters[fullKey]) {
				localEmitters[fullKey] = []
			}
			localEmitters[fullKey].push(callback)

			return () => {
				localEmitters[fullKey] = localEmitters[fullKey].filter((cb) => cb !== callback)
				if (localEmitters[fullKey].length === 0) {
					delete localEmitters[fullKey]
				}
			}
		}
	}

	const beginSaga = (saga, localDispatch, getLocalState, fullKey) => {
		return runSaga(saga, {
			...options,
			subscribe: createSubscription(fullKey),
			dispatch: localDispatch,
			getState: getLocalState
		})
	}

	const notifySagas = (action) => {
		const { type } = action

		const isLocalAction = type && type.indexOf('@@LOCAL_REDUX/') === 0
		if (isLocalAction) {
			// Extract the fullKey from the action.
			const lastIndex = type.lastIndexOf('->')
			if (lastIndex >= 0) {
				const childKey = type.substr(0, lastIndex + 2)
				const localEmitter = localEmitters[childKey]
				if (localEmitter) {
					const localAction = { 
						...action, 
						type: type.substr(childKey.length), 
						globalType: type }
					// Call local emitters
					localEmitter.forEach((subscription) => subscription(localAction))
				}
				// done
				return
			}
		}

		// Call all emitters for global actions
		Object.keys(localEmitters).forEach((localEmitterKey) => {
			const localEmitter = localEmitters[localEmitterKey]
			localEmitter.forEach((subscription) => subscription(action))
		})
	}

	return (next) => (action) => {


		const { type } = action

		// TODO: the full-key thingie can be solved by using a local dispatch instead

		if (type === '@@LOCAL_REDUX_SAGA_RUN') {
			const { fullKey, dispatch: localDispatch, getState: getLocalState, saga } = action.meta.LOCAL_REDUX_SAGA
			return beginSaga(saga, localDispatch, getLocalState, fullKey)
		}

		const { globalType } = action
		if (globalType) {
			if (globalType === '@@LOCAL_REDUX_SAGA_GET_STATE') {
				return store.getState()
			}
			if (globalType == '@@LOCAL_REDUX_SAGA_DISPATCH_GLOBAL') {
				action = action.meta.GLOBAL_ACTION
				// And continue as normal
			}
		}

		const result = next(action) // hit reducers
		notifySagas(action)
		return result
	}
}


// sagaMiddleware.run = (saga, ...args) => {
	// 	check(runSagaDynamically, is.notUndef, 'Before running a Saga, you must mount the Saga middleware on the Store using applyMiddleware')
	// 	check(saga, is.func, 'sagaMiddleware.run(saga, ...args): saga argument must be a Generator function!')
	// 	return runSagaDynamically(saga, ...args)
	// }
