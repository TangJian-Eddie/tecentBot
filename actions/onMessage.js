const config = require("./config");
const path = require("path");
const hugImg = path.resolve(config.HUG_IMG);
/**
 * 处理私聊消息事件
 * @description     1. 提醒 2. 垃圾分类 3. 自动回复
 * @param {*} bot   bot实例
 * @param {*} data  消息主体
 */
async function onPrivateMessage(bot, data) {
    if (config.TECENT_ACCOUNT.includes(data.user_id)) {
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
}

/**
 * 处理群聊消息事件
 * @description     1. 群聊问答整理
 * @param {*} bot   bot实例
 * @param {*} data  消息主体
 */
async function onGroupMessage(bot, data) {
    if (config.GROUP_ACCOUNT.includes(data.group_id)) {
        let message = "";
        for (const item of data.message) {
          if (item.type === "text") {
            message = message + item.data.text;
          }
        }
        // const res = message.includes("垃圾 ")
        //   ? await superagent.getRubbishType(message.replace("垃圾 ", ""))
        //   : await superagent.getTXAIAnswer(data.user_id, message);
        // await bot.sendPrivateMsg(data.user_id, res);
        // if (res === "你是最傻的屁")
        //   bot.sendPrivateMsg(data.user_id, `[CQ:image,file=${hugImg}]`);
      }
}

async function onMessage(bot, msg) {
    console.log(msg)
    const MESSAGE_TYPE_MAP = {
        private: onPrivateMessage,
        group: onGroupMessage
    }
    MESSAGE_TYPE_MAP[msg.message_type](bot, msg)
}

module.exports = onMessage;
