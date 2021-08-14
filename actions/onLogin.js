const schedule = require('../utils/schedule');
const { dealErrorWrap } = require('../utils/errorHandler');
const superagent = require('../api');
const config = require('../config');
const time = require('../utils/time');
const onRequest = require('./onRequest');

function initSchedule(bot) {
  // initRemindSchedule(bot);
  initGreetingSchedule(bot);
  initDrinkingSchedule(bot);
}
/**
 * 设置定时任务
 * @param {*} that bot 对象
 * @param {*} item 定时任务项
 */
// async function initRemindSchedule(bot) {
//   console.log(bot);
// const scheduleList = await superagent.getScheduleList();
// for (const item of scheduleList) {
//   let time = item.isLoop ? item.time : new Date(item.time);
//   schedule.scheduleJob(time, async () => {
//     try {
//       await bot.sendPrivateMsg(item.subscribe, item.content);
//       if (!item.isLoop) {
//         await superagent.updateSchedule(item._id);
//       }
//     } catch (error) {
//       console.log("设置定时任务错误", error);
//     }
//   });
// }
// }
// 每天问候任务
function initGreetingSchedule(bot) {
  schedule.setSchedule(config.INIT_TIME, () => {
    initGreeting(bot);
    clearRequestList(bot);
  });
  schedule.setSchedule(config.OFFLINE_TIME, () => {
    dealErrorWrap(bot, 'sendPrivateMsg', [
      config.GREET_ID,
      config.GOOD_NIGHT_GREETING,
    ]);
  });
}

// 定时喝水任务
function initDrinkingSchedule(bot) {
  schedule.setSchedule(config.REMIND_TIME, () => {
    dealErrorWrap(bot, 'sendPrivateMsg', [
      config.GREET_ID,
      '到整点的喝水时间了',
    ]);
  });
}

async function initGreeting(bot) {
  const one = await superagent.getOne(); // 获取每日一句
  const weather = await superagent.getWeather(); // 获取天气信息
  bot.sendPrivateMsg(config.GREET_ID, `${config.NICKNAME}机器人上线了`);
  bot.sendPrivateMsg(
    config.GREET_ID,
    `今天是和${config.NICKNAME}相恋的第${time.getDay(config.MEMORIAL_DAY)}天`
  );
  bot.sendPrivateMsg(config.GREET_ID, one);
  bot.sendPrivateMsg(config.GREET_ID, weather);
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
