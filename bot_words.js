/* ------------------------------------------------------
   BOTが返す各種言葉
   ------------------------------------------------------ */


var HIGHSCHOOL_ENTRANCE_EXAM_DAY = "Mon, 12 Mar 2018 23:59:59 +0900";   //2018年公立高校入試日（一般選抜）
var PRIVATE_HIGHSCHOOL_OSAKA_ENTRANCE_EXAM_DAY = "Sat 10 Feb 2018 23:59:59 +0900";  //大阪私立高校の多く(2/10)
var PRIVATE_HIGHSCHOOL_NARA_ENTRANCE_EXAM_DAY = "Tue 6 Feb 2018 23:59:59 +0900";  //奈良私立高校の多く(2/6)
  
var UNIVERSITY_ENTRANCE_CENTER_EXAM_DAY = "Sat 13 Jan 2018 23:59:59 +0900"; //2018年大学センター入試日(1/13)
var UNIVERSITY_ENTRANCE_1st_EXAM_DAY = "Sun 25 Feb 2018 23:59:59 +0900"; //2018年大学公立前期入試日(2/25)
var UNIVERSITY_ENTRANCE_2nd_EXAM_DAY = "Mon 12 Mar 2018 23:59:59 +0900"; //2018年大学公立後期入試日(3/12)

//var TEST_DAY = "Thr 31 Nov 2017 09:00:00 +0900";
//var TEST_DAY = "Tue, 13 Mar 2018 23:59:59 +0900";
var TEST_DAY = "Wed, 13 Dec 2017 23:59:59 +0900";

var exam_table = [
//  [ "TEST高校", TEST_DAY],
  [ "公立高校", HIGHSCHOOL_ENTRANCE_EXAM_DAY ],
  [ "私立高校(大阪)", PRIVATE_HIGHSCHOOL_OSAKA_ENTRANCE_EXAM_DAY ],
  [ "私立高校(奈良)", PRIVATE_HIGHSCHOOL_NARA_ENTRANCE_EXAM_DAY ],
  [ "大学センター試験", UNIVERSITY_ENTRANCE_CENTER_EXAM_DAY],
  [ "大学公立前期", UNIVERSITY_ENTRANCE_1st_EXAM_DAY ],
  [ "大学公立後期", UNIVERSITY_ENTRANCE_2nd_EXAM_DAY ]
];

var THIS_APP_DESCRIPTION = "生駒の受験生を応援するアプリだよ。"
                          + String.fromCodePoint(EMOJI_SMILE1)+ "\n"
                          + "https://www.code4ikoma.org/?p=346\n\n"
                          + "生駒の自習室情報を毎日配信するよ（図書館空いてる日のみ。図書館職員さんの書くブログを配信）。"
                          + "\nまた、お友だちと一緒に自習室で学べるようにお友だちが図書館に来たことを通知する機能もあり。"
                          + "\nその他、隠しコマンドもあるので探してみてね。"
                          + "\n\nさぁ、みんなでいこまの学び舎へGO!"
                          + String.fromCodePoint(EMOJI_GU);
