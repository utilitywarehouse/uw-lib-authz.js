.DEFAULT: test

lint:
	./node_modules/.bin/eslint --fix . && ./node_modules/.bin/prettier --write './*.js'

test:
	./node_modules/.bin/mocha -r tests/.bootstrap.js tests

install:
	yarn install
