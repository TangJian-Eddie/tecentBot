const schedule = require('node-schedule');
const { isObject, isDate } = require('./type');

function setSchedule(rule, callback) {
  let date;
  if (isObject(rule)) {
    date = new schedule.RecurrenceRule();
    for (const key in rule) {
      date[key] = rule[key];
    }
  } else if (isDate(rule)) {
    date = rule;
  } else {
    throw new Error();
  }
  schedule.scheduleJob(date, callback);
}

module.exports = {
  setSchedule,
};
