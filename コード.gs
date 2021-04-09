// WebhookURLを追加
let postUrl = "WebhookURL";

// botを投入したいチャンネル名を追加
let postChannel = "#任意のch名を記載";
      
// 使用するシートを取得
let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('予定表'); 

// 今日の日付をDateオブジェクトで取得
let today = new Date();
// 今日が何年なのか取得
let this_year = today.getFullYear();
// 今日が何月なのか取得（01月のように、日付を検索するために必ず２桁で取得する必要があるので下記の記述）
var this_month = ("0"+(today.getMonth() + 1)).slice(-2);
// 今日が何日なのか取得
var this_day = ("0"+(today.getDate() + 1)).slice(-2);
// 今日の日付を"yyyy/MM/dd"の形で再生成
let search_today = this_year + '/' + this_month + '/' + this_day;

function scheduleRemind(){
  // 今日の日付がどこのセルにあるのかをする関数を発火
  let row = get_row_(search_today, sheet);
  // メンバーが何人いるか縦の最大値を取得
  let last_row = sheet.getRange(4, 1).getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow();
  // 今日の日付からTL陣のシフトを取得
  let shift_lists = sheet.getSheetValues(4, row + 1, last_row - 3, 1);
  // reminder用配列を用意
  let reminder = [];

  // シフト一覧を展開し、一つ一つシフトを見やすいように修正する
  shift_lists.forEach( function(shift) {
    if (shift != "") {
      var list = judgeCreate_(shift)
      reminder.push(list);
    } else {
      return false;
    };
  });
  // 最後にシフトに空がなかったかチェック
  if (reminder.length == last_row - 10) {
    // ここでslackへ投稿する
    sendHttpPost_('<!here> \
                  \n本日の統括＆TL陣の勤務予定です。\
                  \n```テスト太郎： ' + reminder[0] + ' \
                  \nテスト次郎： ' + reminder[1] + ' \
                  \nテスト三郎： ' + reminder[2] + ' \
                  \nテスト四郎： ' + reminder[3] + ' \
                  \nテスト五郎： ' + reminder[4] + ' \
                  \nテスト六郎： ' + reminder[5] + ' \
                  \nテストなな郎： ' + reminder[6] + ' \
                  \n```','統括＆TL陣スケジュールbot',':marunouchi:');
  } else {
    sendHttpPost_('<@slackのユーザID> \nシフト表にエラーが発生しました。至急修正してください。','統括＆TL陣スケジュールbot',':marunouchi:');
  }
  
};

// 今日の日付がどこのセルにあるのかを検索する関数
function get_row_(today, sheet){
  // 今月は何日から何日まであるか調べてくる関数を発火し、返り値をarray変数を代入
  var array = get_array_(sheet);
  // 今日の日付がarrayの何番目にあるか調べる
  var row = array.indexOf(today);
  // その結果を返り値rowで返す
  return row;
}

// 今月は何日から何日まであるか調べてくる関数
function get_array_(sheet) {
  // 今月の最終日を取得
  var last_day = sheet.getRange(2, 2).getNextDataCell(SpreadsheetApp.Direction.NEXT).getColumn();
  // 今月の日付を全て取得
  var days = sheet.getSheetValues(2, 2, 1, last_day - 1);
  // 配列の準備
  var array = [];
  // 今月の全日付を１つ１つarray配列に代入する
  days[0].forEach( function(day) {
    // 処理を待つためにスリープ1秒
    Utilities.sleep(1000);
    if (day != '') {
      // GASで取り扱いできるように日付を整形
      var day_format = Utilities.formatDate(day, 'Asia/Tokyo', 'yyyy/MM/dd');
      // array配列に日付を代入
      array.push(day_format);
    }
  });
  array.push(search_today);
  // 今月の日付が配列に収まったら返り値として返す
  return array;
}

// ポストするための関数
function sendHttpPost_(message, username, icon) {
  let jsonData = {
    "channel" : postChannel,
    "username" : username,
    "icon_emoji": icon,
    "text" : message
  };
  let payload = JSON.stringify(jsonData);
  let options = {
    "method" : "post",
    "contentType" : "application/json",
    "payload" : payload
  };
  UrlFetchApp.fetch(postUrl, options);
}

