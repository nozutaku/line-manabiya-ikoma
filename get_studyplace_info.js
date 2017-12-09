/* 自習室情報取得 */

var DEBUG_ISTODAY_24H = 0;    //1=デバッグ用24時間データ全登録　0=リリース用
var DEBUG_NOT_ONLYTODAY = 0;  //1=全て登録　0=当日のみ(正式版)


var $ = require('jquery-deferred');
//var $ = require('jquery');

var yql = require('yql-node').formatAsJSON();

/*
var URL_IKOMA_ALL = 'select * from yql.query.multi where queries in ('
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_takemaru/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_shikanodai/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_toshokan/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_seseragi/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_habataki/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_miraku/rss.xml\' and title matches \'.*自習室.*\' limit 1\"'
		+ ')|sort(field=\'pubDate\',descending=\'true\');';
*/
var URL_IKOMA_ALL = 'select * from yql.query.multi where queries in ('
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_toshokan/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_habataki/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_seseragi/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_shikanodai/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_takemaru/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_miraku/rss.xml\' and title matches \'.*自習室.*\' limit 1\"'
		+ ');';


var URL_IKOMA_TOSHOKAN = "select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_toshokan/rss.xml\' and title matches \'.*自習室.*\' limit 2";
var URL_IKOMA_HABATAKI = "select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_habataki/rss.xml\' and title matches \'.*自習室.*\' limit 2";
var URL_IKOMA_SESERAGI = "select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_seseragi/rss.xml\' and title matches \'.*自習室.*\' limit 2";
var URL_IKOMA_SHIKANODAI = "select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_shikanodai/rss.xml\' and title matches \'.*自習室.*\' limit 2";
var URL_IKOMA_TAKEMARU = "select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_takemaru/rss.xml\' and title matches \'.*自習室.*\' limit 2";
var URL_IKOMA_MIRAKU = "select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_miraku/rss.xml\' and title matches \'.*自習室.*\' limit 2";


  
  //本命
  //var query="select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_toshokan/rss.xml\' and title matches \'.*自習室.*\' limit 3";


  
var array_place_name = ["生駒市図書館(本館)", "図書館北分館(はばたき)", "図書館南分館(せせらぎ)", "たけまるホール", "鹿ノ台ふれあいホール図書館", "美楽来"];




module.exports.test = function(){
  var dfd = new $.Deferred;
  
  info = new StudyRoomInfo();
  info2 = new StudyRoomInfo();
  
  async(function() {
    console.log('async');
    info.title = "タイトル";
    info2.title = "タイトル2";
    
    //booklist[i] = new BookInfo();
    
    studyroominfomations[0] = info;
    studyroominfomations[1] = info2;
    
    return dfd.resolve();
  });
  
  
  return dfd.promise();
};

function async(f) {
    setTimeout(f, 3000);
}

module.exports.get_studyroom_info = function(){
//function get_studyroom_info( array_info ){
  
  var dfd = new $.Deferred;
  
  init_studyroominfomations();
  query = make_query_url( selectplace );
  //console.log("query="+query);
  
  
  yql.execute(query, function(error,response){
    
    //console.log("error="+error);
    
    console.log("yql:");
    //console.log(response);
      console.log("count=" + response.query.count);
      console.log("created="+response.query.created);
      //console.log("link="+response.query.results.item[0].link);
      console.log("----------");
    
    //info = new StudyRoomInfo();
    var num=0;
    
    if( response.query.count == 0 ){
      console.log("------- dfd.resolve --------");
      return dfd.resolve();
    }
    
    //１つの図書館自習室情報
    if( selectplace != PLACE_IKOMA_ALL){ 
      for(var i in response.query.results.item){
          var entry = response.query.results.item[i];

          var link = entry.link;
          var title = entry.title;
          var description = entry.description;
          var dateString = new Date(entry.pubDate);
          var year = dateString.getFullYear();
          var month = dateString.getMonth() + 1;    //getMonthは0～11という不思議な仕様なので１加算
          var day = dateString.getUTCDate();

          var dateStringNow = new Date();

          if(DEBUG_NOT_ONLYTODAY){  //DEBUGとして全て登録する
            set_studyroominfomations( title, link, dateString, description, num, 0 );
            num++;
          }
          else{
              //console.log("publish date(UTC)="+day);
              //console.log("now date(UTC)="+dateStringNow.getUTCDate());

            if( is_today( dateString )){
              set_studyroominfomations( title, link, dateString, description, num, 0 );
              num++;
            }
          }
          


          //}

        console.log("i=" +i+" title="+ title + " link="+link + " date="+year+"/"+month+"/"+day);
        //console.log("body="+description);

      }
    }
    //１つの図書館自習室情報(ここまで)
    //全図書館自習室情報
    else{
      for(var i in response.query.results.results){    //json.query.results.results[0].item.link
          
        console.log("i="+i);
        
          if( response.query.results.results[i] == null ){
            console.log(i+"番目はnull");
            continue;
          }
          var entry = response.query.results.results[i].item;

          var link = entry.link;
          var title = entry.title;
          var description = entry.description;
          var dateString = new Date(entry.pubDate);
          var year = dateString.getFullYear();
          var month = dateString.getMonth() + 1;
          var day = dateString.getDate();

          var dateStringNow = new Date();

          if(DEBUG_NOT_ONLYTODAY){  //DEBUGとして全て登録する
            set_studyroominfomations( title, link, dateString, description, num, i );
            num++;
          }
          else{
              //console.log("publish date(UTC)="+day);
              //console.log("now date(UTC)="+dateStringNow.getUTCDate());

            if( is_today( dateString )){
              set_studyroominfomations( title, link, dateString, description, num, i );
              num++;
            }
          }


          //}

        console.log("i=" +i+" title="+ title + " link="+link + " date="+year+"/"+month+"/"+day);
        //console.log("body="+description);

      }
      //全図書館自習室情報(ここまで)
      
    }
    console.log("------- dfd.resolve --------");
    return dfd.resolve();
    
  });
  
  console.log("------- dfd.promise --------");
  return dfd.promise();
};



