const schedule = require("node-schedule");
const superagent = require("../api");
const config = require("../config");
const time = require('../utils/time')
const onRequest = require('./onRequest')

function initSchedule(bot) {
  initRemindSchedule(bot);
  initGreetingSchedule(bot);
  initDrinkingSchedule(bot);
}
/**
 * 设置定时任务
 * @param {*} that bot 对象
 * @param {*} item 定时任务项
 */
async function initRemindSchedule(bot) {
  // const scheduleList = await superagent.getScheduleList();
  // for (const item of scheduleList) {
  //   let time = item.isLoop ? item.time : new Date(item.time);
  //   lib.setSchedule(time, async () => {
  //     try {
  //       let contact = await that.Contact.find({ name: item.subscribe });
  //       console.log(`${item.subscribe}的专属提醒开启啦！`);
  //       await contact.say(item.content);
  //       if (!item.isLoop) {
  //         await api.updateSchedule(item._id);
  //       }
  //     } catch (error) {
  //       console.log("设置定时任务错误", error);
  //     }
  //   });
  // }
}
// 每天问候任务
function initGreetingSchedule(bot) {
  const greetRule = new schedule.RecurrenceRule();
  for (const key in config.INIT_TIME) {
    greetRule[key] = config.INIT_TIME[key];
  }
  schedule.scheduleJob(greetRule, () => {
    initGreeting(bot);
    clearRequestList(bot)
  });
  const offlineRule = new schedule.RecurrenceRule();
  for (const key in config.OFFLINE_TIME) {
    offlineRule[key] = config.OFFLINE_TIME[key];
  }
  schedule.scheduleJob(offlineRule, () => {
    bot.sendPrivateMsg(config.TECENT_ACCOUNT, config.GOOD_NIGHT_GREETING);
  });
}

// 定时喝水任务
function initDrinkingSchedule(bot) {
  const drinkRule = new schedule.RecurrenceRule();
  for (const key in config.REMIND_TIME) {
    drinkRule[key] = config.REMIND_TIME[key];
  }
  schedule.scheduleJob(drinkRule, () => {
    bot.sendPrivateMsg(config.TECENT_ACCOUNT, "到整点的喝水时间了");
  });
}

async function initGreeting(bot) {
  const one = await superagent.getOne(); //获取每日一句
  const weather = await superagent.getWeather(); //获取天气信息
  bot.sendPrivateMsg(config.TECENT_ACCOUNT, `${config.NICKNAME}机器人上线了`);
  bot.sendPrivateMsg(
    config.TECENT_ACCOUNT,
    `今天是和${config.NICKNAME}相恋的第${time.getDay(config.MEMORIAL_DAY)}天`
  );
  bot.sendPrivateMsg(config.TECENT_ACCOUNT, one);
  bot.sendPrivateMsg(config.TECENT_ACCOUNT, weather);
}

/**
 * 清空申请列表
 */
 export function clearRequestList(bot){
  const res = await bot.getSystemMsg()
  if(res.retcode===0){
    for(const item of res.data){
      onRequest(item)
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
