const schedule = require("node-schedule");
const path = require("path");
const { createClient } = require("oicq");
const cryto = require("crypto");
const superagent = require("./superagent");
const config = require("./config");
const time = require("./utils/time");
// 参数设定
const { uin, password } = config.USER_CONFIG;
const password_md5 = cryto.createHash("md5").update(password).digest("hex");
const hugImg = path.resolve(config.HUG_IMG);

async function initUser() {
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
// 主程序
const bot = createClient(uin, config.LOGIN_COFIG);
//监听并输入滑动验证码ticket(同一设备只需验证一次)
bot.on("system.login.slider", () => {
  process.stdin.once("data", (input) => {
    bot.sliderLogin(input);
  });
});
//监听设备锁验证(同一设备只需验证一次)
bot.on("system.login.device", () => {
  bot.logger.info("验证完成后敲击Enter继续..");
  process.stdin.once("data", () => {
    bot.login(password_md5);
  });
});
// 成功上线
bot.on("system.online", function () {
  console.log("Logged in");
  initUser();
});
// 监听信息
bot.on("message.private", async (data) => {
  if (data.user_id === config.TECENT_ACCOUNT) {
    let message = "";
    for (const item of data.message) {
      if (item.type === "text") {
        message = message + item.data.text;
      }
    }
    const res = message.includes("垃圾 ")
      ? await superagent.getRubbishType(message.replace("垃圾 ", ""))
      : await superagent.getTXAIAnswer(data.user_id, message);
    await bot.sendPrivateMsg(data.user_id, res);
    if (res === "你是最傻的屁")
      bot.sendPrivateMsg(data.user_id, `[CQ:image,file=${hugImg}]`);
  }
});
bot.on("request.group.add", (data) => {
  bot.setGroupAddRequest(data.flag);
});
bot.login(password_md5);

// 每天上线通知
const initRule = new schedule.RecurrenceRule();
for (const key in config.INIT_TIME) {
  initRule[key] = config.INIT_TIME[key];
}
schedule.scheduleJob(initRule, () => {
  bot.login(password_md5);
});
// 定时喝水任务
const remindRule = new schedule.RecurrenceRule();
for (const key in config.REMIND_TIME) {
  remindRule[key] = config.REMIND_TIME[key];
}
schedule.scheduleJob(remindRule, () => {
  bot.sendPrivateMsg(config.TECENT_ACCOUNT, "到整点的喝水时间了");
});
// 每天下线通知
const offlineRule = new schedule.RecurrenceRule();
for (const key in config.OFFLINE_TIME) {
  offlineRule[key] = config.OFFLINE_TIME[key];
}
schedule.scheduleJob(offlineRule, async () => {
  await bot.sendPrivateMsg(
    config.TECENT_ACCOUNT,
    "不知不觉又到了一天说再见的时间了，屁屁早些休息哦~"
  );
  bot.logout();
});
