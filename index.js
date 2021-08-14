const { createClient } = require('oicq');
const process = require('process');
const config = require('./config');
const onLogin = require('./actions/onLogin');
const onMessage = require('./actions/onMessage');
const onRequest = require('./actions/onRequest');

// 参数设定
const { uin, password } = config.USER_CONFIG;

// 主程序
const bot = createClient(uin, config.LOGIN_COFIG);

//监听并输入滑动验证码ticket(同一设备只需验证一次)
bot.on('system.login.slider', () => {
  process.stdin.once('data', (input) => {
    bot.sliderLogin(input);
  });
});
//监听设备锁验证(同一设备只需验证一次)
bot.on('system.login.device', () => {
  bot.logger.info('验证完成后敲击Enter继续..');
  process.stdin.once('data', () => {
    bot.login(password);
  });
});
// 成功上线
bot.on('system.online', () => {
  onLogin(bot);
});
// 监听信息
bot.on('message', (data) => {
  onMessage(bot, data);
});
bot.on('request', (data) => {
  onRequest(bot, data);
});

bot.login(password);
