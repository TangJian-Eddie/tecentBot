const md5 = require("md5");
const config = require("../config");
function getReqSign(obj) {
  const newkey = Object.keys(obj).sort();
  let params = {};
  for (let i = 0; i < newkey.length; i++) {
    params[newkey[i]] = obj[newkey[i]];
  }
  let str = "";
  for (const k in params) {
    if (params.hasOwnProperty(k) && params[k]) {
      str += k + "=" + encodeURIComponent(params[k]) + "&";
    }
  }
  str += "app_key=" + config.TECENT_APPKEY;
  let sign = md5(str).toUpperCase();
  return sign;
}

module.exports = {
  getReqSign,
};
