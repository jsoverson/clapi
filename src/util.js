
import async from 'async';

import _ from 'lodash';

export default {
  runHandlers : (defs, args, done) => {
    let handlers = _.pluck(defs, 'handler');
    let boundHandlers = handlers.map(handlerFn => {
      if (handlerFn.length === 3) return handlerFn.bind(null, ...args);
      else return function (cb) {
        handlerFn(...args);
        cb();
      }
    });
    async.series(boundHandlers, (err, results) => { done(err, ...args) });
  }
};
