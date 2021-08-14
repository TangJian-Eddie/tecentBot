const { dealErrorWrap } = require('../utils/errorHandler');
/**
 * 自动通过群申请
 */
function onGroupRequest(bot, data) {
  // 仅通过主动申请的申请
  if (data.sub_type === 'add') {
    dealErrorWrap(bot, 'setGroupAddRequest', [data.flag]);
  }
}
/**
 * 自动通过好友申请
 */
function onPrivateRequest(bot, data) {
  dealErrorWrap(bot, 'setFriendAddRequest', [data.flag]);
}

function onRequest(bot, data) {
  const REQUEST_TYPE_MAP = {
    private: onPrivateRequest,
    group: onGroupRequest,
  };
  REQUEST_TYPE_MAP[data.request_type](bot, data);
}

module.exports = onRequest;
