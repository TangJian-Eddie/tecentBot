function isObject(input) {
  return Object.prototype.toString.call(input) === '[object Object]';
}

function isDate(input) {
  return Object.prototype.toString.call(input) === '[object Date]';
}

module.exports = {
  isObject,
  isDate,
};
