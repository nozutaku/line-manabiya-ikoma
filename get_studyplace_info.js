/* 自習室情報取得 */

var DEBUG_NOT_ONLYTODAY = 0;  //1=全て登録　0=当日のみ(正式版)

var $ = require('jquery-deferred');
//var $ = require('jquery');

var yql = require('yql-node').formatAsJSON();

var URL_IKOMA_ALL = 'select * from yql.query.multi where queries in ('
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_takemaru/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_shikanodai/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_toshokan/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_seseragi/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_habataki/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_miraku/rss.xml\' and title matches \'.*自習室.*\' limit 1\"'
		+ ')|sort(field=\'pubDate\',descending=\'true\');';

var URL_IKOMA_TOSHOKAN = "select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_toshokan/rss.xml\' and title matches \'.*自習室.*\' limit 2";
var URL_IKOMA_HABATAKI = "select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_habataki/rss.xml\' and title matches \'.*自習室.*\' limit 2";
var URL_IKOMA_SESERAGI = "select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_seseragi/rss.xml\' and title matches \'.*自習室.*\' limit 2";
var URL_IKOMA_SHIKANODAI = "select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_shikanodai/rss.xml\' and title matches \'.*自習室.*\' limit 2";
var URL_IKOMA_TAKEMARU = "select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_takemaru/rss.xml\' and title matches \'.*自習室.*\' limit 2";
var URL_IKOMA_MIRAKU = "select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_miraku/rss.xml\' and title matches \'.*自習室.*\' limit 2";



  //var query = "select title,link,date from rss where url in ('https://blogs.yahoo.co.jp/ikoma_shikanodai/rss.xml') limit 5; ";
  //var query="select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_habataki/rss.xml' limit 5";  //図書館情報多い。はばたき
  //var query="select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_toshokan/rss.xml' limit 5";  //本館。まんべんなく
  //var query="select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_toshokan/rss.xml'";  //本館。全部で１０情報取得できるらしい
  
  //本命
  //var query="select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_toshokan/rss.xml\' and title matches \'.*自習室.*\' limit 3";

  /*
  var query = 'select * from yql.query.multi where queries in ('
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_takemaru/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_shikanodai/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_toshokan/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_seseragi/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_habataki/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_miraku/rss.xml\' and title matches \'.*自習室.*\' limit 1\"'
		+ ')|sort(field=\'pubDate\',descending=\'true\');';
  */
  
  /*
    var query = 'select * from yql.query.multi where queries in ('
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_toshokan/rss.xml\' and title matches \'.*自習室.*\' limit 1\",'
		+ '\"select * from rss where url=\'https://blogs.yahoo.co.jp/ikoma_habataki/rss.xml\' and title matches \'.*自習室.*\' limit 1\"'
		+ ');';
  */
  







/* ------------- test(ここから) ------------- 
var http = require('http');
var server = http.createServer(
    function (request, response) {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        
      var studyroominfos = new Array();
      get_studyroom_info(studyroominfos);
      response.write('Hello World!!');
        response.end();
      console.log("done");
    }
).listen(3000);
------------- test(ここまで) ------------- */

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
  console.log("query="+query);
  
  
  yql.execute(query, function(error,response){
    
    //console.log("error="+error);
    
    //console.log("yql:");
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
          var month = dateString.getMonth() + 1;
          var day = dateString.getDate();

          var dateStringNow = new Date();

          if(DEBUG_NOT_ONLYTODAY){  //DEBUGとして全て登録する
            set_studyroominfomations( title, link, dateString, description, num );
            num++;
          }
          else{
              console.log("day="+day);
              console.log("date="+dateStringNow.getDate());
            if( day+1 == dateStringNow.getDate() ){   //当日のみセットする
              set_studyroominfomations( title, link, dateString, description, num );
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
          var entry = response.query.results.results[i].item;   //★★★★ここ未検証★★★★

          var link = entry.link;
          var title = entry.title;
          var description = entry.description;
          var dateString = new Date(entry.pubDate);
          var year = dateString.getFullYear();
          var month = dateString.getMonth() + 1;
          var day = dateString.getDate();

          var dateStringNow = new Date();

          if(DEBUG_NOT_ONLYTODAY){  //DEBUGとして全て登録する
            set_studyroominfomations( title, link, dateString, description, num );
            num++;
          }
          else{
            if( day == dateStringNow.getDate() ){   //当日のみセットする
              set_studyroominfomations( title, link, dateString, description, num );
              num++;
            }
          }


          //}

        console.log("i=" +i+" title="+ title + " link="+link + " date="+year+"/"+month+"/"+day);
        console.log("body="+description);

      }
      //全図書館自習室情報(ここまで)
      
    }
    console.log("------- dfd.resolve --------");
    return dfd.resolve();
    
  });
  
  console.log("------- dfd.promise --------");
  return dfd.promise();
};



function set_studyroominfomations( title, link, dateString, description, num ){
  info = new StudyRoomInfo();
          
  info.title = title;
  info.link = link;
  info.date = dateString;
  //info.content = description;
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

