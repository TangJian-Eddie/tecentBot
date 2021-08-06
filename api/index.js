const superagent = require("./superagent");
const config = require("../config/index");
const cheerio = require("cheerio");
const ONE = "http://wufazhuce.com/"; // ONE的web版网站
const weatherURL = `https://tianqi.moji.com/weather/china/${config.CITY}`;

/**
 * 设置定时提醒任务
 * @param {*} obj 任务详情
 * @returns {*} 任务详情
 */
async function setSchedule(obj) {
  try {
    const url = config.HOST + "/addSchedule";
    let res = await superagent.request(url, "POST", null, obj);
    let content = parseBody(res);
    return content.data;
  } catch (error) {
    console.log("更新定时任务失败", error);
  }
}

/**
 * 获取定时提醒任务列表
 */
async function getScheduleList() {
  try {
    const url = config.HOST + "/getScheduleList";
    let res = await superagent.request(url, "GET");
    let text = JSON.parse(res);
    let scheduleList = text.data;
    return scheduleList;
  } catch (error) {
    console.log("更新定时任务失败", error);
  }
}
/**
 * 更新定时提醒任务
 */
async function updateSchedule(id) {
  try {
    const url = config.HOST + "/updateSchedule";
    await superagent.request(url, "PUT", { id: id });
  } catch (error) {
    console.log("更新定时任务失败", error);
  }
}

// 获取每日一句
async function getOne() {
  try {
    const res = await superagent.request(ONE, "GET");
    const $ = cheerio.load(res.text);
    const todayOneList = $("#carousel-one .carousel-inner .item");
    const todayOne = $(todayOneList[0])
      .find(".fp-one-cita")
      .text()
      .replace(/(^\s*)|(\s*$)/g, "");
    return todayOne;
  } catch (err) {
    console.log("错误", err);
    return err;
  }
}

// 获取墨迹天气提示信息
async function getWeather() {
  try {
    const res = await superagent.request(weatherURL, "GET");
    const html = res.text || "";
    const $ = cheerio.load(html);
    const desc = $(".wea_weather b").text().trim();
    const temp = $(".wea_weather em").text().trim() + "℃";
    const water = $(".wea_about span").text().trim();
    const wind = $(".wea_about em").text().trim();
    const tips = $(".wea_tips em").text().trim();
    const live = $(".live_index_grid dl")
      .text()
      .replace(/\s+/g, ",")
      .split(",")
      .slice(1, -1);
    let liveStr = "";
    const list = ["紫外线", "化妆", "防晒", "晾晒"];
    for (let i = 1; i < live.length; i = i + 2) {
      if (list.includes(live[i])) {
        liveStr = liveStr + live[i] + ": " + live[i - 1] + "\n";
      }
    }
    return (words = `${config.CITY_NAME}今日实时天气${desc}\n温度：${temp}\n湿度：${water}\n风力：${wind}\n${liveStr}今日天气提示：${tips}`);
  } catch (err) {
    console.log("错误", err);
    return err;
  }
}

/**
 * 思知智能机器人
 * @param {String} word 信息
 */
async function getAIAnswer(userid, spoken) {
  const url = `https://api.ownthink.com/bot`;
  const res = await superagent.request(url, "GET", {
    appid: config.TXAPAI_APPIDIKEY,
    spoken,
    userid,
  });
  const content = JSON.parse(res.text);
  return content?.data?.type || content.data.type === 50000
    ? content.data.info.text
    : "你是最傻的屁";
}

/**
 * 天行智能机器人
 * @param {String} word 信息
 */
async function getTXAIAnswer(uniqueid, question) {
  question = encodeURI(question);
  const url = `http://api.tianapi.com/txapi/robot/index`;
  const res = await superagent.request(url, "POST", {
    key: config.TXAPIKEY,
    question,
    uniqueid,
  });
  const content = JSON.parse(res.text);
  if (content.code === 150) {
    return await getAIAnswer(uniqueid, question);
  }
  for (const item of content.newslist) {
    if (item.datatype === "text") return item.reply;
  }
  return "你是最傻的屁";
}

/**
 * 获取垃圾分类结果
 * @param {String} word 垃圾名称
 */

async function getRubbishType(word) {
  const url = "http://api.tianapi.com/txapi/lajifenlei/index";
  const res = JSON.parse(
    (await superagent.request(url, "GET", { key: config.TXAPIKEY, word })).text
  );
  if (res.code === 200) {
    const list = {
      0: "：可回收垃圾",
      1: "：有害垃圾",
      2: "：厨余(湿)垃圾",
      3: "：其他(干)垃圾",
    };
    let response = "总共为你查询到以下几种可能的情况：";
    for (const item of res.newslist) {
      response = response + "\n" + item.name + list[item.type];
    }
    return response;
  } else {
    return "暂时还没找到这个分类信息呢";
  }
}

module.exports = {
  getScheduleList,
  setSchedule,
  updateSchedule,
  getOne,
  getWeather,
  getAIAnswer,
  getTXAIAnswer,
  getRubbishType,
};
