const config = require('../config');
const superagent = require('../api');
const path = require('path');
const hugImg = path.resolve(config.HUG_IMG);
/**
 * 处理私聊消息事件
 * @description     1. 提醒 2. 垃圾分类 3. 自动回复
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
    // if (message.includes("提醒 ")) {
    //   setSchedule(bot, data, message);
    //   return;
    // }
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

// function setSchedule(bot, data, msg) {
//   let msgArr = msg.replace(/\s+/g, ' ').split(' ');
//   if (msgArr.length > 3) {
//     contentDistinguish(bot, data, msgArr);
//   } else {
//     bot.sendPrivateMsg(
//       data.user_id,
//       '提醒设置失败，请保证每个关键词之间使用空格分割开，并保证日期格式正确。正确格式为：“提醒(空格)我(空格)18:30(空格)下班回家”'
//     );
//   }
// }

// function contentDistinguish(bot, name, keywordArray) {
//   let scheduleObj = {};
//   let today = lib.getToday();
//   scheduleObj.setter = name; // 设置定时任务的用户
//   scheduleObj.subscribe = keywordArray[1] === '我' ? name : keywordArray[1]; // 定时任务接收者
//   if (keywordArray[2] === '每天') {
//     // 判断是否属于循环任务
//     console.log('已设置每日定时任务');
//     scheduleObj.isLoop = true;
//     if (keywordArray[3].includes(':') || keywordArray[3].includes('：')) {
//       let time = keywordArray[3].replace('：', ':');
//       scheduleObj.time = lib.convertTime(time);
//     } else {
//       scheduleObj.time = '';
//     }
//     scheduleObj.content =
//       scheduleObj.setter === scheduleObj.subscribe
//         ? `亲爱的${scheduleObj.subscribe}，温馨提醒：${keywordArray[4].replace(
//             '我',
//             '你'
//           )}`
//         : `亲爱的${scheduleObj.subscribe},${
//             scheduleObj.setter
//           }委托我提醒你，${keywordArray[4].replace('我', '你')}`;
//   } else if (keywordArray[2] && keywordArray[2].includes('-')) {
//     console.log('已设置指定日期时间任务');
//     scheduleObj.isLoop = false;
//     scheduleObj.time =
//       keywordArray[2] + ' ' + keywordArray[3].replace('：', ':');
//     scheduleObj.content =
//       scheduleObj.setter === scheduleObj.subscribe
//         ? `亲爱的${scheduleObj.subscribe}，温馨提醒：${keywordArray[4].replace(
//             '我',
//             '你'
//           )}`
//         : `亲爱的${scheduleObj.subscribe},${
//             scheduleObj.setter
//           }委托我提醒你，${keywordArray[4].replace('我', '你')}`;
//   } else {
//     console.log('已设置当天任务');
//     scheduleObj.isLoop = false;
//     scheduleObj.time = today + keywordArray[2].replace('：', ':');
//     scheduleObj.content =
//       scheduleObj.setter === scheduleObj.subscribe
//         ? `亲爱的${scheduleObj.subscribe}，温馨提醒：${keywordArray[3].replace(
//             '我',
//             '你'
//           )}`
//         : `亲爱的${scheduleObj.subscribe},${
//             scheduleObj.setter
//           }委托我提醒你，${keywordArray[3].replace('我', '你')}`;
//   }
//   addSchedule(bot, scheduleObj);
// }
// async function addSchedule(bot, obj) {
//   try {
//     let scheduleObj = await superagent.setSchedule(obj);
//     let nickName = scheduleObj.subscribe;
//     let time = scheduleObj.time;
//     let Rule1 = scheduleObj.isLoop ? time : new Date(time);
//     let content = scheduleObj.content;
//     let _id = scheduleObj._id;
//     schedule.scheduleJob(Rule1, async () => {
//       console.log('你的专属提醒开启啦！');
//       await bot.sendPrivateMsg(data.user_id, res);
//       if (!scheduleObj.isLoop) {
//         superagent.updateSchedule(_id);
//       }
//     });
//   } catch (error) {
//     console.log('设置定时任务失败', error);
//   }
// }
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
    // if(message.includes("提问 ")){
    // }
    // if(message.includes("回答 ")){
    // }
  }
  if (config.REMIND_GROUP_ID_LIST.includes(data.group_id)) {
    // if(@){
    //     bot.sendPrivateMsg(config.REPORT_ID, `有人在${}@你，请及时查看回复～`)
    // }
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
