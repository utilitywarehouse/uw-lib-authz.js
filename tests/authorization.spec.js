const authorization = require('../index');

describe('authorization', () => {
	describe('verify', () => {
		it('permits actions where a personal scope is supplied that matches the entity requested', () => {
			const entity = 'partner';
			const entityId = 'K97777';
			const action = 'read';
			const scopes = [`${entity}.${entityId}.${action}`];

			authorization(entity, action).verify({scopes}, entityId).should.equal(true);
		});

		it('permits actions where a wildcard scope is supplied that matches the entity requested', () => {
			const entity = 'partner';
			const entityId = 'K97777';
			const action = 'read';
			const scopes = [`${entity}.*.${action}`];

			authorization(entity, action).verify({scopes}, entityId).should.equal(true);
		});

		it('permits actions where one of many scopes matches the entity requested', () => {
			const entity = 'partner';
			const entityId = 'K97777';
			const scopes = [`${entity}.${entityId}.read`, `${entity}.${entityId}.write`];

			authorization(entity, 'write').verify({scopes}, entityId).should.equal(true);
		});

		it('rejects actions where no scopes are available', () => {
			const scopes = [];

			authorization('partner', 'read').verify({scopes}, 'K97777').should.equal(false);
		});

		it('rejects actions where the scopes provided are not well-formed', () => {
			const scopes = 'abc';

			authorization('partner', 'read').verify({scopes}, 'K97777').should.equal(false);
		});

		it('rejects actions where the entity provided is not well formed', () => {
			const scopes = [`partner.K97777.read`];

			authorization('partner', 'read').verify({scopes}, '').should.equal(false);
		});

		it('rejects actions where a personal scope does not match the entity ID provided', () => {
			const entity = 'partner';
			const action = 'read';
			const scopes = [`${entity}.K98888.${action}`];

			authorization(entity, action).verify({scopes}, 'K97777').should.equal(false);
		});

		it('rejects actions where a wildcard scope does not match the entity type', () => {
			const entityId = 'K97777';
			const action = 'read';
			const scopes = [`customer.${entityId}.${action}`];

			authorization('partner', action).verify({scopes}, entityId).should.equal(false);
		});

		it('rejects actions where the action is not permitted for the given entity', () => {
			const entity = 'partner';
			const entityId = 'K97777';
			const scopes = [`${entity}.${entityId}.read`];

			authorization(entity, 'write').verify({scopes}, entityId).should.equal(false);
		});
	});

	describe('middleware', () => {
		it('calls next if all checks pass', () => {
			const param = 'entityId';
			const entity = 'partner';
			const entityId = 'K97777';
			const action = 'read';
			const scopes = [`${entity}.${entityId}.${action}`];
			const params = {[param]: entityId};
			const auth = {scopes};
			const req = {params, auth};
			const next = sinon.spy();

			authorization(entity, action).middleware(param)(req, {}, next);

			next.should.have.been.calledOnce;
		});

		it('raises an error if any checks fail', () => {
			const param = 'entityId';
			const scopes = [`partner.K97777.read`];
			const params = {[param]: 'K98888'};
			const auth = {scopes};
			const req = {params, auth};

			(() => authorization('partner', 'read').middleware(param)(req)).should.throw(/Unauthorized/);
		});
	})
});