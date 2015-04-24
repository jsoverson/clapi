

class Input {
  constructor(data = {}, argv = process.argv, env = process.env) {
    Object.assign(this, data);
    this.argv = argv;
    this.env = env;
  }
  static init(...args) {
    return new this(...args);
  }
}

export default Input;