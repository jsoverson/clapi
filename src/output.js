
class Output {
  constructor(init = {}) {
    Object.assign(this, init);
    this.data = [];
  }
  static init(...args) {
    return new this(...args);
  }
  clone() {
    return new Output(this);
  }
  push(...data) {
    this.data.push(...data);
    return this;
  }
  pop() {
    return this.data.pop();
  }
  unshift(...data) {
    this.data.unshift(...data);
    return this;
  }
  shift() {
    return this.data.shift();
  }
  end(data = this.data) {
    console.log(data);
  }
  toString() {
    return `[object ${this.constructor.name}]`
  }
}

export default Output;  