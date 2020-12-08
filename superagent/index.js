const superagent = require("../utils/superagent");
const config = require("../config/index");
const cheerio = require("cheerio");
const getReqSign = require("../utils/getReqSign");
// const crypto = require("crypto");
// let md5 = crypto.createHash("md5");
// const { machineIdSync } = require("node-machine-id");
// let uniqueId = md5.update(machineIdSync()).digest("hex"); // 获取机器唯一识别码并MD5，方便机器人上下文关联
// const TXHOST = "http://api.tianapi.com/txapi/"; // 天行host
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
    let live = $(".live_index_grid dl");
    let live_str;
    let live_number = 0;
    for (let item in live) {
      if (!isNaN(item)) {
        let key;
        let value;
        if (live[item]) {
          for (let issue of live[item].children) {
            if (issue.name === "dt") {
              value = issue.children[0].data;
            }
            if (issue.name === "dd") {
              key = issue.children[0].data;
            }
          }
        }
        if (key === "紫外线") {
          live_str = `${key}：${value}`;
        }
        if (value === "适宜") {
          live_number = live_number + 1;
          live_str = `${live_str}\n${key}：${value}`;
        }
        if (live_number > 2) {
          break;
        }
      }
    }
    let words = `深圳今日实时天气${desc}\n温度：${temp}\n湿度：${water}\n风力：${wind}\n${live_str}\n今日天气提示：${tips}`;
    return words;
  } catch (err) {
    console.log("错误", err);
    return err;
  }
}

// 腾讯AI智能闲聊机器人
async function getTecentReply(word) {
  let url = "https://api.ai.qq.com/fcgi-bin/nlp/nlp_textchat";
  let obj = {
    app_id: config.TECENT_APPID,
    session: "tecentBot",
    time_stamp: parseInt(new Date().getTime() / 1000),
    nonce_str: parseInt(new Date().getTime() / 1000),
    question: word,
    sign: "",
  };
  obj.sign = getReqSign.getReqSign(obj);
  let res = await superagent.request(url, "GET", obj);
  let content = JSON.parse(res.text);
  if (content.ret === 0) {
    let response = content.data.answer;
    console.log(response);
    return response;
  } else {
    console.log(content.msg);
    return "我好像迷失在无边的网络中了，接口调用错误：" + content.msg;
  }
}

// 天行聊天机器人
async function getReply(word) {
  let url = TXHOST + "robot/";
  let res = await superagent.request(url, "GET", {
    key: config.TXAPIKEY,
    question: word,
    mode: 1,
    datatype: 0,
    userid: uniqueId,
  });
  let content = JSON.parse(res.text);
  if (content.code === 200) {
    let response = "";
    if (content.datatype === "text") {
      response = content.newslist[0].reply;
    } else if (content.datatype === "view") {
      response = `虽然我不太懂你说的是什么，但是感觉很高级的样子，因此我也查找了类似的文章去学习，你觉得有用吗<br>《${content.newslist[0].title}》${content.newslist[0].url}`;
    } else {
      response =
        "你太厉害了，说的话把我难倒了，我要去学习了，不然没法回答你的问题";
    }
    return response;
  } else {
    return "我好像迷失在无边的网络中了，你能找回我么";
  }
}

/**
 * 获取垃圾分类结果
 * @param {String} word 垃圾名称
 */

async function getRubbishType(word) {
  let url = TXHOST + "lajifenlei/";
  let res = await superagent.request(url, "GET", {
    key: config.TXAPIKEY,
    word: word,
  });
  let content = JSON.parse(res.text);
  if (content.code === 200) {
    let type;
    if (content.newslist[0].type == 0) {
      type = "是可回收垃圾";
    } else if (content.newslist[0].type == 1) {
      type = "是有害垃圾";
    } else if (content.newslist[0].type == 2) {
      type = "是厨余(湿)垃圾";
    } else if (content.newslist[0].type == 3) {
      type = "是其他(干)垃圾";
    }
    let response =
      content.newslist[0].name +
      type +
      "<br>解释：" +
      content.newslist[0].explain +
      "<br>主要包括：" +
      content.newslist[0].contain +
      "<br>投放提示：" +
      content.newslist[0].tip;
    return response;
  } else {
    console.log("查询失败提示：", content.msg);
    return "暂时还没找到这个分类信息呢";
  }
}

module.exports = {
  getOne,
  getWeather,
  getTecentReply,
  //   getReply,
  //   getRubbishType,
};
