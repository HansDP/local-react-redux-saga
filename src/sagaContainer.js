import React, { Component, PropTypes } from 'react'
import { ACTION_RUN_SAGA, META_RUN_SAGA } from './constants'

/**
 * Creates a container enhancer that enables redux-saga to be used in a
 * isolated (local) React container.
 *
 * @param {Function} [createSaga] Optional method that gets called when the container gets mounted. If provided, this method must return a valid Saga.
 * @returns {Function} A container enhancer for redux-saga.
 */
export default (createSaga) => {

	warning(!createSaga || typeof createSaga === 'function', 'The parameter \'createSaga\' passed in the sagaContainer enhancer must be a function.')

	return (createContainer) => (...args) => (View) => {

		return createContainer(...args)(class ViewWithMiddleware extends Component {

			static contextTypes = {
	            parentRedux: PropTypes.object.isRequired
	        };

	        static childContextTypes = {
	            parentRedux: PropTypes.object.isRequired
	        };

	        getChildContext() {
	            return {
	                parentRedux: this.parentRedux
	            }
	        }

			constructor(props, context) {
				super(props, context)

				const { parentRedux: originalParentRedux } = context

				this.parentRedux = {
					...originalParentRedux,
					runSaga: (saga) => {

						// To run a saga, dispatch a global action instructing the middleware to start the saga.
						//
						// Note: the saga is send to the redux store's middleware, because we want the 
						// side-effects (using sagas) te be run AFTER all reducers have done their work. Sending
						// it to the store's middleware enables that.
						// 
						// It could be possible to create saga emitter (subscribe handler of redux-saga's runSaga)
						// per container in container enhancer, however, it will be hard to ensure that all reducers
						// have kicked in BEFORE we emit() the local dispatched action.
						// 
						// Something like:
						//   const  wrappedReducer = (state, action) => {
						//     const newState = originalReducer(state, action)
						//     localEmitter(action) // -> Question: how to ensure now that all reducers 
						//                                          (local and global) have kicked in?
						//     return newState
						//   }

						const runSagaResult = this.parentRedux.dispatch.global({
							type: ACTION_RUN_SAGA,
							meta: {
								[META_RUN_SAGA]: {
									fullKey: this.parentRedux.fullKey,
									dispatch: this.parentRedux.dispatch,
									getState: this.parentRedux.getState,
									saga
								}
							}
						})
					
						warning(runSagaResult.saga, 'Could not run the given saga. Ensure that ' + 
													'sagaContainerMiddleware is applied to your redux store. ' +
													'If it has been applied, this problem most likely occurs ' +
													'due to some other midleware that does not return the value ' +
													'of its next() middleware. Try putting sagaContainerMiddleware as ' +
													'the first middleware in the list')

						return runSagaResult.saga
					}
				}
			}

			componentWillMount() {
				// Create the default saga, if any
				if (createSaga) {
					this.saga = this.parentRedux.runSaga(createSaga())
				}
			}

			componentWillUnmount() {
				// If a default saga was created, cancel it on unmount.
				if (this.saga) {
					this.saga.cancel()
					this.saga = null
				}
			}

			render() {
				const { parentRedux } = this
				const { runSaga } = parentRedux
				return React.createElement(View, { ...this.props, runSaga })
			}
		})
	}
}