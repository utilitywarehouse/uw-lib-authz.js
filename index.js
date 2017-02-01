const authorization = (entity, action) => {
	const verify = (auth, entityId) => {
		if (!auth || !Array.isArray(auth.scopes)) {
			return false;
		}

		if (typeof entityId !== 'string' || entityId.length === 0) {
			return false;
		}

		const personal = `${entity}.${entityId}.${action}`;
		const wildcard = `${entity}.*.${action}`;

		return auth.scopes.includes(personal) || auth.scopes.includes(wildcard);
	};

	const middleware = param => (req, res, next) => {
		if (!verify(req.auth, req.params[param])) {
			throw new AuthorizationError();
		}

		next();
	};

	return { verify, middleware }
};

class AuthorizationError extends Error {
	constructor() {
		super();
		this.status = 401;
		this.message = 'Unauthorized'
	}
}

module.exports = authorization;