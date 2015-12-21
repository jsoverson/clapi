
class Input {
  constructor(data = {}) {
    Object.assign(this, data);
    this.cwd = process.cwd();
  }
  static init(...args) {
    return new this(...args);
  }
  clone(data) {
    return new Input(Object.assign({}, this, data));
  }
  merge(key, data) {
    this[key] = this[key] || {};
    Object.assign(this[key], data);
    return this;
  }
  merged(key, data) {
    var input = this.clone();
    input.merge(...arguments);
    return input;
  }
  toString() {
    return `[object ${this.constructor.name}]`
  }
}

export default Input;