/* =============================================================== */
/*   その他、単純返却ワード                                            */
/* =============================================================== */
var bot_reply_table = [
  ["ヘルプ",         THIS_APP_DESCRIPTION],
  ["help",          THIS_APP_DESCRIPTION],
  ["このアプリのURL",   "https://line.me/R/ti/p/-jDawLFDAz"],
  ["このアプリ",     THIS_APP_DESCRIPTION],
  ["開発",           "CODE for IKOMA\nhttps://www.code4ikoma.org/?p=346"],
  ["作ったのは誰やねん",   "ななみのパパ"],
  ["作った人",        "CODE for IKOMA\nhttps://www.code4ikoma.org/?p=346"],
  ["オープンソース",  "https://github.com/code4ikoma/manabiya-ikoma"],
  ["利用規約",       "個人情報としては登録した人のUserIDを取得します。その他喋りかけた内容も参照します。"],
  ["ライセンス",      "@2018 CODE for IKOMA. CC-BY3.0"],
  ["謝辞",           "生駒市図書館ブログ記載のみなさま、生駒市情報政策課の木×３さん、LINEの立花さん、YuMake佐藤さん。\n\nSpecial thanks!"],
  ["協賛",            "<天気情報>\nYuMake LLC https://www.yumake.jp/"],
  ["おてんきおにいさん",  "YuMake佐藤さん！ https://www.yumake.jp/"],
  ["自習室の場所",    "http://lib.city.ikoma.lg.jp/toshow/info.html"],
  ["市長",           "こむちゃん"],
  ["何時から",         "日によって違うよ。早い時は9:30からやってるかな。予定表をチェックしてみてね。\nhttp://www.ikomashi-sg.jp/data/news"],
  ["予定",         "自習室の予定表はここにあるよ。チェックしてみてね。でも予定は未定だから違ったらごめんね\nhttp://www.ikomashi-sg.jp/data/news"],
  ["行こうかな",       "来て来て。待ってるよ。どこの自習室に来てくれる？"],  
  ["バージョン",      "Ver0.18.01071"]   //2018年01/07ビルドの1回目という意味。★★★★リリース時には都度更新すること！★★★★
  
];





/* ------------------------------------------------ */
/* 現時点から入試までの日数計算                          */
/* 入試のテーブルはexam_table                          */
/* 出力: examinfo (index.jsにglobalとして宣言)         */
/* ------------------------------------------------ */
module.exports.get_examination_day = function(){

  var DAY = 24 * 60 * 60 * 1000;

  var dateObjNow = new Date();
//  var dateObjNow = new Date("Tue, 22 Dec 2017 09:02:00 +0900");

  var date_obj;
  var remain_day;
  var i, j;
  
  init_exam_info();

  
  for( i=0; i< exam_table.length; i++ ){
    remain_day = Math.floor((( new Date( exam_table[i][1] )).getTime() - dateObjNow.getTime()) / DAY );
//    console.log("remain_day["+i+"]="+remain_day);
    
    info = new ExamInfo();
    info.exam_name = exam_table[i][0];
    info.exam_remain_day = remain_day;
    
    examinfo[i] = info;
    
  }
};

function init_exam_info(){
  if( examinfo.length != 0 ){
    while( examinfo.length > 0 ){
      examinfo.pop();
    }
  }
}




/* ------------------------------------------------ */
/* BOT受け答え。上記bot_reply_tableから返す             */
/* 入力: bot_reply_words_input                       */
/* 出力: bot_reply_words_output                      */
/* ------------------------------------------------ */
module.exports.get_bot_reply_words = function(){
  
  var i;
  
  if( bot_reply_words_input == ""){
    console.log("[get_bot_reply_words] input is invalid.")
    bot_reply_words_output = "";
    return;
  }
  for(i=0; i<bot_reply_table.length; i++ ){
    if ( bot_reply_words_input.indexOf(bot_reply_table[i][0]) != -1) {
      bot_reply_words_output = bot_reply_table[i][1];
      console.log("hit! No="+i+" input="+bot_reply_words_input+" output="+bot_reply_words_output);
      return;
    }
  }
  
  bot_reply_words_output = "";  //ヒット無
  return;
};

/* ------------------------------------------------ */
/* 現在BOT受け答えが対応している数を返す                  */
/* 入力: なし                                         */
/* 出力: bot_reply_words_output                      */
/* ------------------------------------------------ */
module.exports.get_bot_reply_words_number = function(){
  
  bot_reply_table.length;
  
  var num = bot_reply_table.length + exam_table.length + 20; //+3は「天気」と「テスト」と「bot数」
  var about_num = Math.round( num / 10 ) * 10;

  bot_reply_words_output = String(about_num);
  return;
  
};

