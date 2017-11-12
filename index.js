/* 学び舎GO! 生駒の図書館自習室の情報をLINE BOTでお教えします */

/* LINEのCHANNEL_ACCESS_TOKEN を heroku configへ各自セット必要
    heroku config:set CHANNEL_ACCESS_TOKEN=xxxx
    heroku config:set USERID=xxxx
*/

var DEBUG = 0;          //1=DEBUG 0=RELEASE
var LOCAL_DEBUG = 0;    //1=Local node.js利用   0=herokuサーバー利用(default)     

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var $ = require('jquery-deferred');
var pg = require('pg');

var StydyPlaceServerConnection = require('./get_studyplace_info.js');
var get_weatherServerConnection = require('./get_weather.js');

global.StudyRoomInfo = function( ){
  this.title = "";
  this.content = "";
  this.link = "";
  this.date;
}

global.studyroominfomations = new Array();


global.PLACE_IKOMA_ALL = 0;
global.PLACE_IKOMA_TOSHOKAN = 1;   //本館（図書会館）
global.PLACE_IKOMA_HABATAKI = 2;   //北コミュニティセンター(はばたき)
global.PLACE_IKOMA_SESERAGI = 3;   //南コミュニティセンター(せせらぎ)
global.PLACE_IKOMA_SHIKANODAI = 4; //鹿ノ台
global.PLACE_IKOMA_TAKEMARU = 5;   //たけまる
global.PLACE_IKOMA_MIRAKU = 6;     //美楽来

//global.selectplace = PLACE_IKOMA_TOSHOKAN; //現在の設定値
global.selectplace = PLACE_IKOMA_TOSHOKAN; //現在の設定値

var STRING_IKOMA_TOSHOKAN1 = "本館";
var STRING_IKOMA_TOSHOKAN2 = "図書会館";
var STRING_IKOMA_TOSHOKAN3 = "生駒市図書館";

var STRING_IKOMA_HABATAKI1 = "はばたき";
var STRING_IKOMA_HABATAKI2 = "北コミュニティセンター";

var STRING_IKOMA_SESERAGI1 = "せせらぎ";
var STRING_IKOMA_SESERAGI2 = "南コミュニティセンター";

var STRING_IKOMA_SHIKANODAI = "鹿ノ台";

var STRING_IKOMA_TAKEMARU = "たけまる";

var STRING_IKOMA_MIRAKU1 = "美楽来";
var STRING_IKOMA_MIRAKU2 = "みらく";

var STRING_IKOMA_EKIMAE = "駅前";


var input_message="";
var reply_message="";


global.today_weather;
global.today_temperature_high;
global.today_temperature_low;


var LINE_REPLY_URL = "https://api.line.me/v2/bot/message/reply";
var LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";
var LINE_PUSH_URL_MULTICAST = "https://api.line.me/v2/bot/message/multicast";

if( ! LOCAL_DEBUG ){   //heroku
    pg.defaults.ssl = true; 
    var connectionString = process.env.DATABASE_URL;
    var postgres_host = process.env.HOST_NAME;
    var postgres_databases = process.env.DATABASE_NAME;
    var postgres_user = process.env.USER_NAME;
    var postgres_password = process.env.PASSWORD;
}
else{               //local node.js
    var connectionString = "tcp://postgres:postgres@localhost:5432/manabiya_ikoma";
    var postgres_host = "localhost";
    var postgres_databases = "manabiya_ikoma";
    var postgres_user = "postgres";
    var postgres_password = "postgres";
}

var TABLE_INSERT_COMMAND_1 = "INSERT INTO ";
var TABLE_INSERT_COMMAND_2 = " ( id, option1, option2 ) VALUES ($1, $2, $3);";

var FLAG_INSERT = 1;
var FLAG_DELETE = 0;

var db_table = "userid_table";
//var id_list_text;

var id_list = new Array();


var PUSH_BROADCAST_MODE = 1;    //push_notification_modeに設定する値
var PUSH_REPLY_MODE = 2;        //push_notification_modeに設定する値
global.push_notification_mode = PUSH_REPLY_MODE;

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});


/*
app.post('/', function(req, res, next){
	console.log("come / ");
	res.status(200).end();
});
*/

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


