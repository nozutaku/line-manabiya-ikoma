/* ------------------------------------------------------
   BOTが返す各種言葉
   ------------------------------------------------------ */

//get_examination_day();


/* 入試残日程情報   inde.jsに定義
var ExamInfo = function( ){
  this.exam_name = "";
  this.exam_remain_day;
}
examinfo = new Array();
*/


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


module.exports.get_examination_day = function(){

  var DAY = 24 * 60 * 60 * 1000;

  var dateObjNow = new Date();

  var date_obj;
  var remain_day;
  var i, j;
  
  init_exam_info();

  
  for( i=0; i< exam_table.length; i++ ){
    remain_day = Math.floor((( new Date( exam_table[i][1] )).getTime() - dateObjNow.getTime()) / DAY );
    console.log("remain_day["+i+"]="+remain_day);
    
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


