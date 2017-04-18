const { verify, middleware } = require('../index');

describe('authorization', () => {
	describe('verify', () => {
		it('should return true if requested scope in exists', () => {
			const scopes = ['service.write'];

			verify({auth : {scopes}}, [scopes]).should.equal(true);
		});

		it('should return true if requested scope combination exists (with templating)', () => {
			const entity = 'partner';
			const params = {partnerId : 'K97777'};

			verify({
				params,
				auth : { scopes : ['service.read', `${entity}.${params.partnerId}.read`]}
			}, [['service.read', `${entity}.{:partnerId}.read`]]).should.equal(true);
		});

		it('should return true if at least one requested scopes exists', () => {
			const entity = 'partner';
			const params = {partnerId : 'K97777'};

			verify({
				params,
				auth : { scopes : [`${entity}.${params.partnerId}.read`]}
			}, [['service.read'], [`${entity}.{:partnerId}.read`]]).should.equal(true);
		});

		it('should return false requested scope does not exist', () => {
			const scopes = ['service.write'];

			verify({auth : {scopes : []}}, [scopes]).should.equal(false);
		});

		it('should return false if scope combination does not exist', () => {
			const entity = 'partner';
			const params = {partnerId : 'K97777'};

			verify({
				params,
				auth : { scopes : ['service.read']}
			}, [['service.read', `${entity}.{:partnerId}.read`]]).should.equal(false);
		});

		it('should return false if not even one scope exists', () => {
			const entity = 'partner';
			const params = {partnerId : 'K97777'};

			verify({
				params,
				auth : { scopes : []}
			}, [['service.read'], [`${entity}.{:partnerId}.read`]]).should.equal(false);
		});
	});

	describe('middleware', () => {
		it('calls next if all checks pass', () => {
			const entityId = 'K97777';
			const scopes = [`partner.${entityId}.read`];
			const params = {entityId};
			const auth = {scopes};
			const req = {params, auth};
			const next = sinon.spy();

			middleware([scopes])(req, {}, next);

			next.should.have.been.calledOnce;
		});

		it('raises an error if any checks fail', () => {
			const scopes = [`partner.{:partnerId}.read`];
			const params = {partnerId: 'K98888'};
			const auth = {scopes : [`partner.XXX9999.read`]};
			const req = {params, auth};

			(() => middleware([scopes])(req)).should.throw(/Unauthorized/);
		});
	})
});