app.get('/', function(req, res) {     // https://line-manabiya-ikoma.herokuapp.com/?mode=★    [local] http://localhost:3000/?mode=★ で検証！
  
  
  /* ------------------ test start ------------------
  //StydyPlaceServerConnection.test(studyroominfos)
  StydyPlaceServerConnection.test()
  .done(function(){
    console.log("finish");
    console.log("studyroominfos[0].title="+studyroominfomations[0].title);
    console.log("studyroominfos[1].title="+studyroominfomations[1].title);
    //console.log("studyroominfos[0].title="+studyroominfos[0].title);
  });
  
  ------------------ test end ------------------ */
  
  //send_notification();

  /* ========= DEBUG ここから ================
  input_message = "はばたき";
  
  make_reply_message()
  .done(function(){
    console.log("reply_message = " + reply_message);
  });
    ========================================= */

  
  /* DEBUG
  StydyPlaceServerConnection.get_studyroom_info()
  .done(function(){
    for(var i=0; i<studyroominfomations.length; i++){
      console.log("studyroominfos["+i+"].title="+studyroominfomations[i].title);
    }
  });
  */
  
  /* =============== PUSH通知DEBUG用(ここから) ================ */
  console.log("start get");
  var url = require('url');
  var urlInfo = url.parse(req.url, true);
  var mode = urlInfo.query.mode;
  console.log ("mode="+mode);
  
  
  //LINE BEACON反応したら、お友達来たことをお知らせ
  if (mode == 1) {
    console.log("check_available_time()="+check_available_time());
    //send_notification_hourly();

    console.log("send 200 OK");
    res.status(200).end(); 
  }
  //自習室情報取得してお薦め。ノーマル文章
  else if (mode == 2){
    input_message = "はばたき";
    
    var to_array = new Array();

    //to_array[0] = 'xxx';
    //to_array[1] = 'xxx';
      
    make_reply_message()
    .done(function(){
      console.log("reply_message = " + reply_message);

      send_notification(to_array, "自習室来ない？\n\n" + reply_message);
    });
  }
  
  //天気予報＋自習室情報
  else if (mode == 3){
    input_message = "はばたき";

    make_reply_message()
    .done(function(){
      console.log("reply_message = " + reply_message);

      send_notification("今日は暑いから家より図書館自習室の方がいいと思うよ！\n\n" + reply_message);
    });
  }
  
  //受験本番まであと数日！
  else if (mode == 4){
    input_message = "はばたき";

    make_reply_message()
    .done(function(){
      console.log("reply_message = " + reply_message);

      send_notification("公立高校受験まであと１３３日！　自習室来ないと。。。\n\n" + reply_message);
    });
  }
  else if( mode == 5 ){ //DB test
    

    var id = "1234567";
    
    insert_id2db(id);
    //delete_id2db( id );
    
    
  }
  else if( mode == 6 ){ //DB test
    

    var id = "1234567";
    
    delete_id2db( id );
    
    
  }
  else if( mode == 7 ){ //DB test
    
    read_id_from_db( )
    .done(function(){
      send_notification(id_list, "自習室来ない？\n\n");
      console.log("ID_LIST="+ id_list);
    });
  }
  
  else if ( mode == 9 ){  //天気情報テスト
    
      get_weatherServerConnection.get_today_weather()
      .done(function(){

        //reply_message = "今日は寒い１日になるってよ。気温が" +today_temperature_high + "度までしかあがらないんだって。しっかり加湿して風邪ひかないでね。今日の天気は"+today_weather+"。";
        
        if( today_temperature_high == ""){
          console.log("NO temperature");
          reply_message = "\n\n天気は"+today_weather+ "。だよ";
        }
        else if( Number(today_temperature_high) >= 30 ){
          reply_message = "\n\n今日は暑いね。水分よくとってね。最高気温が"+today_temperature_high+"度になるってよ～。("+today_weather+")";
        }
        else if( Number(today_temperature_high) < 15 ){
          reply_message = "\n\n今日は寒い１日になるってよ。気温が" +today_temperature_high + "度までしかあがらないんだって。しっかり加湿して風邪ひかないでね。今日の天気は"+today_weather+"。";
        }
        else{
          reply_message = "\n\n今日の天気は"+today_weather+"、最高気温は"+today_temperature_high+"度だって。今日も頑張って行きましょう！";
        }
        
        
        console.log("reply_message = "+reply_message);
        send_notification(reply_message);
      });
      
  }
  else{
    
  }
  /* =============== PUSH通知DEBUG用(ここまで) ================ */
  
  console.log("send 200 OK");
  res.status(200).end();

  
});





