const cheerio = require('cheerio');
const superagent = require('./superagent');
const config = require('../config/index');
const CITY_CODE_MAP = require('../utils/transferCityCode');
const ONE = 'http://wufazhuce.com/'; // ONE的web版网站
const weatherBaiDuURL = 'https://weathernew.pae.baidu.com/weathernew/pc';

// 获取每日一句
async function getOne() {
  try {
    const res = await superagent.request(ONE, 'GET');
    const $ = cheerio.load(res.text);
    const todayOneList = $('#carousel-one .carousel-inner .item');
    const todayOne = $(todayOneList[0])
      .find('.fp-one-cita')
      .text()
      .replace(/(^\s*)|(\s*$)/g, '');
    return todayOne;
  } catch (err) {
    console.log('错误', err);
    return err;
  }
}

// 获取百度天气提示信息
async function getBaiDuWeather(city) {
  const params = { query: city, srcid: 4982 };
  try {
    const res = await superagent.request(weatherBaiDuURL, 'GET', params);
    const html = res.text || '';
    const $ = cheerio.load(html);
    const data = $($('script')[0]).html();
    const window = {};
    eval(data);
    const { tplData } = window;
    const { weather, temperature, humidity, wind_direction, wind_power } =
      tplData.weather;
    const humidityPercent = `${humidity}%`;
    const wind = wind_direction + wind_power;
    const { level, ps_pm25 } = tplData.ps_pm25;
    const pm25 = ps_pm25 + ' ' + level;
    const { desc, item: list } = tplData.recommend_zhishu;
    let liveStr = '';
    for (const item of list) {
      liveStr += item.item_title + '\n';
    }
    return `${city}今日实时天气${weather}\n温度：${temperature}\n湿度：${humidityPercent}\n风力：${wind}\npm2.5指数：${pm25}\n${liveStr}今日天气提示：${desc}`;
  } catch (err) {
    console.log('错误', err);
    return err;
  }
}
// 获取中国天气网天气信息
async function getWeather(city) {
  const weatherURL = `http://www.weather.com.cn/weather1d/${CITY_CODE_MAP[city]}.shtml`;
  try {
    const res = await superagent.request(weatherURL, 'GET');
    const html = res.text || '';
    const $ = cheerio.load(html);
    const node = $('.t .clearfix').children().first();
    const desc = node.children('.wea').text().trim();
    const temp = node.children('.tem').text().trim();
    const windNode = node.find($('.win span'));
    const windDirection = windNode.attr('title');
    const wind = windNode.text().trim();
    const live = $('.livezs li')
      .text()
      .replace(/\s+/g, ',')
      .split(',')
      .slice(1, -1);
    let liveStr = '';
    const list = ['感冒指数', '穿衣指数', '紫外线指数'];
    for (let i = 1; i < live.length; i = i + 3) {
      if (list.includes(live[i])) {
        liveStr = liveStr + live[i] + ': ' + live[i + 1] + '\n';
      }
    }
    return `${config.CITY}今日实时天气${desc}\n温度：${temp}\n风力：${
      windDirection + wind
    }\n${liveStr}`;
  } catch (err) {
    console.log('错误', err);
    return err;
  }
}

/**
 * 思知智能机器人
 * @param {String} word 信息
 */
async function getAIAnswer(userid, spoken) {
  const url = 'https://api.ownthink.com/bot';
  const res = await superagent.request(url, 'GET', {
    appid: config.TXAPAI_APPIDIKEY,
    spoken,
    userid,
  });
  const content = JSON.parse(res.text);
  return content?.data?.type || content.data.type === 50000
    ? content.data.info.text
    : '你是最傻的屁';
}

/**
 * 天行智能机器人
 * @param {String} word 信息
 */
async function getTXAIAnswer(uniqueid, question) {
  question = encodeURI(question);
  const url = 'http://api.tianapi.com/txapi/robot/index';
  const res = await superagent.request(url, 'POST', {
    key: config.TXAPIKEY,
    question,
    uniqueid,
  });
  const content = JSON.parse(res.text);
  if (content.code === 150) {
    return await getAIAnswer(uniqueid, question);
  }
  for (const item of content.newslist) {
    if (item.datatype === 'text') return item.reply;
  }
  return '你是最傻的屁';
}

/**
 * 获取垃圾分类结果
 * @param {String} word 垃圾名称
 */

async function getRubbishType(word) {
  const url = 'http://api.tianapi.com/txapi/lajifenlei/index';
  const res = JSON.parse(
    (await superagent.request(url, 'GET', { key: config.TXAPIKEY, word })).text
  );
  if (res.code === 200) {
    const list = {
      0: '：可回收垃圾',
      1: '：有害垃圾',
      2: '：厨余(湿)垃圾',
      3: '：其他(干)垃圾',
    };
    let response = '总共为你查询到以下几种可能的情况：';
    for (const item of res.newslist) {
      response = response + '\n' + item.name + list[item.type];
    }
    return response;
  } else {
    return '暂时还没找到这个分类信息呢';
  }
}

module.exports = {
  getOne,
  getWeather,
  getBaiDuWeather,
  getAIAnswer,
  getTXAIAnswer,
  getRubbishType,
};
