

class Output {
  constructor(init = {}) {
    Object.assign(this, init);
    this.data = {};
  }
  static init(...args) {
    return new this(...args);
  }
  end(data = this.data) {
    console.log(data);
  }
}

export default Output;  