.DEFAULT: test

test:
	./node_modules/.bin/mocha -r tests/.bootstrap.js tests

install:
	yarn install
