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
  this.place;
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

var STRING_IKOMA_ALL_STUDYROOM = "全ての自習室";


var input_message="";
var reply_message="";


global.today_weather;
global.today_temperature_high;
global.today_temperature_low;


var LINE_REPLY_URL = "https://api.line.me/v2/bot/message/reply";
var LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";
var LINE_PUSH_URL_MULTICAST = "https://api.line.me/v2/bot/message/multicast";

var TYPE_PUSH = 1;
var TYPE_MULTICAST= 2;

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
var TABLE_INSERT_COMMAND_2 = " ( id, type ) VALUES ($1, $2);";
//var TABLE_INSERT_COMMAND_2 = " ( id, option1, option2 ) VALUES ($1, $2, $3);";

var FLAG_INSERT = 1;
var FLAG_DELETE = 0;


var TYPE_USER = 1;
var TYPE_GROUP = 2;
var select_type = 0;  //初期値

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
  
  
  //なんでもTEST
  if (mode == 1) {

    send_notification_to_all_group();
    
    //console.log("check_available_time()="+check_available_time());
    //send_notification_hourly();
 
  }
  //自習室情報取得してお薦め。ノーマル文章
  else if (mode == 2){
    //input_message = "はばたき";
    input_message = STRING_IKOMA_ALL_STUDYROOM;
    push_notification_mode = PUSH_BROADCAST_MODE; 
    
    var to_array = new Array();

    to_array[0] = process.env.USERID;
    //to_array[1] = 'xxx';
      
    make_reply_message()
    .done(function(){
      console.log("reply_message1 = " + reply_message);
      
  /* ------------ */
  get_weatherServerConnection.get_today_weather()
  .done(function(){


    
    reply_message += "\n\nついでに今日のいこまの天気を教えるね。\n";

    if( today_temperature_high == ""){
      console.log("NO temperature");
      reply_message += "天気は"+today_weather+ "。だよ";
    }
    else if( Number(today_temperature_high) >= 30 ){
      reply_message += "今日は暑いね。水分よくとってね。最高気温が"+today_temperature_high+"度になるってよ～。("+today_weather+")";
    }
    else if( Number(today_temperature_high) < 15 ){
      reply_message += "今日は寒い１日になるってよ。気温が" +today_temperature_high + "度までしかあがらないんだって。しっかり加湿して風邪ひかないでね。今日の天気は"+today_weather+"。";
    }
    else{
      reply_message += "今日の天気は"+today_weather+"、最高気温は"+today_temperature_high+"度だって。今日も頑張って行きましょう！";
    }


    console.log("reply_message = "+reply_message);
    send_notification( to_array, reply_message, TYPE_MULTICAST );
  });      
  /* ------------ */

      //send_notification(to_array, "テストっす\n\n" + reply_message, TYPE_MULTICAST);
    });
  }
  
  //天気予報＋自習室情報
  else if (mode == 3){
    input_message = "はばたき";

    var to_array = new Array();
    to_array[0] = process.env.USERID;
    
    make_reply_message()
    .done(function(){
      console.log("reply_message = " + reply_message);

      send_notification(to_array, "今日は暑いから家より図書館自習室の方がいいと思うよ！\n\n" + reply_message, TYPE_MULTICAST);
    });
  }
  
  //受験本番まであと数日！
  else if (mode == 4){
    input_message = "はばたき";
    var to_array = new Array();
    to_array[0] = process.env.USERID;

    make_reply_message()
    .done(function(){
      console.log("reply_message = " + reply_message);

      send_notification(to_array, "公立高校受験まであと１３３日！　自習室来ないと。。。\n\n" + reply_message, TYPE_MULTICAST);
    });
  }
  else if( mode == 5 ){ //DB test
    

    var id = "1234567";
    
    //insert_id2db( id, TYPE_USER );
    insert_id2db( id, TYPE_GROUP );
    //delete_id2db( id );
    
    
  }
  else if( mode == 6 ){ //DB test
    

    var id = "1234567";
    
    delete_id2db( id );
    
    
  }
  else if( mode == 7 ){ //DB test
    
    select_type = TYPE_USER;    //read_id_from_db()を呼ぶための設定
    //select_type = TYPE_GROUP;
    
    read_id_from_db( )
    .done(function(){
      if( select_type == TYPE_USER ){
        
        //send_notification(id_list, "バージョンアップに向けての最終テストちう\n\n", TYPE_MULTICAST);

      }
      else if( select_type == TYPE_GROUP ){
        //send_notification(id_list, "自習室来ない？\n\n", TYPE_PUSH);
      }
      
      console.log("ID_LIST="+ id_list);
    });
  }
  
  else if ( mode == 9 ){
    
      
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
          console.log(event);
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
            console.log(event);
            console.log("====================\n");
          
            var beacon_userid = event.source.userId;
            var beacon_usertype = event.source.type;
            var beacon_hwid = event.beacon.hwid;
            var beacon_inout = event.beacon.type;
            console.log("beacon userid="+beacon_userid);
            console.log("beacon usertype="+beacon_usertype);
            console.log("beacon hwid="+beacon_hwid);
            console.log("beacon in/out="+beacon_inout);
          
          
            if( beacon_inout == "leave")  return;
          
            //本来はbeacon_useridが含まれるgroup限定でpush通知すべきであるが、
            //認証アカウントしかgroup内userid listを取得できない制限有。
            //今回は暫定で全グループへ配信する（実際のユースケースでは当然ダメ）
            send_notification_to_all_group();
          
  /*        
            var headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.CHANNEL_ACCESS_TOKEN
            }
            var body = {
                to: process.env.USERID, 
//                to: process.env.MYTEST_GROUP_ID, 
                messages: [{
                    type: 'text',
                    //text: 'henoheno'
                    text: 'お友達が自習室にいるよ！誰かは行ってのお楽しみ！！'
                }]
            }
            request({
                url: LINE_PUSH_URL,
                method: 'POST',
                headers: headers,
                body: body,
                json: true
            });
  */
        }
      
      // アカウントが友だち追加またはブロック解除された
      else if(( event.type == 'follow' ) || ( event.type == 'unfollow' )){
        console.log("====================\n");
        console.log("follow/unfollow event.ともだち追加/削除してくれたよ")
        console.log(event);
        console.log("====================\n");
        
        if( event.source.type == "user" ){
          if (typeof event.source.userId === 'undefined') {
            console.log("follow event but not user???");
          }else{
            var new_follower_id = event.source.userId;
            console.log("new_member="+new_follower_id);
            
            //★DB追加・削除
            if( event.type == 'follow' ){
              insert_id2db( new_follower_id, TYPE_USER );
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
      
      // グループまたはトークルームに参加
      else if(( event.type == 'join' ) || ( event.type == 'leave' )){
        console.log("====================\n");
        console.log("join/leave event.グループ追加/削除してくれたよ")
        console.log(event);
        console.log("====================\n");
        
        if( event.source.type == "group" ){
          if (typeof event.source.groupId === 'undefined') {
            console.log("join event but not group???");
          }else{
            var new_group_id = event.source.groupId;
            console.log("new_group="+new_group_id);
                    
            //★DB追加・削除
            if( event.type == 'join' ){
              insert_id2db( new_group_id, TYPE_GROUP );
              
              send_notification( new_group_id, 
                                "グループに追加ありがとう！お友達がLINE Beaconの範囲に入ったら教えるよ。\n(今は間引きせずBeacon反応したら必ず通知するので回数多いよ。また、今だけお友だちのいる同一グループでは無く全グループに配信するよ。)", 
                                TYPE_PUSH );
              
            }
            else if ( event.type == 'leave' ){
              delete_id2db( new_group_id );
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
  
  //input_message = "はばたき";   //★暫定
  input_message = STRING_IKOMA_ALL_STUDYROOM;
  
  if(!DEBUG){
    if( check_available_time() == 0 ){
      process.exit(); // heroku schedulerから呼ばれた際、プロセスを終了させるため
      return;   //自習室時間外には通知しない
    }
  }
  
  select_type = TYPE_USER;  //read_id_from_db()への入力
  
  read_id_from_db( )
  .done(function(){
    console.log("ID_LIST="+ id_list);
    if( id_list.length == 0){
      return;
    }
    
      make_reply_message()
      .done(function(){
        
        if( reply_message != ""){
          console.log("reply_message1 = " + reply_message);
          
             reply_message = "自習室来ない？\n\n" + reply_message;       
  /* ------------ */
          get_weatherServerConnection.get_today_weather()
          .done(function(){

            reply_message += "\n\nついでに今日のいこまの天気を教えるね。\n";

            if( today_temperature_high == ""){
              console.log("NO temperature");
              reply_message += "天気は"+today_weather+ "。だよ";
            }
            else if( Number(today_temperature_high) >= 30 ){
              reply_message += "今日は暑いね。水分よくとってね。最高気温が"+today_temperature_high+"度になるってよ～。("+today_weather+")";
            }
            else if( Number(today_temperature_high) < 15 ){
              reply_message += "今日は寒い１日になるってよ。気温が" +today_temperature_high + "度までしかあがらないんだって。しっかり加湿して風邪ひかないでね。今日の天気は"+today_weather+"。";
            }
            else{
              reply_message += "今日の天気は"+today_weather+"、最高気温は"+today_temperature_high+"度だって。今日も頑張って行きましょう！";
            }


            console.log("reply_message = "+reply_message);
            send_notification( id_list, reply_message, TYPE_MULTICAST );
        });      
        /* ------------ */
          //send_notification( id_list, "はばたき自習室来ない？\n\n" + reply_message);
        }
        console.log("\n----- send_notification_hourly done! ------\n");
  });
    
    
  });
  

        
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

function send_notification( destination, push_message, push_or_multicast ){
  
  console.log("send_notification destination="+destination);
  
  var send_url;
  if( push_or_multicast == TYPE_PUSH ){
    send_url = LINE_PUSH_URL;
  }
  else if( push_or_multicast == TYPE_MULTICAST ){
    send_url = LINE_PUSH_URL_MULTICAST;
  }
  else{
    console.log("error");
    return;
  }
  
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
        url: send_url,
        method: 'POST',
        headers: headers,
        body: body,
        json: true
      });
}



function send_notification_to_all_group(){
  
  select_type = TYPE_GROUP;
    
  read_id_from_db( )
  .done(function(){
    
      if( id_list.length == 0){
        return;
      }
      console.log("id_list.length="+id_list.length);
      var reply_message = 'お友達が自習室にいるよ！誰かは行ってのお楽しみ！！';
    
    var destination = id_list;
    
    if( destination.length != 0 ){
      send_notification_delay( destination, reply_message, TYPE_PUSH, 0 );
    }
   

    
  }); 
}

function send_notification_delay( destination, message, type, count ){
    console.log("destination["+count+"]="+destination[count]);
    setTimeout( function(){
      send_notification( destination[count], message, type );

      count++;
      if( count < destination.length ){
        send_notification_delay( destination, message, type, count );
      }
      else{
        console.log("send_notification_delay end.");
      }
    }, 2000 );    
}



/* ユーザー入力文字から返答文面を作成 */
function make_reply_message( ){
  var input = input_message;
  var output="";
  console.log("input="+input);
  
var TIME_ONE_HOUR = 60 * 60 * 1000;    //1H   
//  var TIME_ONE_HOUR = 12* 60 * 60 * 1000;    //24H for DEBUG
  
  //図書館名が入ってたら本日の図書館状況を図書館ブログから返す
  //output = make_lib_studyplace_status_message( input );

  //////////////////////////
  
  var dfd = new $.Deferred;
  
  var lib_num = pickup_lib_name( input );
  
  if( lib_num >= 0 ){
    selectplace = lib_num;
    
    //図書館ブログ検索
    StydyPlaceServerConnection.get_studyroom_info()
      .done(function(){
      
      console.log("studyroominfomations.length = "+studyroominfomations.length);
      
      for(var i=0; i<studyroominfomations.length; i++ ){
          console.log("studyroominfos[i].title="+studyroominfomations[i].title);
        
        //同じデータを何回も配信しないように直近１時間のデータのみをbroadcastする
        if( push_notification_mode == PUSH_BROADCAST_MODE){
          
          var now_date = new Date();
  //        var now_date = new Date("Wed, 15 Nov 2017 9:00:00 +0900");
          

          console.log("publish_hour(UTC)="+studyroominfomations[i].date.getUTCHours());
          console.log("now_hour(UTC)= "+now_date.getUTCHours() );
           
          if( now_date.getTime() - studyroominfomations[i].date.getTime() > TIME_ONE_HOUR ){

            if(( i == studyroominfomations.length -1 ) && ( output == "" )){
              console.log("既に配信されているのでbroadcastしない");
              console.log("resolve");
              return dfd.resolve();
            }
            continue;   //TIME_ONE_HOUR以上ならばfor文を回す
          }
          else{
            console.log("1H以内。配信開始");
          }

        }
    
        if( output != "" )  output += "\n\n";  //２つ目の自習室は改行×２
        
        if( selectplace == PLACE_IKOMA_ALL )
          output += "【" + studyroominfomations[i].place + "】" + "\n";
        
        output += studyroominfomations[i].title + " " 
//          + display_date + " " 
          + studyroominfomations[i].content + " "
          + studyroominfomations[i].link;
        
      }
      /* --------------------------------------------
      if( studyroominfomations.length > 0 ){
          console.log("studyroominfos[0].title="+studyroominfomations[0].title);
        
        //同じデータを何回も配信しないように直近１時間のデータのみをbroadcastする
        if( push_notification_mode == PUSH_BROADCAST_MODE){
          
          var now_date = new Date();
  //        var now_date = new Date("Wed, 15 Nov 2017 9:00:00 +0900");
          

          console.log("publish_hour(UTC)="+studyroominfomations[0].date.getUTCHours());
          console.log("now_hour(UTC)= "+now_date.getUTCHours() );
          
    //      var TIME_ONE_HOUR = 60 * 60 * 1000;    //1H   
          var TIME_ONE_HOUR = 12* 60 * 60 * 1000;    //24H for DEBUG 
          if( now_date.getTime() - studyroominfomations[0].date.getTime() > TIME_ONE_HOUR ){

            console.log("既に配信されているのでbroadcastしない");
            console.log("resolve");
            return dfd.resolve();
          }
          else{
            console.log("1H以内。配信開始");
          }

        }
    
          
        output = studyroominfomations[0].title + " " 
//          + display_date + " " 
          + studyroominfomations[0].content + " "
          + studyroominfomations[0].link;
        
      }
      ---------------------------------------- */
      
      if( output == ""){
        if( push_notification_mode != PUSH_BROADCAST_MODE){
          output = "今日は自習室やってないかも～";
        }
        else{
          console.log("本日は自習室開館してないので敢えてbroadcast配信しない");
          console.log("resolve");
          return dfd.resolve();
        }
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
          
          //var display_date = make_display_data_format(studyroominfomations[i].date);
          
          output += studyroominfomations[i].title + " " 
            //+ display_date + " " 
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
  
  //全て
  if ( str.indexOf(STRING_IKOMA_ALL_STUDYROOM) != -1) {
    output_lib_num = PLACE_IKOMA_ALL;
  }
  //本館 
  else if ( str.indexOf(STRING_IKOMA_TOSHOKAN1) != -1) {
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
  
  //console.log("[pickup_lib_name]output_lib_num="+output_lib_num);
      
  return output_lib_num;
}


//使わない関数
function make_display_data_format( date ){
  var output;
  
  var dateString = new Date( date );
  var year = dateString.getFullYear();
  var month = dateString.getMonth() + 1;
  
  //var day = dateString.getDate() + 1;
  var day = dateString.getUTCDate();
  var hour = dateString.getUTCHours();
  if(( hour >= 15 ) && ( hour <= 23))  day++;   //★月始めや年始で一意にインクリメントするとバグ発生するよ！！！
  
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
function insert_id2db( id, type ){
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

            client.query( table_insert_command, [ id, type ], function(err, result){
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
// [入力] sql_textに TYPE_USER or TYPE_GROUPを設定すること
// [出力] id_listバッファへ格納
//////////////////////////////////////////////////////////////////////
function read_id_from_db( ){
    var table_insert_command;
    var query;
  
    var dfd = new $.Deferred;

    init_id_list();　//初期化
    
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
           


      
            //client.query("SELECT * FROM booklist_table", function(err, result){
    /* 読み出しOK */
    
         
          //★★★★DB openを複数回行って良いのか？？pool使ってるからOK？（要検証）
          var sql_text;
          if( select_type == TYPE_USER ){
            var sql_text = "SELECT * FROM userid_table where type=1;";
          }
          else if( select_type == TYPE_GROUP ){
            var sql_text = "SELECT * FROM userid_table where type=2;";
          }
          else{
              console.log("invalid select_type="+select_type);
              console.log("resolve");
              return dfd.resolve();            
          }
          
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
                  
                  console.log("id="+result.rows[i].id + " type="+result.rows[i].type);
                }

                

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


function init_id_list(){
  if( id_list.length != 0 ){
    while( id_list.length > 0 ){
      id_list.pop();
    }
  }
}


function check_available_time(){
  
  var now_date = new Date();
  var now_hour = now_date.getUTCHours();   //getHours()だとherokuはUTCだがwindowsPCではlocaltime(JST)なのでUTCで取得で統一
  
  if(( now_hour >= 0 ) && ( now_hour <= 8 )){   //JST 9時～17時
    console.log("now_hour(UTC) = "+ now_hour + "available_time");
    return 1;
  }
  else{
    console.log("now_hour(UTC) = "+ now_hour + "NOT available_time");
    return 0;
  }
  
  
}

//認証済アカウントしかダメなので本API使えない
function line_groupid2member( groupid ){
    
  var dfd = new $.Deferred;

  var headers = {
    'Authorization': 'Bearer ' + process.env.CHANNEL_ACCESS_TOKEN
  }

  request.get({
    url: "https://api.line.me/v2/bot/group/{groupid}/members/ids",
    headers: headers
  }, function( error, response, body){
    console.log(body);
  });

  //return dfd.promise();
  

//};
  
  
} 
       