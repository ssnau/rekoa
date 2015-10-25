module.exports = {
  json: function (obj) {
    this.body = JSON.stringify(obj);
    this.type = "application/json";
  }
};
