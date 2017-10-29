/* 学び舎GO! 生駒の図書館自習室の情報をLINE BOTでお教えします */

/* LINEのCHANNEL_ACCESS_TOKEN を heroku configへ各自セット必要
　　heroku config:set CHANNEL_ACCESS_TOKEN=xxxx
*/

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var $ = require('jquery-deferred');

var StydyPlaceServerConnection = require('./get_studyplace_info.js');

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


var input_message;
var reply_message;
  
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

app.get('/', function(req, res) {     // https://line-manabiya-ikoma.herokuapp.com    [local] http://localhost:3000 で検証！
  
  
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
  console.log("start get");
  var url = require('url');
  var urlInfo = url.parse(req.url, true);
  var mode = urlInfo.query.mode;
  console.log (mode);
  if (mode == 1) {
   send_notification("test1");
  
  console.log("send 200 OK");
  res.status(200).end();
   
  }
  else if (mode == 2){
    input_message = "はばたき";
  
  make_reply_message()
  .done(function(){
    console.log("reply_message = " + reply_message);
        
    send_notification("自習室来ない？\n\n" + reply_message);
  });
  console.log("send 200 OK");
  res.status(200).end();
  }
  
  console.log("send 200 OK");
  res.status(200).end();
  //console.log (reqbody);
});


app.get('/push1', function(req, res) {    //櫻井さん用
  
  send_notification("test1");
  
  console.log("send 200 OK");
  res.status(200).end();
  
});

//自習室情報リアルタイム取得
app.get('/push2', function(req, res) {    //のづ用
  
  input_message = "はばたき";
  
  make_reply_message()
  .done(function(){
    console.log("reply_message = " + reply_message);
        
    send_notification("自習室来ない？\n\n" + reply_message);
  });
          
  
  
  console.log("send 200 OK");
  res.status(200).end();
  
});

//天気取得
app.get('/push3', function(req, res) {
  
  input_message = "はばたき";
  
  make_reply_message()
  .done(function(){
    console.log("reply_message = " + reply_message);
        
    send_notification("今日は暑いから家より図書館自習室の方がいいと思うよ！\n\n" + reply_message);
  });
  
  console.log("send 200 OK");
  res.status(200).end();
  
});

//受験本番まであと数日！
app.get('/push4', function(req, res) {
  
  input_message = "はばたき";
  
  make_reply_message()
  .done(function(){
    console.log("reply_message = " + reply_message);
        
    send_notification("公立高校受験まであと１３３日！　自習室来ないと。。。\n\n" + reply_message);
  });
  
  console.log("send 200 OK");
  res.status(200).end();
  
});


app.post('/webhook', function(req, res, next){
	
	console.log("start post method");

    res.status(200).end();

  
  // [参考] http://whippet-818.hatenablog.com/entry/2017/02/07/004558

    for (var event of req.body.events){
		//var event = req.body.events[0];

//        if (event.type == 'message' && event.message.text == 'ハロー'){
        if (event.type == 'message'){
          
          //★defferをしないとダメかも
          //var reply_message = make_reply_message( event.message.text );
          
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
            var url = 'https://api.line.me/v2/bot/message/reply';
            request({
                url: url,
                method: 'POST',
                headers: headers,
                body: body,
                json: true
            });
            
          });
          
          
          

        }
      else{
        console.log("NOT text");    //★★LINEスタンプを返そう。「ごめんわからないよー」とかの意味の
      }

    }
});

function send_notification(push_message){
  console.log ("hoge");
    var headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.CHANNEL_ACCESS_TOKEN
    }
    var body = {
//        replyToken: event.replyToken,
        to: "XXXXXXXXXXXXXXXXXXXXXXXXXXXX", // ユーザーID
        messages: [{
          type: 'text',
          text: push_message
        //text: event.message.text    //おうむ返し
        }]
    }
    var url = 'https://api.line.me/v2/bot/message/push';
      request({
        url: url,
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
      reply_message = "ごめんわからないよ～";   //スタンプに後ほど変更★★
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


