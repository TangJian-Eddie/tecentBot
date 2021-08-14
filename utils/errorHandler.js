const config = require('../config');
// TODO 优化传值策略，更符合常理的函数调用
function dealErrorWrap(bot, func, args) {
  let num = 0;
  return (async function () {
    try {
      await bot[func].apply(bot, args);
    } catch (err) {
      // TODO 错误类型封装，更为清楚的错误上报
      if (num === config.MAX_RETRY_TIME) {
        bot.sendPrivateMsg(config.REPORT_ID, func + '---' + err);
        return;
      }
      num++;
      setTimeout(() => {
        arguments.callee(bot, func, args);
      }, 1000);
    }
  })();
}
module.exports = {
  dealErrorWrap,
};
