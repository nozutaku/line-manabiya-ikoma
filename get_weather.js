/* お天気情報取得 */
/* 
  [注] heroku configへ各自YUMAKE_API_KEY をセット必要
  heroku config:set YUMAKE_API_KEY=xxxx
  heroku config:set YUMAKE_DOMAIN=xxxx
  heroku config:set YUMAKE_QUERY=xxxx
*/

var DEBUG = 0;  //1=DEBUG　0=NOT DEBUG

var http = require('http');
var $ = require('jquery-deferred');



module.exports.get_today_weather = function(){
  var dfd = new $.Deferred;
  
  
  if(DEBUG){    //local node.js設定
    var yumake_domain = "★非公開。各自設定しましょう★";
    var YUMAKE_API_KEY = "★非公開。各自設定しましょう★";
    var query = "★非公開。各自設定しましょう★" + "?code=29&key=" + YUMAKE_API_KEY + "&format=json";   //奈良県=29  
  }
  else{ //heroku
    var yumake_domain = process.env.YUMAKE_DOMAIN;
    var query = "/1.1/" + process.env.YUMAKE_QUERY + "?code=29&key=" + process.env.YUMAKE_API_KEY + "&format=json";
  }

  
  today_weather = "";
  today_temperature_high = 0;
  today_temperature_low = 0;
  
  
  var options = {
    host: yumake_domain,
    port: 80,
    path: query,    
    method: 'GET'
  };
	console.log('weather options.path: ' + options.path);

  http.request(options, function(r) {
	 r.setEncoding('utf8');
	 var json = '';
	 r.on('data', function(chunk) {
	    json += chunk;
	});
    
	r.on('end', function() {   //楽天APIからデータ取得成功！
		console.log("weather API done");


		//console.log("json=" + json);
	   var data = JSON.parse(json);
    
    if(DEBUG){
      console.log("status="+data.status);
      console.log("title="+data.title);
      console.log("area="+data.area[0].areaName );
      console.log("weather="+data.area[0].weather[0]);
      console.log("stationCode="+data.temperatureStation[0].stationCode);
      console.log("temperature[0]="+data.temperatureStation[0].temperature[0]); //今日の日中の最高気温(9時～18時)
      console.log("temperature[1]="+data.temperatureStation[0].temperature[1]); //今日の最高気温(１日中)
      console.log("temperature[2]="+data.temperatureStation[0].temperature[2]); //明日の朝の最低気温(0～9時)
      console.log("temperature[3]="+data.temperatureStation[0].temperature[3]); //明日の日中の最高気温(9時～18時)
    }
        
	    if (typeof data.status === 'undefined') {
        console.log("YUMAKE API retrieve fail!" + json);
      }
      else if( data.status != "success" ){
        console.log("YUMAKE API retrieve fail!" + json);
	    } else {
        
        today_weather = data.area[0].weather[0];
        today_temperature_high = data.temperatureStation[0].temperature[1];   //最高気温
        //today_temperature_low = data.temperatureStation[0].temperature[2];    //明日の朝の最低気温のため設定しない
        
        console.log("YUMAKE API success.");
      }
    
    return dfd.resolve();
  });

  }).end();   //http.request
  
  return dfd.promise();
  

};

function async(f) {
    setTimeout(f, 3000);
}
