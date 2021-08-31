module.exports = {
  USER_CONFIG: {
    // 账号密码
    uin: 2630735172,
    password: 'a7990944c4843ec1b459e4c85818c419',
  },
  LOGIN_COFIG: {
    // 登录设置
    log_level: 'error',
    platform: 5,
  },
  RESPONSE_GROUP_ID_LIST: [1083578622], // 群聊功能群组列表
  REMIND_GROUP_ID_LIST: [609459815, 730382756, 1083578622], // 群聊@提醒群组列表
  RESPONSE_ID_LIST: [2444795139, 905286484], // 私聊专属功能账号列表
  GREET_ID: 2444795139, // 问候账号
  REPORT_ID: 905286484, // 告警账号
  NICKNAME: '臭屁屁', // 问候昵称
  GOOD_NIGHT_GREETING: '不知不觉又到了一天说再见的时间了，臭屁屁早些休息哦~',
  MEMORIAL_DAY: '2018/02/08',
  CITY: ['上海市长宁区', '香港'],
  HUG_IMG: './assets/EAB1F74492BB2AE64127D8C567F2364A.gif',
  INIT_TIME: { minute: 30, hour: 6 }, //上线问候发送时间 每天6点30分发送
  // 提醒喝水时间
  REMIND_TIME: {
    second: 30,
    minute: 0,
    hour: [7, 9, 13, 16, 18, 21],
  },
  OFFLINE_TIME: { minute: 30, hour: 22 }, //下线问候发送时间 每天10点30分发送
  AI_APPID: '39591aab6aa529fcdfa4539d4e28f259', // 思知机器人
  TXAPIKEY: 'ddd77119351e8e8b0d016e5a604a84b0', // 天行接口
  HOST: 'http://127.0.0.1', // 本地接口
  MAX_RETRY_TIME: 3, // 错误重试最大次数
};
