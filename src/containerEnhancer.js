import React, { Component, PropTypes } from 'react'

export default (createSaga) => {

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
					// TODO: runSaga() calls must be cancelled by user-land
					runSaga: (saga) => this.parentRedux.dispatch.global({
						type: '@@LOCAL_REDUX_SAGA_RUN',
						meta: {
							'LOCAL_REDUX_SAGA': {
								fullKey: this.parentRedux.fullKey,
								dispatch: this.parentRedux.dispatch,
								getState: this.parentRedux.getState,
								saga
							}
						}
					})
				}
			}

			componentWillMount() {
				if (createSaga) {
					this.saga = this.parentRedux.runSaga(createSaga())
				}
			}

			componentWillUnmount() {
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