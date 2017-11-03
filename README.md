# 学び舎GO！

生駒の図書館自習室の今日の空き状況が分かるよ。学び舎へ今すぐGO！

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
```