app.post('/webhook', function(req, res, next){
	
	console.log("start post method");
  reply_message = "";   //初期化

    res.status(200).end();

  
  // [参考] http://whippet-818.hatenablog.com/entry/2017/02/07/004558

    for (var event of req.body.events){
		//var event = req.body.events[0];
      
        if (event.type == 'message'){          
          console.log("====================\n");
          console.log("LINE message event come now.")
          //console.log(event);
          console.log("====================\n");
          
          input_message = event.message.text;
  
          make_reply_message()
          .done(function(){
            console.log("reply_message = " + reply_message);
            
            var headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.CHANNEL_ACCESS_TOKEN
            }
            var body = {
                replyToken: event.replyToken,
                messages: [{
                    type: 'text',
                    text: reply_message
                    //text: event.message.text    //おうむ返し
                }]
            }

            request({
                url: LINE_REPLY_URL,
                method: 'POST',
                headers: headers,
                body: body,
                json: true
            });
            
          });
          
          
          

        }

        // 以下がビーコンに関するコードです        
        // 参考文献：https://qiita.com/n0bisuke/items/60523ea48109320ad4a5
        else if (event.type == 'beacon'){
            console.log("====================\n");
            console.log("beacon event fire.")
            //console.log(event);
            console.log("====================\n");
          
            var headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.CHANNEL_ACCESS_TOKEN
            }
            var body = {
                to: "受信したビーコンからグループのID取得してここに設定",
                messages: [{
                    type: 'text',
                    //text: 'henoheno'
                    text: '〇〇さんが自習室に来たよ！'    // 〇〇さんが自習室に来たよ！
                }]
            }
            request({
                url: LINE_PUSH_URL,
                method: 'POST',
                headers: headers,
                body: body,
                json: true
            });
        }
      
      // アカウントが友だち追加またはブロック解除された
      else if(( event.type == 'follow' ) || ( event.type == 'unfollow' )){
        console.log("====================\n");
        console.log("follow/unfollow event.ともだち追加/削除してくれたよ")
        //console.log(event);
        console.log("====================\n");
        
        if( event.source.type == "user" ){
          if (typeof event.source.userId === 'undefined') {
            console.log("follow event but not user???");
          }else{
            var new_follower_id = event.source.userId;
            console.log("new_member="+new_follower_id);
            
            //★DB追加・削除
            if( event.type == 'follow' ){
              insert_id2db( new_follower_id );
            }
            else if ( event.type == 'unfollow' ){
              delete_id2db( new_follower_id );
            }
            else{
              //don't care.
            }
            
          }
        }
        else{
          console.log("follow event but not user???");
        }
      }
      
      
      //よくわからないメッセージ受信
      else{
        console.log("NOT text");    //★★LINEスタンプを返そう。「ごめんわからないよー」とかの意味の
      }

    }
});

module.exports.send_notification_hourly = function(req, res){
//function send_notification_hourly(){
  
  input_message = "はばたき";   //★暫定
  
  if(!DEBUG){
    if( check_available_time() == 0 ) return;   //自習室時間外には通知しない
  }
  
  read_id_from_db( )
  .done(function(){
    console.log("ID_LIST="+ id_list);
    if( id_list.length == 0){
      return;
    }
    
      make_reply_message()
      .done(function(){
        
        if( reply_message != ""){
          console.log("reply_message = " + reply_message);
          send_notification( id_list, "はばたき自習室来ない？\n\n" + reply_message);
        }
        console.log("\n----- send_notification_hourly done! ------\n");
  });
    
    
  });
  
  /*
  make_reply_message()
  .done(function(){
    console.log("reply_message = " + reply_message);

    send_notification( id_list_text, "自習室来ない？\n\n" + reply_message);
  });
  */
        
  /*
  get_weatherServerConnection.get_today_weather()
  .done(function(){

    //reply_message = "今日は寒い１日になるってよ。気温が" +today_temperature_high + "度までしかあがらないんだって。しっかり加湿して風邪ひかないでね。今日の天気は"+today_weather+"。";

    if( today_temperature_high == ""){
      console.log("NO temperature");
      reply_message = "\n\n天気は"+today_weather+ "。だよ";
    }
    else if( Number(today_temperature_high) >= 30 ){
      reply_message = "\n\n今日は暑いね。水分よくとってね。最高気温が"+today_temperature_high+"度になるってよ～。("+today_weather+")";
    }
    else if( Number(today_temperature_high) < 15 ){
      reply_message = "\n\n今日は寒い１日になるってよ。気温が" +today_temperature_high + "度までしかあがらないんだって。しっかり加湿して風邪ひかないでね。今日の天気は"+today_weather+"。";
    }
    else{
      reply_message = "\n\n今日の天気は"+today_weather+"、最高気温は"+today_temperature_high+"度だって。今日も頑張って行きましょう！";
    }


    console.log("reply_message = "+reply_message);
    send_notification(reply_message);
  });
  */
  
  
//}
};    //module.exports おわり