// シフトを見やすくするために書き換える関数
function judgeCreate_(shift) {
  Utilities.sleep(1000);
  if (shift == "勤10-19") {
    var list = "10-19"
    return list;
  } else if (shift == "統A") {
    var list = "10-19 統括シフト（10-16,18-19）"
    return list;
  } else if (shift == "統B") {
    var list = "14-22 統括シフト（16-22）"
    return list;
  } else if (shift == "基10-19") {
    var list = "10-19 通話"
    return list;
  } else if (shift == "基14-22") {
    var list = "14-22 通話"
    return list;
  } else if (shift == "終10-19") {
    var list = "10-19 通話"
    return list;
  } else if (shift == "終11-20") {
    var list = "11-20 通話"
    return list;
  } else if (shift == "終中11-22") {
    var list = "11-22 通話（11-13,19-22）"
    return list;
  } else if (shift == "終中14-19C19-22") {
    var list = "14-22 通話（14-19） チャット（19-22）"
    return list;
  } else if (shift == "終14-22") {
    var list = "14-22 通話"
    return list;
  } else if (shift == "終14-19C19-22") {
    var list = "14-22 通話（14-19） チャット（19-22）"
    return list;
  } else if (shift == "C10-13終14-19") {
    var list = "10-19 チャット（10-13）通話（14-19）"
    return list;
  } else if (shift == "終14-18C19-22") {
    var list = "14-22 通話（14-18）チャット（19-22）"
    return list;
  } else if (shift == "終10-13") {
    var list = "10-13 通話"
    return list;
  } else if (shift == "終19-22") {
    var list = "14-22 シフト外（14-18）通話(19-22）"
    return list;
  } else if (shift == "外14-18C19-22") {
    var list = "14-22 シフト外（14-18）チャット(19-22）"
    return list;
  } else if (shift == "C10-13") {
    var list = "10-19 チャット (10-13）シフト外（14-19）"
    return list;
  } else if (shift == "C10-19") {
    var list = "10-19 チャット"
    return list;
  } else if (shift == "C19-22") {
    var list = "14-22 シフト外（14-18）チャット（19-22）"
    return list;
  } else if (shift == "C14-22") {
    var list = "14-22 チャット"
    return list;
  } else if (shift == "R10-13") {
    var list = "10-19 レビュー（10-13）シフト外（14-19）"
    return list;
  } else if (shift == "R10-13基14-19") {
    var list = "10-19 レビュー（10-13） 通話（14-19）"
    return list;
  } else if (shift == "R10-13終14-19") {
    var list = "10-19 レビュー（10-13） 通話（14-19）"
    return list;
  } else if (shift == "R10-19") {
    var list = "10-19 レビュー"
    return list;
  } else if (shift == "R19-22") {
    var list = "14-22 シフト外（14-18）レビュー（19-22）"
    return list;
  } else if (shift == "R14-22") {
    var list = "14-22 レビュー"
    return list;
  } else if (shift == "R14-18終19-22") {
    var list = "14-22 レビュー（14-18）通話（19-22）"
    return list;
  } else if (shift == "F10-19") {
    var list = "10-19 フォロー"
    return list;
  } else if (shift == "F14-22") {
    var list = "14-22 フォロー"
    return list;
  } else if (shift == "外A") {
    var list = "10-19 シフト外"
    return list;
  } else if (shift == "外B") {
    var list = "11-20 シフト外"
    return list;
  } else if (shift == "外C") {
    var list = "14-22 シフト外"
    return list;
  } else if (shift == "公" || shift == "有" || shift == "年") {
    var list = "休み"
    return list;
  } else if (shift == "前休") {
    var list = "14-22 勤務"
    return list;
  } else if (shift == "後休") {
    var list = "10-13 勤務（午後休日）"
    return list;
  } else if (shift == "総会") {
    var list = "総会"
    return list;
  } else if (shift == "体①") {
    var list = "【平日】体験会① 14:30〜15:30　【土日祝】体験会① 11:30〜12:30"
    return list;
  } else if (shift == "体②") {
    var list = "【平日】体験会② 19:00〜20:00　【土日祝】体験会② 14:30〜15:30"
    return list;
  } else if (shift == "体all") {
    var list = "11-20 体験会① 14:30〜15:30 / 体験会② 19:00〜20:00"
    return list;
  } else if (shift == "体①(外A)") {
    var list = "10-19 シフト外、体験会シフト【平日】体験会① 14:30〜15:30　【土日祝】体験会① 11:30〜12:30"
    return list;
  } else if (shift == "体②(外A)") {
    var list = "10-19 シフト外、体験会シフト【平日】体験会② 19:00〜20:00　【土日祝】体験会② 14:30〜15:30"
    return list;
  } else if (shift == "体①(外B)") {
    var list = "11-20 シフト外、体験会シフト【平日】体験会① 14:30〜15:30　【土日祝】体験会① 11:30〜12:30"
    return list;
  } else if (shift == "体②(外B)") {
    var list = "11-20 シフト外、体験会シフト【平日】体験会② 19:00〜20:00　【土日祝】体験会② 14:30〜15:30"
    return list;
  } else if (shift == "体①(外C)") {
    var list = "14-22 シフト外、体験会シフト【平日】体験会① 14:30〜15:30　【土日祝】体験会① 11:30〜12:30"
    return list;
  } else if (shift == "体②(外C)") {
    var list = "14-22 シフト外、体験会シフト【平日】体験会② 19:00〜20:00　【土日祝】体験会② 14:30〜15:30"
    return list;
  } else {
    console.log("未確認の値が検出されました。" + shift);
    var list = "※要確認"
    return list;
  }
}
