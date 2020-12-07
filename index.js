const schedule = require("node-schedule");
const path = require("path");
const { createClient } = require("oicq");
const cryto = require("crypto");
const superagent = require("./superagent/index");
const req = require("./superagent/superagent");
const cheerio = require("cheerio");
// 参数设定
const userConfig = {
  uin: 1836303806,
  password: "jax19981203",
};
const hugImg = path.resolve("./assets/EAB1F74492BB2AE64127D8C567F2364A.gif");

const weatherURL = "https://tianqi.moji.com/weather/china/Guangdong/shenzhen";

// 获取墨迹天气提示信息
function getWeatherTips() {
  return new Promise(async (resolve, reject) => {
    const res = await req.req(weatherURL, "GET");
    let html = res.text || "";
    let $ = cheerio.load(html);
    let temp = $(".wea_weather em").text().trim() + "℃";
    let desc = $(".wea_weather b").text().trim();
    let water = $(".wea_about span").text().trim();
    let win = $(".wea_about em").text().trim();
    let tips = $(".wea_tips em").text().trim();
    let words = `今日深圳天气\n${desc}\n温度：${temp}\n湿度：${water}\n风力：${win}\n${tips}`;
    resolve(words);
  });
}

async function initUser() {
  let one = await superagent.getOne(); //获取每日一句
  let weather = await getWeatherTips(); //获取天气信息
  bot.sendPrivateMsg(2444795139, "臭屁屁机器人上线了");
  bot.sendPrivateMsg(2444795139, one);
  bot.sendPrivateMsg(2444795139, weather);
}
// 主程序
const { uin, password } = userConfig;
const password_md5 = cryto.createHash("md5").update(password).digest("hex");
const bot = createClient(uin);
bot.login(password_md5);
// 验证码登录
bot.on("system.login.captcha", () => {
  process.stdin.once("data", (input) => {
    bot.captchaLogin(input);
  });
});
// 成功上线
bot.on("system.online", initUser);
// 监听信息
bot.on("message", async (data) => {
  if (data.message_type === "private" && data.user_id === 2444795139) {
    console.log(data);
    const res = await bot.sendPrivateMsg(data.user_id, "你是最傻的屁");
    bot.sendPrivateMsg(data.user_id, `[CQ:image,file=${hugImg}]`);
    if (res.status !== "ok") {
      bot.sendPrivateMsg(data.user_id, "你是最傻的屁");
    }
  } else if (data.message_type === "private") {
    console.log(data);
    bot.sendPrivateMsg(data.user_id, `[CQ:image,file=${hugImg}]`);
  }
});
bot.on("request", (data) => console.log(data));
bot.on("notice", (data) => console.log(data));

// 定时喝水任务
let rule = new schedule.RecurrenceRule();
rule.minute = 0;
schedule.scheduleJob(rule, () => {
  bot.sendPrivateMsg(2444795139, "到整点的喝水时间了");
});
