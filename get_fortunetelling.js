/* 占い情報取得 */
/* 
  [注] heroku configへ各自下記 をセット必要
  heroku config:set FORTUNE_TELLING_DOMAIN=xxxx
  
  http://jugemkey.jp/api/waf/api_free.php
  無料で利用する場合は下記２つのURLをサイトに貼る必要性有
  powerd by <a href="http://jugemkey.jp/api/waf/api_free.php">JugemKey</a>
  【PR】<a href="http://www.tarim.co.jp/">原宿占い館 塔里木</a>
*/

var DEBUG = 0;  //1=DEBUG　0=NOT DEBUG

var http = require('http');
var $ = require('jquery-deferred');


var TYPE_LINE_EMOJI_SMILE = 1;



module.exports.get_today_fortunetelling = function(){
  var dfd = new $.Deferred;
  
  /* heroku は環境変数にセットすること
     windowsは node index.jsの前に下記のように環境変数を記載すること(なぜかsetでうまくいかない)
     FORTUNE_TELLING_DOMAIN=xx node index.js

  */
  
  var FORTUNE_TELLING_QUERY = "/api/horoscope/free/";  
  var fortune_telling_domain = process.env.FORTUNE_TELLING_DOMAIN;

  var query = FORTUNE_TELLING_QUERY;  
  var date = get_today_date();
  query += date;
  console.log("query="+query);
  
  
  var options = {
    host: fortune_telling_domain,
    port: 80,
    path: query,    
    method: 'GET'
  };
	console.log('fortune_telling options.path: ' + options.path);

  http.request(options, function(r) {
	 r.setEncoding('utf8');
	 var json = '';
	 r.on('data', function(chunk) {
	    json += chunk;
	});
    
	r.on('end', function() {   //楽天APIからデータ取得成功！
		console.log("fortune_telling API done");

	   var data = JSON.parse(json);
    
    if(DEBUG){
      //console.log(data.horoscope);    //OK
      //var date="2017/12/19";
      //console.log(data.horoscope[date]);  //ok
      //console.log(data.horoscope[date][0].content);   //やっと成功
    }
        
	    if (typeof data.horoscope[date] === 'undefined') {
        console.log("fortune_telling API retrieve fail1" + json);
      }
      else {
        var today_data = data.horoscope[date];
        
        
        var i;
        for(i=0; i<today_data.length; i++){

          
          if( fortunetelling_sign == TODAY_NO1_FOR_BROADCAST ){
            console.log("rank="+today_data[i].rank + " sign="+today_data[i].sign);
            
            if( today_data[i].rank == "1" ){
              //今日のNo1星座。
              fortunetelling_sentence = "今日のNo1星座は"+today_data[i].sign 
                + String.fromCodePoint(choose_emoji(TYPE_LINE_EMOJI_SMILE)) + "\n詳細は「今日の●●座」って言ってね";
              
              console.log("fortune_telling API success.");
              return dfd.resolve();
              
            }
          }
          else{
            if( today_data[i].sign == fortunetelling_sign ){
              fortunetelling_sentence = 
                "今日の" + today_data[i].sign + "は" + today_data[i].rank +"位" + String.fromCodePoint(choose_emoji(TYPE_LINE_EMOJI_SMILE))
                +"\n\n「" + today_data[i].content + "」らしいよ。"
                +"\nラッキーカラーは" + today_data[i].color + "。"
                +"\nラッキーアイテムは" + today_data[i].item + "。"
                + "\n\npowerd by JugemKey. http://jugemkey.jp/api/waf/api_free.php"
                + "\n原宿占い館 塔里木 http://www.tarim.co.jp";
              
              console.log("fortune_telling API success.");
              return dfd.resolve();
            }
          }
          
          
          
        }

        

      }
    console.log("[get_today_fortunetelling] unexpected error1");
    return dfd.resolve();
  });

  }).end();   //http.request
  

  return dfd.promise();
  

};


function get_today_date(){
  
  var date_string;
  var nowDate = new Date();

  if( nowDate.getTimezoneOffset() == 0 ){
    console.log("TimezoneOffset=0");
    nowDate.utc2local();
  }
  
  var year = nowDate.getFullYear();
  var month = nowDate.getMonth() + 1;
  var day = nowDate.getDate();
  var hour = nowDate.getHours();
  var minutes = nowDate.getMinutes();

  date_string = year + "/" + add_zero_number(month) + "/" + day;
  
  console.log("daytime=" + date_string + " " + hour + ":" + minutes);
  
  return( date_string );

}

function add_zero_number( num ){
  var ret;
  
  if( num < 10 ){
    ret = '0' + num;
  }
  return( ret );
}

//utc time -> JAPAN time(+9Hour)   https://firegoby.jp/archives/1348
Date.prototype.utc2local = function()
{
    this.setTime(
        //this.getTime()-(this.getTimezoneOffset()*60*1000)
      this.getTime()+(9*60*60*1000)
    );
}


function choose_emoji( type ){
  var emoji_code;
  var random_num;
  
  if( type == TYPE_LINE_EMOJI_SMILE ){
    random_num = ( Math.floor( Math.random() * 100 )) % smile_emoji.length;
    emoji_code = smile_emoji[random_num];
  }
  else{
    console.log("ERROR: choose_emoji");
    emoji_code = EMOJI_SMILE1;
  }
  
  //console.log("emoji_code="+emoji_code);
  return( emoji_code );
  
}
