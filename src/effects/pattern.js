const matchers = {
	wildcard  : () => () => true,
	regexp	  : pattern => input => pattern.test(input.type),
	default   : pattern => input => input.type === pattern,
	array     : patterns => input => patterns.some(p => p === input.type)
}

const matcher = (pattern) => (
	pattern === '*' 
		? matchers.wildcard
		: Array.isArray(pattern) 
			? matchers.array
			: pattern instanceof RegExp 
				? matchers.regexp
				: matchers.default
	)(pattern)

export default (cannotHaveGlobalType) => (pattern) => {
	const check = matcher(pattern)
	return (action) => {
		if (check(action)) {
			if (!action.globalType === cannotHaveGlobalType) {
				return true
			}
		}
		return false
	}
}
