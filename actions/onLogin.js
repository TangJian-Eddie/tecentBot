const schedule = require('../utils/schedule');
const superagent = require('../api');
const config = require('../config');
const time = require('../utils/time');
const onRequest = require('./onRequest');

let GREET_JOB;
let OFF_JOB;
let DRINK_JOB;

function initSchedule(bot) {
  initGreetingSchedule(bot);
  initDrinkingSchedule(bot);
}
// 每天问候任务
function initGreetingSchedule(bot) {
  if (!GREET_JOB) {
    GREET_JOB = schedule.setSchedule(config.INIT_TIME, () => {
      initGreeting(bot);
      clearRequestList(bot);
    });
  }
  if (!OFF_JOB) {
    OFF_JOB = schedule.setSchedule(config.OFFLINE_TIME, () => {
      bot.sendPrivateMsg(config.GREET_ID, config.GOOD_NIGHT_GREETING);
    });
  }
}

// 定时喝水任务
function initDrinkingSchedule(bot) {
  if (!DRINK_JOB) {
    DRINK_JOB = schedule.setSchedule(config.REMIND_TIME, () => {
      bot.sendPrivateMsg(config.GREET_ID, '到整点的喝水时间了');
    });
  }
}

async function initGreeting(bot) {
  const one = await superagent.getOne(); // 获取每日一句
  bot.sendPrivateMsg(config.GREET_ID, `${config.NICKNAME}机器人上线了`);
  bot.sendPrivateMsg(
    config.GREET_ID,
    `今天是和${config.NICKNAME}相恋的第${time.getDay(config.MEMORIAL_DAY)}天`
  );
  bot.sendPrivateMsg(config.GREET_ID, one);
  for (const item of config.CITY) {
    const weather = await superagent.getBaiDuWeather(item); // 获取天气信息
    await bot.sendPrivateMsg(config.GREET_ID, weather);
  }
}

/**
 * 清空申请列表
 */
async function clearRequestList(bot) {
  const res = await bot.getSystemMsg();
  if (res.retcode === 0) {
    for (const item of res.data) {
      onRequest(bot, item);
    }
  }
}
/**
 * 登录成功监听事件
 * @param {*} user 登录用户
 */
async function onLogin(bot) {
  initSchedule(bot);
  initGreeting(bot);
  clearRequestList(bot);
}

module.exports = onLogin;
