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
  let one = await superagent.getOne(); //获取每日一句
  let weather = await superagent.getWeather(); //获取天气信息
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
    bot.login();
  });
});
// 成功上线
bot.on("system.online", function () {
  console.log("Logged in");
  initUser();
});
// 监听信息
bot.on("message.private", async (data) => {
  console.log(data);
  if (data.user_id === config.TECENT_ACCOUNT) {
    let response = "你是最傻的屁";
    const res = await bot.sendPrivateMsg(data.user_id, response);
    bot.sendPrivateMsg(data.user_id, `[CQ:image,file=${hugImg}]`);
    if (res.status !== "ok") {
      bot.sendPrivateMsg(data.user_id, "你是最傻的屁");
    }
  }
});
bot.on("request", (data) => console.log(data));
bot.on("notice", (data) => console.log(data));
bot.login(password_md5);

// 定时喝水任务
let rule = new schedule.RecurrenceRule();
Object.keys(config.REMIND_TIME).forEach((key) => {
  if (typeof config.REMIND_TIME[key] !== "number") {
    rule[key] = new schedule.Range(
      config.REMIND_TIME[key][0],
      config.REMIND_TIME[key][1]
    );
  } else {
    rule[key] = config.REMIND_TIME[key];
  }
});
schedule.scheduleJob(rule, () => {
  bot.sendPrivateMsg(config.TECENT_ACCOUNT, "到整点的喝水时间了");
});
