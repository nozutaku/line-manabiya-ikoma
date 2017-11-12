//カテゴリDBへデータをセットする際に１回のみ行う。サーバー上のpostgres DBへデータを直接importするならば本APIを呼ぶ必要性は無
//本APIを呼んだ場合は １時間後以降にset_category_db_2.js とset_category_db_3.jsも呼ぶ必要性有

var api = require('../index.js');

push_notification_mode = 1;   //broadcast
api.send_notification_hourly();

