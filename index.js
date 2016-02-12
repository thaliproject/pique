'use strict';

var LocalPromise = global.Promise;

/** @module Pique */

/**
 * @classdesc Creates a queue of functions that are guaranteed to be run
 * exactly once and in serial FIFO order. So that the first enqueue function
 * will complete before the second is executed.
 *
 * ```javascript
 * var Pique = require('pique');
 * var Pique = new Pique();
 * var firstPromise = Pique.push(function(resolve, reject) {
 *    do stuff...
 * }).then(function(result) {
 *    do more stuff...
 * }).catch(function(err) {
 *    and more stuff...
 * });
 * ```
 *
 * @public
 * @constructor
 */
function Pique () {
  this._globalPromise = LocalPromise.resolve(true);
  this._promiseFunctionArray = [];
}

Pique.configure = function (promiseCtor) {
  LocalPromise = promiseCtor;
};

/**
 * This is just a resolve or reject function returned by a Promise.
 *
 * @private
 * @callback resolveOrRejectFn
 * @param {Object} result
 */

/**
 * We use two different promises to wrap things up, this lets us make sure
 * both promise's resolve/reject functions are called.
 *
 * @private
 * @param {module:Pique~resolveOrRejectFn} localFn Either the local
 * resolve or reject function as appropriate.
 * @param {module:Pique~resolveOrRejectFn} globalResolveFn Always the
 * resolve function since the global queue promise all resolves successfully
 * regardless of the outcome of the local fn.
 * @returns {Function}
 */
function finishPromise (localFn, globalResolveFn) {
  return function (value) {
    localFn(value);
    globalResolveFn();
  };
}

/**
 * This is the callback function used in a Promise. The function that will be
 * called when its turn in the queue comes up. The function takes as arguments
 * the resolve and reject functions used with promises. So the function can run
 * asynchronously and indicate their success or failure using the resolve or
 * reject function arguments.
 *
 * @public
 * @callback promiseFunction
 * @param {module:Pique~resolveOrRejectFn} resolve
 * @param {module:Pique~resolveOrRejectFn} reject
 */

/**
 * This is a function that takes a value as an argument and ideally puts
 * it onto the _promiseFunctionArray either at the start or end depending on
 * the context the function came from.
 *
 * @private
 * @callback unshiftOrPush
 * @param {Object} value
 */

/**
 * @private
 * @param {module:Pique~promiseFunction} fn
 * @param {module:Pique~unshiftOrPush} unshiftOrPushFn
 */
Pique.prototype._changeQueue = function(fn, unshiftOrPushFn) {
  if (!LocalPromise) { throw new Error('A Promise library set by .configure'); }

  var self = this;
  return new LocalPromise(function (localResolve, localReject) {
    unshiftOrPushFn({ fn: fn,
      localResolve: localResolve,
      localReject: localReject});
    self._globalPromise = self._globalPromise.then(function () {
      return new LocalPromise(function (globalResolve) {
        var nextPromise = self._promiseFunctionArray.shift();
        nextPromise.fn(
          finishPromise(nextPromise.localResolve, globalResolve),
          finishPromise(nextPromise.localReject, globalResolve));
      });
    });
  });
};

/**
 * Enqueue a function to be executed only when all the functions enqueued before
 * it have been executed.
 *
 * @public
 * @param {module:Pique~promiseFunction} fn
 * @returns {Promise} A promise that will resolve or be rejected depending
 * on the outcome of the submitted function.
 */
Pique.prototype.push = function (fn) {
  var self = this;
  return self._changeQueue(fn, function (value) {
    self._promiseFunctionArray.push(value);
  });
};

/**
 * Enqueue a function at the head of the queue. It will be executed as soon as
 * the current promise (if any) resolves, before anyone who called enqueue.
 * If multiple calls are made to enqueueAtTop then they will be enqueued at
 * the head of the queue in LIFO order.
 *
 * @public
 * @param {module:Pique~promiseFunction} fn
 */
Pique.prototype.unshift = function (fn) {
  var self = this;
  return self._changeQueue(fn, function (value) {
    self._promiseFunctionArray.unshift(value);
  });
};

module.exports = Pique;
