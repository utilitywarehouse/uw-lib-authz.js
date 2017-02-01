# uw-lib-authz.js

A node.js module providing universal(ish) authorization mechanisms for use in utilitywarehouse service implementations.

## Usage

Middleware can be prepared using the following method: `authorization('<entityType>', '<action>').middleware('<parameter>')`,
where the values are as follows:

* entityType - the flavour of entity, for example `partner` or `customer`
* action - the requested action for authorization, e.g. `read` or `write`
* parameter - the express request parameter in which the entity ID can be found -- i.e. the placeholder name in the route.

For example:

```node
const app = express();
const authentication = require('uw-lib-auth.js').oAuth2JWT();
const authorization = require('uw-lib-authz.js');

app.use(authentication.middleware());

app.get('/:id', authorization('partner', 'read').middleware('id'), (req, res) => {
  res.json({auth: req.auth});
});

app.use((error, req, res, next) => {
	res.status(error.status).json(error);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

```

It is also possible to perform authorize manually, where necessary:

```node
const authorization = require('uw-lib-authz.js');

if (!authorization('partner', 'read').verify('K97777')) {
  // Handle authorisation failure.
}
```
