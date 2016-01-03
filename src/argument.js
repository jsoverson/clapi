
import util from './util';
import async from 'async';

class Argument {
  constructor(name, defaultValue, description) {
    this.name = name;
    this.value = defaultValue;
    this.default = defaultValue;
    this.description = description;
    this.isRequired = false;
  }
  toString() {
    return `[object ${this.constructor.name}]`
  }
  static init(...args) {
    return new this(...args);
  }
  required(bool = true) {
    this.isRequired = bool;
  }
}

export default Argument;
