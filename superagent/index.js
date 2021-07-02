const superagent = require("../utils/superagent");
const config = require("../config/index");
const cheerio = require("cheerio");
const ONE = "http://wufazhuce.com/"; // ONE的web版网站
const weatherURL = `https://tianqi.moji.com/weather/china/${config.CITY}`;

// 获取每日一句
async function getOne() {
  try {
    let res = await superagent.request(ONE, "GET");
    let $ = cheerio.load(res.text);
    let todayOneList = $("#carousel-one .carousel-inner .item");
    let todayOne = $(todayOneList[0])
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
    let html = res.text || "";
    let $ = cheerio.load(html);
    let desc = $(".wea_weather b").text().trim();
    let temp = $(".wea_weather em").text().trim() + "℃";
    let water = $(".wea_about span").text().trim();
    let wind = $(".wea_about em").text().trim();
    let tips = $(".wea_tips em").text().trim();
    let live = $(".live_index_grid dl").text();
    live = live.replace(/\s+/g, ",");
    live = live.split(",").slice(1, -1);
    let liveStr = "";
    const list = ["紫外线", "化妆", "防晒", "晾晒"];
    for (let i = 1; i < live.length; i = i + 2) {
      if (list.includes(live[i])) {
        liveStr = liveStr + live[i] + ": " + live[i - 1] + "\n";
      }
    }
    let words = `${config.CITY_NAME}今日实时天气${desc}\n温度：${temp}\n湿度：${water}\n风力：${wind}\n${liveStr}今日天气提示：${tips}`;
    return words;
  } catch (err) {
    console.log("错误", err);
    return err;
  }
}

/**
 * 获取垃圾分类结果
 * @param {String} word 垃圾名称
 */

// async function getRubbishType(word) {
//   let url = TXHOST + "lajifenlei/";
//   let res = await superagent.request(url, "GET", {
//     key: config.TXAPIKEY,
//     word: word,
//   });
//   let content = JSON.parse(res.text);
//   if (content.code === 200) {
//     let type;
//     if (content.newslist[0].type == 0) {
//       type = "是可回收垃圾";
//     } else if (content.newslist[0].type == 1) {
//       type = "是有害垃圾";
//     } else if (content.newslist[0].type == 2) {
//       type = "是厨余(湿)垃圾";
//     } else if (content.newslist[0].type == 3) {
//       type = "是其他(干)垃圾";
//     }
//     let response =
//       content.newslist[0].name +
//       type +
//       "<br>解释：" +
//       content.newslist[0].explain +
//       "<br>主要包括：" +
//       content.newslist[0].contain +
//       "<br>投放提示：" +
//       content.newslist[0].tip;
//     return response;
//   } else {
//     console.log("查询失败提示：", content.msg);
//     return "暂时还没找到这个分类信息呢";
//   }
// }

module.exports = {
  getOne,
  getWeather,
  // getRubbishType,
};
