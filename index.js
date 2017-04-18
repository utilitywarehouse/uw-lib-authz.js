const _ = require('lodash');

_.templateSettings.interpolate = /{:(.*)}/g;

class AuthorizationError extends Error {
	constructor() {
		super();
		this.status = 401;
		this.message = 'Unauthorized'
	}
}

const containsScopes = (wantedScopes, givenScopes) => {
	return _.difference(wantedScopes, givenScopes).length === 0;
}

const extractScopeFromParams = (scope, params) => {
	return _.template(scope)(params);
}

const verify = (req, scopesCollection) => {
	if (!_.isArray(_.get(req, 'auth.scopes'))) {
		return false;
	}

	return _.some(scopesCollection, scopes => {
		const extractedScopes = _.map(scopes,
			s => extractScopeFromParams(s, req.params)
		);
		return containsScopes(extractedScopes, req.auth.scopes);
	})
};

const middleware = scopesCollection => (req, res, next) => {
	if (!verify(req, scopesCollection)) {
		throw new AuthorizationError();
	}

	next();
};

module.exports = {
	verify,
	middleware
};
