var TOUKATSU_CALENDAR_ID = 'masaya.sakurai@di-v.co.jp'; //カレンダーID

var toukatus_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('予定表');
var set_date = toukatus_sheet.getRange(1, 1).getValue();
var last_date = new Date(set_date.getFullYear(), set_date.getMonth()+1, 0);
var last_day = last_date.getDate()

var toukatsu_today = new Date();
var toukatsu_month = 1 + toukatsu_today.getMonth();

function firstToukatsuCheck() {
  var check = Browser.msgBox("統括のシフトを取得します。", "続行しますか？", Browser.Buttons.OK_CANCEL);
  if (check == 'ok') {
    getCalendarEvents_();
    Browser.msgBox("完了しました。");
  }
  if (check == 'cancel') {
    Browser.msgBox("処理はキャンセルされました。");
  }
}


function getCalendarEvents_() {
  var toukatsu_calendar = CalendarApp.getCalendarById(TOUKATSU_CALENDAR_ID);
  var startTime = new Date('2021/' + toukatsu_month + '/01 00:00:00');
  var endTime = new Date('2021/' + toukatsu_month + '/' + last_day + ' 23:59:59');

  var events = toukatsu_calendar.getEvents(startTime, endTime);

  var values = [];
  events.forEach( function(event) {
    var record = [
      event.getTitle(),
      event.getStartTime(),
      event.getEndTime()
    ];
    var startToday = Utilities.formatDate(record[1],"JST", "HH");
    var endToday = Utilities.formatDate(record[2],"JST", "HH");

    if (record[0] == "統括シフト") {
      if (startToday == 10 && endToday == 16) {
        record = "統A"
        values.push(record);
      } else if (startToday == 16 && endToday == 22) {
        record = "統B"
        values.push(record);
      }
    } else if (record[0] == "勤務") {
      if (startToday == 10 && endToday == 19) {
        record = "勤10-19"
        values.push(record);
      } else if (startToday == 14 && endToday == 22 || startTime == 13 && endToday == 22) {
        record = "勤14-22"
        values.push(record);
      } 
    } else if (record[0] == "公休" || record[0] == "有給") {
      record = "公"
      values.push(record);
    } else if (record[0] == "午前半休") {
      record = "前休"
      values.push(record);
    } else if (record[0] == "午後半休") {
      record = "後休"
      values.push(record);
    } else if (record[0].match(/月次総会/)) {
      record = "総会"
      values.push(record);
    }
  });
  var ary = []; for (var i=0; i<values.length; i++) { ary.push([values[i]]); }
  var _ = Underscore.load();
  var new_ary = _.zip.apply(_, ary);
  SpreadsheetApp.getActiveSheet().getRange(4, 2, 1, values.length).setValues(new_ary);

}