function send_notification( destination, push_message){
  
  console.log("send_notification destination="+destination);
    var headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.CHANNEL_ACCESS_TOKEN
    }
    var body = {
//        replyToken: event.replyToken,
          to: destination,
//        to: process.env.USERID, 
        messages: [{
          type: 'text',
          text: push_message
        //text: event.message.text    //おうむ返し
        }]
    }

      request({
   //     url: LINE_PUSH_URL,
        url: LINE_PUSH_URL_MULTICAST,
        method: 'POST',
        headers: headers,
        body: body,
        json: true
      });
}









/* ユーザー入力文字から返答文面を作成 */
function make_reply_message( ){
  var input = input_message;
  var output="";
  console.log("input="+input);
  
  //図書館名が入ってたら本日の図書館状況を図書館ブログから返す
  //output = make_lib_studyplace_status_message( input );

  //////////////////////////
  
  var dfd = new $.Deferred;
  
  var lib_num = pickup_lib_name( input );
  
  if( lib_num > 0 ){
    selectplace = lib_num;
    
    //図書館ブログ検索
    StydyPlaceServerConnection.get_studyroom_info()
      .done(function(){
      
      /* ----
        for(var i=0; i<studyroominfomations.length; i++){
          console.log("---------------------------");
          console.log("studyroominfos["+i+"].title="+studyroominfomations[i].title);
          
          var display_date = make_display_data_format(studyroominfomations[i].date);
          
          output = studyroominfomations[i].title + " " 
            + display_date + " " 
            + studyroominfomations[i].content + " "
            + studyroominfomations[i].link;
                    
        }
        ---- */
      console.log("studyroominfomations.length = "+studyroominfomations.length);
      
      if( studyroominfomations.length > 0 ){
          console.log("studyroominfos[0].title="+studyroominfomations[0].title);
        
        //同じデータを何回も配信しないように直近１時間のデータのみをbroadcastする
        if( push_notification_mode == PUSH_BROADCAST_MODE){
          var publish_hour = studyroominfomations[0].date.getUTCHours();
          var now_date = new Date();
          var now_hour = now_date.getUTCHours();
          console.log("publish_hour(UTC)="+publish_hour);
          console.log("now_hour(UTC)= "+now_hour );
          
          if( now_hour -1 != publish_hour ){    //１時間以内にリリースされたもの以外はbroadcast配信しない
            console.log("既に配信されているのでbroadcastしない");
            console.log("resolve");
            return dfd.resolve();
          }

        }
    
          
        var display_date = make_display_data_format(studyroominfomations[0].date);
          
        output = studyroominfomations[0].title + " " 
          + display_date + " " 
          + studyroominfomations[0].content + " "
          + studyroominfomations[0].link;
      }
      
      if( output == ""){
        output = "今日は自習室やってないかも～";
      }
      reply_message = output;
      console.log("reply_message = " + reply_message);
      console.log("resolve");
      return dfd.resolve();

    });
    console.log("promise");
    return dfd.promise();
  }
  else{ //図書館名無
    if( output == ""){
      reply_message = "ごめんわからないよ～\n生駒の図書館名も入れてね\n 「図書会館」とか「はばたき」「せせらぎ」とかだよ";   //スタンプに後ほど変更★★
      
      get_weatherServerConnection.get_today_weather()
      .done(function(){
        
        if( today_temperature_high == ""){
          console.log("NO temperature");
        }
        else if( Number(today_temperature_high) >= 30 ){
          reply_message += "\n\nところで、今日は暑いね。水分よくとってね。最高気温が"+today_temperature_high+"度になるってよ～。("+today_weather+")";
        }
        else if( Number(today_temperature_high) < 15 ){
          reply_message += "\n\nところで、今日は寒い１日になるってよ。気温が" +today_temperature_high + "度までしかあがらないんだって。しっかり加湿して風邪ひかないでね。今日の天気は"+today_weather+"。";
        }
        else{
          reply_message += "\n\nなお、今日の天気は"+today_weather+"、最高気温は"+today_temperature_high+"度だって。今日も頑張って行きましょう！";
        }
        
        
        console.log("reply_message = "+reply_message);
        console.log("resolve");
        return dfd.resolve();
      });
      
      console.log("promise");
      return dfd.promise();
    }
    console.log("reply_message = " + reply_message);
    return dfd.resolve();
  }
  /////////////////////////
  
  

  
  return dfd.resolve();
  
}

