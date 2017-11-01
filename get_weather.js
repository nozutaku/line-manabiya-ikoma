/* お天気情報取得 */

var DEBUG = 1;  //1=DEBUG　0=NOT DEBUG

var $ = require('jquery-deferred');



module.exports.get_today_weather = function(){
  var dfd = new $.Deferred;
  
  
  async(function() {
    console.log('async');

    
    today_weather = "雨";
    today_temperature_high = 40;
    today_temperature_low = 5;

    
    console.log("resolve. ネットワークデータ取得は時間かかったけど終了。ダミーで３秒待たせた");
    
    return dfd.resolve();
  });
  
  console.log("promise.ここが先に呼ばれるよ");
  return dfd.promise();
};

function async(f) {
    setTimeout(f, 3000);
}
