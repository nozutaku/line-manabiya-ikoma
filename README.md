# 学び舎GO！

生駒の図書館自習室の今日の空き状況が分かるよ。学び舎へ今すぐGO！
https://www.code4ikoma.org/?p=346

## 設計概要

本ソースをheroku へ展開し、LINE botと接続する。

## How to use

Install deps:

```bash
$ npm install
```

Configuration:

```
heroku 環境変数
$ heroku config:set CHANNEL_SECRET=YOUR_CHANNEL_SECRET
$ heroku config:set CHANNEL_ACCESS_TOKEN=YOUR_CHANNEL_ACCESS_TOKEN
$ heroku config:set PORT=1234
$ heroku config:set USERID=USER_USERID
$ heroku config:set YUMAKE_API_KEY=YOUR_API_KEY
$ heroku config:set YUMAKE_DOMAIN=xxxx
$ heroku config:set YUMAKE_QUERY=xxxx

$ heroku config:set DATABASE_URL=xxxx
$ heroku config:set HOST_NAME=xxxx
$ heroku config:set DATABASE_NAME=xxxx
$ heroku config:set USER_NAME=xxxx
$ heroku config:set PASSWORD=xxxx

$ heroku config:set KINTONE_URL=xxxx
$ heroku config:set CYBOZU_API_TOKEN=xxxx

$ heroku config:set FORTUNE_TELLING_DOMAIN=xxxx

```
```
heroku postgres DB構造
CREATE TABLE userid_table (
  id varchar(64) unique,
  type integer,
);
```
