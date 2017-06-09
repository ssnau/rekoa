module.exports = function (Dumb) {
  return {
    getStatus() {
      return Dumb.getName() + ' is in the car';
    }
  };
}
