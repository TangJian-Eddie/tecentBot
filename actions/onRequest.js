/**
 * 自动通过群申请
 */
async function onGroup(bot,data) {
    bot.setGroupAddRequest(data.flag);
}


onRequest(){
    
}
module.exports = onRequest;