function set_studyroominfomations( title, link, dateString, description, num, place_num ){
  info = new StudyRoomInfo();
          
  info.title = title;
  info.link = link;
  info.date = dateString;
  //info.content = description;
  info.place = place_num2name( place_num );
  studyroominfomations[num] = info;
          
  console.log("num="+num);
  console.log("title="+title);
  console.log("studyroominfomations[" +num+ "].title=" + studyroominfomations[num].title);
}

function init_studyroominfomations(){
  if( studyroominfomations.length != 0 ){
    while( studyroominfomations.length > 0 ){
      studyroominfomations.pop();
    }
  }
}

function place_num2name( num ){
  var place_name = array_place_name[num];
  console.log("num="+num + "name="+place_name);
  return place_name;
}




function make_query_url( selectplace ){
  var url;
  
  switch( selectplace ){
    case PLACE_IKOMA_ALL:
      url = URL_IKOMA_ALL;
      break;
      
    case PLACE_IKOMA_TOSHOKAN:
      url = URL_IKOMA_TOSHOKAN;
      break;
      
    case PLACE_IKOMA_HABATAKI:
      url = URL_IKOMA_HABATAKI;
      break;
      
    case PLACE_IKOMA_SESERAGI:
      url = URL_IKOMA_SESERAGI;
      break;
      
    case PLACE_IKOMA_SHIKANODAI:
      url = URL_IKOMA_SHIKANODAI;
      break;
      
    case PLACE_IKOMA_TAKEMARU:
      url = URL_IKOMA_TAKEMARU;
      break;
      
    case PLACE_IKOMA_MIRAKU:
      url = URL_IKOMA_MIRAKU;
      break;

    default:
      url = URL_IKOMA_TOSHOKAN;
      break;
  }
      
  return url;
  
}

function is_today( target_dateObj ){

  var TIME_THRESHOLD;
  if( DEBUG_ISTODAY_24H ){
    TIME_THRESHOLD = 24 * 60 * 60 * 1000;    //12H  
  }
  else{ //リリース時はこちら
    TIME_THRESHOLD = 12 * 60 * 60 * 1000;    //12H
  }
  
  var dateObjNow = new Date();
  //var dateObjNow = new Date("Wed, 15 Nov 2017 09:00:00 +0900"); 

  //console.log("now date="+dateObjNow.getUTCDate());
  //console.log("now hour="+dateObjNow.getUTCHours());
  //console.log("target date="+target_dateObj.getUTCDate());
  //console.log("target hour="+target_dateObj.getUTCHours());
  
  
  
  //厳密に今日か否かでは無く、暫定的に12時間以内か否かで判定しよう
  if( dateObjNow.getTime() - target_dateObj.getTime() < TIME_THRESHOLD ){
    console.log("is today(within 12H)");
    return 1;
  }
  else{
    return 0;
  }
  
  
}
