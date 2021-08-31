const path = require('path');
const config = require('../config');
const superagent = require('../api');
const { dealErrorWrap } = require('../utils/errorHandler');
const hugImg = path.resolve(config.HUG_IMG);
/**
 * 处理私聊消息事件
 * @description     1.自动回复 2. 垃圾分类
 * @param {*} bot   bot实例
 * @param {*} data  消息主体
 */
async function onPrivateMessage(bot, data) {
  if (config.RESPONSE_ID_LIST.includes(data.user_id)) {
    let message = '';
    for (const item of data.message) {
      if (item.type === 'text') {
        message = message + item.data.text;
      }
    }
    const res = message.includes('垃圾 ')
      ? await superagent.getRubbishType(message.replace('垃圾 ', ''))
      : await superagent.getTXAIAnswer(data.user_id, message);
    await bot.sendPrivateMsg(data.user_id, res);
    if (res === '你是最傻的屁')
      bot.sendPrivateMsg(data.user_id, `[CQ:image,file=${hugImg}]`);
  } else {
    bot.sendPrivateMsg(
      config.REPORT_ID,
      '有人给你发送私聊信息，请及时查看回复～'
    );
  }
}
/**
 * 处理群聊消息事件
 * @description     1. 群聊问答整理
 * @param {*} bot   bot实例
 * @param {*} data  消息主体
 */
async function onGroupMessage(bot, data) {
  if (config.RESPONSE_GROUP_ID_LIST.includes(data.group_id)) {
    let message = '';
    for (const item of data.message) {
      if (item.type === 'text') {
        message = message + item.data.text;
      }
    }
    // TODO 群问答整理
    // if(message.includes("提问 ")){
    // }
    // if(message.includes("回答 ")){
    // }
  }
  if (config.REMIND_GROUP_ID_LIST.includes(data.group_id)) {
    for (const item of data.message) {
      if (item.type === 'at' && item.data.qq === config.USER_CONFIG.uin) {
        dealErrorWrap(bot, 'sendPrivateMsg', [
          config.REPORT_ID,
          `有人在${data.group_name}@你，请及时查看回复～`,
        ]);
      }
    }
  }
}

async function onMessage(bot, msg) {
  const MESSAGE_TYPE_MAP = {
    private: onPrivateMessage,
    group: onGroupMessage,
  };
  MESSAGE_TYPE_MAP[msg.message_type](bot, msg);
}

module.exports = onMessage;
