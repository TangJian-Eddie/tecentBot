const { createClient } = require('oicq');
const config = require('./config');
const onLogin = require('./actions/onLogin');
const onMessage = require('./actions/onMessage');
const onRequest = require('./actions/onRequest');

// 参数设定
const { uin, password } = config.USER_CONFIG;

// 主程序
const bot = createClient(uin, config.LOGIN_COFIG);

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
