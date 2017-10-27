/* 学び舎GO! 生駒の図書館自習室の情報をLINE BOTでお教えします */

/* LINEのCHANNEL_ACCESS_TOKEN を heroku configへ各自セット必要
　　heroku config:set CHANNEL_ACCESS_TOKEN=xxxx
*/

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

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
  
  
  
  
  StydyPlaceServerConnection.get_studyroom_info()
  .done(function(){
    for(var i=0; i<studyroominfomations.length; i++){
      console.log("studyroominfos["+i+"].title="+studyroominfomations[i].title);
    }
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
            var headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.CHANNEL_ACCESS_TOKEN
            }
            var body = {
                replyToken: event.replyToken,
                messages: [{
                    type: 'text',
                    //text: 'henoheno'
                    text: event.message.text    //おうむ返し
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
        }
      else{
        console.log("NOT text");
      }

    }
});

function handleEvent(event) {
	console.log("type=" + event.type);
	console.log("message.typ=" + event.message.type );
}