/* 図書館名から返答文字列作成 */
function make_lib_studyplace_status_message( input ){
  var output = "";
  var lib_num = pickup_lib_name( input );
  
  if( lib_num > 0 ){
    selectplace = lib_num;
    
    //図書館ブログ検索
    StydyPlaceServerConnection.get_studyroom_info()
      .done(function(){
        for(var i=0; i<studyroominfomations.length; i++){
          console.log("---------------------------");
          console.log("studyroominfos["+i+"].title="+studyroominfomations[i].title);
          
          var display_date = make_display_data_format(studyroominfomations[i].date);
          
          output += studyroominfomations[i].title + " " 
            + display_date + " " 
            //+ studyroominfomations[i].content + " "
            + studyroominfomations[i].link;
                    
        }
    });
    
  }
  else{ //図書館名無
    //don't care
  }
  
  return output;
}

function pickup_lib_name( str ){
  var output_lib_num = -1;
  
  //本館
  if ( str.indexOf(STRING_IKOMA_TOSHOKAN1) != -1) {
    output_lib_num = PLACE_IKOMA_TOSHOKAN;
  }
  else if( str.indexOf(STRING_IKOMA_TOSHOKAN2) != -1 ){
    output_lib_num = PLACE_IKOMA_TOSHOKAN;
  }
  else if( str.indexOf(STRING_IKOMA_TOSHOKAN3) != -1 ){
    output_lib_num = PLACE_IKOMA_TOSHOKAN;
  }
  //北コミュニティセンター(はばたき)
  else if( str.indexOf(STRING_IKOMA_HABATAKI1) != -1 ){
    output_lib_num = PLACE_IKOMA_HABATAKI;
  }
  else if( str.indexOf(STRING_IKOMA_HABATAKI2) != -1 ){
    output_lib_num = PLACE_IKOMA_HABATAKI;
  }
  //南コミュニティセンター(せせらぎ)
  else if( str.indexOf(STRING_IKOMA_SESERAGI1) != -1 ){
    output_lib_num = PLACE_IKOMA_SESERAGI;
  }
  else if( str.indexOf(STRING_IKOMA_SESERAGI2) != -1 ){
    output_lib_num = PLACE_IKOMA_SESERAGI;
  }
  //鹿ノ台
  else if( str.indexOf(STRING_IKOMA_SHIKANODAI) != -1 ){
    output_lib_num = PLACE_IKOMA_SHIKANODAI;
  }
  //たけまる
  else if( str.indexOf(STRING_IKOMA_TAKEMARU) != -1 ){
    output_lib_num = PLACE_IKOMA_TAKEMARU;
  }
  //美楽来
  else if( str.indexOf(STRING_IKOMA_MIRAKU1) != -1 ){
    output_lib_num = PLACE_IKOMA_MIRAKU;
  }
  else if( str.indexOf(STRING_IKOMA_MIRAKU2) != -1 ){
    output_lib_num = PLACE_IKOMA_MIRAKU;
  }
  //駅前図書館
  else if( str.indexOf(STRING_IKOMA_EKIMAE) != -1 ){
    //駅前図書館には自習室は無い
  }
  else{
    //don't care
  }
      
  return output_lib_num;
}

