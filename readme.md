[![Build Status](https://travis-ci.org/thaliproject/pique.svg)](https://travis-ci.org/thaliproject/pique)
[![GitHub version](https://img.shields.io/github/tag/thaliproject/pique.svg)](https://github.com/thaliproject/pique)
[![NPM version](https://img.shields.io/npm/v/pique.svg)](https://www.npmjs.com/package/pique)
[![Downloads](https://img.shields.io/npm/dm/pique.svg)](https://www.npmjs.com/package/pique)
# Pique - A Promise Queue for JavaScript

Pique is a library that creates a queue of functions that are guaranteed to be run exactly once and in serial FIFO order. So that the first enqueue function will complete before the second is executed.

Below is the basic usage of the priority queue by adding items to the queue with the `push` method.

```js
const Pique = require('pique');

const pq = new Pique();

const firstPromise = pq.push((resolve, reject) => {
  $http.get(gameData).then(resolve).catch(reject);
}).then(result => {
  populateGameData(result);
}).catch(err => {
  handleError(err);
});

const secondPromise = pq.push((resolve, reject) => {
  $http.get(playerData).then(resolve).catch(reject);
}).then(result => {
  populdatePlayerData(result);
}).catch(err => {
  handleError(err);
});
```

We can also add items to the front of the queue with the `unshift` method.

```js
const Pique = require('pique');

const pq = new Pique();

const firstPromise = pq.push((resolve, reject) => {
  $http.get(gameData).then(resolve).catch(reject);
}).then(result => {
  populateGameData(result);
}).catch(err => {
  handleError(err);
});

// Add to the front of the list
const secondPromise = pq.unshift((resolve, reject) => {
  $http.get(playerData).then(resolve).catch(reject);
}).then(result => {
  populdatePlayerData(result);
}).catch(err => {
  handleError(err);
});
```

To show the `push` versus `unshift` in action, let's take a contrived example of putting several promises together and we will show the results in different orders based upon which method we used.

```js
const Pique = require('pique');

const pq = new Pique();

// Set the first for 20 seconds
pq.push((res) => setTimeout(() => res(42), 20000))
  .then((x) => console.log(x));

// Set the second up to first at 15 seconds
pq.unshift((res) => setTimeout(() => res(56), 15000))
  .then((x) => console.log(x));

// Set the second up one at 10 seconds
pq.unshift((res) => setTimeout(() => res(78), 10000))
  .then((x) => console.log(x));

// Finally add one for 5 seconds
pq.push((res) => setTimeout(() => res(96), 5000))
  .then((x) => console.log(x));

// => 78
// => 56
// => 42
// => 96
```

If you are not in an environment with a native Promise, you can set your own using the `configure` method to specify which ES2015 compliant Promise implementation you like.

```js
const Pique = require('pique');

Pique.configure(require('lie'));

const pq = new Pique();
```

## Installation

You can use Pique in both the browser and Node.js.

### NPM

You can install Pique by installing via NPM.

```bash
$ npm install pique
```

### Browser

Of you can reference the `pique.js` or `pique.min.js` in your browser.

```html
<script src="pique.min.js"></script>
```

## Documentation

### `Pique` constructor ##
- [`constructor`](#pique)

### `Pique` Class Methods ##
- [`configure(promiseCtor)`](#piqueconfigurepromisector)

### `Pique` Instance Methods ##
- [`push(fn)`](#piqueprototypepushfn)
- [`unshift(fn)`](#piqueprototypeunshiftfn)

## _Pique Constructor_ ##

### <a id="pique"></a>`Pique()`

Creates a queue of functions that are guaranteed to be run exactly once and in serial FIFO order. So that the first enqueue function will complete before the second is executed.

#### Example
```js
const Pique = require('pique');

const pq = new Pique();

pq.push((resolve, reject) => {
  setTimeout(() => res(42), 5000);
}).then(result => {
  console.log(result);
});
```

* * *

## _Pique Class Methods_ ##

### <a id="piqueconfigurepromisector"></a>`Pique.configure(promiseCtor)`

Configures which Promise constructor to use for creating Promises for chaining.  Note that this can be any Promise implementation that is ES2015 compliant.

#### Arguments
1. `promiseCtor`: `Object` - A Promise constructor used to create promises.  Note that this must be ES2015 compliant to support both `then` and `catch` methods.

#### Example

```js
const Pique = require('pique');

Pique.configure(require('lie'));

const pq = new Pique();
```
* * *

### <a id="piqueprototypepushfn"></a>`Pique.prototype.push(fn)`

Enqueue a function to be executed only when all the functions enqueued before it have been executed.

#### Arguments
1. `fn`: `Function` - This is the callback function used in a Promise. The function that will be called when its turn in the queue comes up. The function takes as arguments the resolve and reject functions used with promises. So the function can run asynchronously and indicate their success or failure using the resolve or reject function arguments.  This takes the following arguments:
    - `resolve`: `Function` - used to resolve the Promise.
    - `reject`: `Function` - used to reject the Promise.

#### Returns

`Promise` - A promise that will resolve or be rejected depending on the outcome of the submitted function.

#### Example

```js
const Pique = require('pique');

const pq = new Pique();

pq.push((resolve, reject) => {
  setTimeout(() => res(42), 5000);
}).then(result => {
  console.log(result);
});

pq.push((resolve, reject) => {
  setTimeout(() => res(56), 5000);
}).then(result => {
  console.log(result);
});

// => 42
// => 56
```
* * *

### <a id="piqueprototypeunshiftfn"></a>`Pique.prototype.unshift(fn)`

Enqueue a function at the head of the queue. It will be executed as soon as the current promise (if any) resolves, before anyone who called enqueue. If multiple calls are made to enqueueAtTop then they will be enqueued at the head of the queue in LIFO order.

#### Arguments
1. `fn`: `Function` - This is the callback function used in a Promise. The function that will be called when its turn in the queue comes up. The function takes as arguments the resolve and reject functions used with promises. So the function can run asynchronously and indicate their success or failure using the resolve or reject function arguments.  This takes the following arguments:
    - `resolve`: `Function` - used to resolve the Promise.
    - `reject`: `Function` - used to reject the Promise.

#### Returns

`Promise` - A promise that will resolve or be rejected depending on the outcome of the submitted function.

#### Example

```js
const Pique = require('pique');

const pq = new Pique();

pq.push((resolve, reject) => {
  setTimeout(() => res(42), 5000);
}).then(result => {
  console.log(result);
});

pq.unshift((resolve, reject) => {
  setTimeout(() => res(56), 1000);
}).then(result => {
  console.log(result);
});

// => 56
// => 42
```
* * *

# LICENSE

The MIT License (MIT)

Copyright (c) 2016 Microsoft Corporation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
