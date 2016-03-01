
import async from 'async';

export default {
  typeof(obj) {
    var type = ({}).toString.call(obj).slice(8,-1);
    if (type === 'Object') {
      type = obj.toString().slice(8,-1);
    }
    return type;
  },
  findType(type, args) {
    var matching = Array.prototype.slice.call(args).filter(el => this.typeof(el) === type);
    return matching[0];
  },
  runTasks : (defs, args, done) => {
    let boundHandlers = defs.map(handlerFn => {
      if (handlerFn.length === 3) return handlerFn.bind(null, ...args);
      else return function (cb) {
        handlerFn(...args);
        cb();
      };
    });
    async.series(boundHandlers, (err, results) => { done(err, ...args); });
  },
};