function make_display_data_format( date ){
  var output;
  
  var dateString = new Date( date );
  var year = dateString.getFullYear();
  var month = dateString.getMonth() + 1;
  var day = dateString.getDate() + 1;
  
  output = year+"/"+month+"/"+day;
  
  console.log("[make_display_data_format] date="+year+"/"+month+"/"+day);
  
  return output;                          
}

function handleEvent(event) {
	console.log("type=" + event.type);
	console.log("message.typ=" + event.message.type );
}

//////////////////////////////////////////////////////////////////////
// databaseへ格納する（DBへの格納は非同期なため）
// return: 無
//////////////////////////////////////////////////////////////////////
function insert_id2db( id ){
    var table_insert_command;
    var query;
    
//===================================

    try{
        console.log("START connect database");
        
        var config = {
                host: postgres_host,
                user: postgres_user,
                database: postgres_databases,
                password: postgres_password,
                port: 5432,
                max: 10, // max number of clients in the pool 
                idleTimeoutMillis: 5000, 
        }; 
        
        var pool = new pg.Pool(config);

        //pg.connect(connectionString, function(err,client){
        pool.connect(function(err, client){
            
            
            if(err){
                console.log("CANNOT open DB");
                return;
            }
            else{
              console.log("Success to open DB.");
            }
           

            var table_insert_command = TABLE_INSERT_COMMAND_1 + db_table + TABLE_INSERT_COMMAND_2;
            //var table_insert_command = "INSERT INTO userid_table(id, option1, option2) VALUES ('234', '', '');";

            client.query( table_insert_command, [ id, " ", " " ], function(err, result){
//            client.query( table_insert_command, function(err, result){
                if(err){
                    console.log("CANNOT insert table(ID重複も含まれる)");
                    return;
                }
                

                /////////////////////////////////////////////////////
                //   DBへデータ書き込み
                /////////////////////////////////////////////////////
                console.log("success to insert DB.");

                

            client.end(function (err){
                if(err){
                    console.log("error.");
                      return;
                  }
                    
                  console.log("db close");
                });
            });


   /*  なぜかこの書き込み方うまくいかない      
          console.log("query="+table_insert_command);

          //書き込み　ここから★★★
            //query = client.query( table_insert_command, [ id, " ", " " ]);
            query = client.query( table_insert_command);

            query
              .on( 'end', function( row, err ){
                console.log("=========================================");
                console.log("set id to DB FINISH!!");
                console.log("=========================================");
            })
          
            .on( 'error', function(error){
                console.log("[insert_id2db] ERROR!!! cannot insert data to database.");
                console.log(error);
            });
    */
 
        });
        
        pool.on('error', function (err, client) {
            console.error('idle client error', err.message, err.stack);
        })
        
    }catch(e){
        console.log("UNEXPECTED ERROR: ");
        
    };
//===================================
 
}

//////////////////////////////////////////////////////////////////////
// databaseから削除する（DBへの格納は非同期なため）
// return: 無
//////////////////////////////////////////////////////////////////////
function delete_id2db( id ){
    var table_insert_command;
    var query;
    
//===================================

    try{
        console.log("START connect database");
        
        var config = {
                host: postgres_host,
                user: postgres_user,
                database: postgres_databases,
                password: postgres_password,
                port: 5432,
                max: 10, // max number of clients in the pool 
                idleTimeoutMillis: 5000, 
        }; 
        
        var pool = new pg.Pool(config);

        //pg.connect(connectionString, function(err,client){
        pool.connect(function(err, client){
            
            
            if(err){
                console.log("CANNOT open DB");
                return;
            }
            else{
              console.log("Success to open DB.");
            }
           

            var  table_delete_command = "DELETE FROM "+ db_table + " WHERE id='"+id+"'";
          console.log("query="+table_delete_command);
          
            client.query( table_delete_command, function(err, result){

                if(err){
                    console.log("CANNOT delete table");
                    return;
                }
                
                console.log("success to delete DB.");


            client.end(function (err){
                if(err){
                    console.log("error.");
                      return;
                  }
                    
                  console.log("db close");
                });
            });
        });
        
        pool.on('error', function (err, client) {
            console.error('idle client error', err.message, err.stack);
        })
        
    }catch(e){
        console.log("UNEXPECTED ERROR: ");
        
    };
//===================================
 
}


//////////////////////////////////////////////////////////////////////
// databaseから読み出す
// return: 無
// id_list_textバッファへ格納
//////////////////////////////////////////////////////////////////////
function read_id_from_db( ){
    var table_insert_command;
    var query;
  
    var dfd = new $.Deferred;
    
//===================================

    try{
        console.log("START connect database");
        
        var config = {
                host: postgres_host,
                user: postgres_user,
                database: postgres_databases,
                password: postgres_password,
                port: 5432,
                max: 10, // max number of clients in the pool 
                idleTimeoutMillis: 5000, 
        }; 
        
        var pool = new pg.Pool(config);

        //pg.connect(connectionString, function(err,client){
        pool.connect(function(err, client){
            
            
            if(err){
                console.log("CANNOT open DB");
                console.log("resolve");
                return dfd.resolve();
            }
            else{
              console.log("Success to open DB.");
            }
           
          var table_insert_command = TABLE_INSERT_COMMAND_1 + db_table + TABLE_INSERT_COMMAND_2;
          
          
          //var table_insert_command = "INSERT INTO userid_table(id, option1, option2) VALUES ('234', '', '');";

      
            //client.query("SELECT * FROM booklist_table", function(err, result){
    /* 読み出しOK */
    
         
          //★★★★DB openを複数回行って良いのか？？pool使ってるからOK？（要検証）
          
          var sql_text = "SELECT * FROM userid_table";
            client.query( sql_text, function(err, result){
                if(err){

                    console.log("CANNOT read table");
                    console.log("resolve");
                    return dfd.resolve();
                }
                

                /////////////////////////////////////////////////////
                //   DBからデータ取得
                /////////////////////////////////////////////////////
                console.log("DB length= " + result.rows.length);
              
                var i;
                for(i=0; i<result.rows.length; i++ ){
                  id_list[i] = result.rows[i].id;
                  
                  console.log("id="+result.rows[i].id);
                }
              /*
                id_list_text = "";
                var i;
                for(i=0; i<result.rows.length; i++ ){
                  if(i>0){
                    id_list_text += ",";
                  }
                  id_list_text += result.rows[i].id;
                  
                  console.log("id="+result.rows[i].id);
                }
              */
                

            client.end(function (err){
                if(err){
                    console.log("error.");
                    console.log("resolve");
                    return dfd.resolve();
                  }
                    
                  console.log("db close");
              
                  console.log("resolve");
                  return dfd.resolve();
                });
            });
       
        });
        
        pool.on('error', function (err, client) {
            console.error('idle client error', err.message, err.stack);
            console.log("resolve");
            return dfd.resolve();
        })
        
    }catch(e){
        console.log("UNEXPECTED ERROR: ");
        console.log("resolve");
        return dfd.resolve();
        
    };
//===================================
/*  
    table_insert_command = TABLE_INSERT_COMMAND_1 + table + TABLE_INSERT_COMMAND_2;
    
    query = client.query( table_insert_command, [ id, "", "" ]);
  
    query.on( 'end', function( row, err ){

            
            //再帰的に呼ぶ。100ms待って呼ぶ(空けないとエラーになる)
            //setTimeout( function(){
            //        insert_next_booklist_table( client, table, mode, count+1 )
            //    }, 500 );
                

            console.log("=========================================");
            console.log("set id to DB FINISH!!");
            console.log("=========================================");
	    //process.exit(); // heroku schedulerから呼ばれた際、プロセスを終了させるため
        
    });
    query.on( 'error', function(error){
        console.log("[insert_id2db] ERROR!!! cannot insert data to database.");
        console.log(error);
    });
  */  
  
  console.log("promise");
  return dfd.promise();
}


function check_available_time(){
  
  var now_date = new Date();
  var now_hour = now_date.getUTCHours();   //getHours()だとherokuはUTCだがwindowsPCではlocaltime(JST)なのでUTCで取得で統一
  
  console.log("now_hour = "+ now_hour);
  
  if(( now_hour >= 0 ) && ( now_hour <= 8 )){   //JST 9時～17時
    return 1;
  }
  else
    return 0;
  
  
}