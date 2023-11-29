
# Yahoo！　ショッピング 注文履歴　CSVファイル作成

Yahoo ショッピングの注文履歴をCSVファイルとしてダウンロードするための、Chrome 拡張機能のソースコードです。

# インストール方法

## Chromeウェブストア経由
Chrome ウェブストアからインストールできます。

 - [Chrome ウェブストア > "Yahooショッピング 注文履歴CSV"ページ](https://chromewebstore.google.com/detail/yahoo%E3%82%B7%E3%83%A7%E3%83%83%E3%83%94%E3%83%B3%E3%82%B0%E3%80%80%E6%B3%A8%E6%96%87%E5%B1%A5%E6%AD%B4csv/bgcccfmmbhjpocmbblokeahfoamfnfdh?hl=ja)

## ソースコードから
ストア以外から使用する場合は、以下の手順でどうぞ
1. ローカルディスクに本ソースコードをダウンロード
2. Chromeのメニュー＞拡張機能＞拡張機能を管理にて、「ディベロッパー　モード」を有効にします。
3. 「パッケージ化されていない拡張機能を読み込む」ボタンを押してダウンロードしたソースファイルの**src**ディレクトリを指定します
4. Yahooショッピングの「注文履歴」ページを開く

# 使い方
https://odhistory.shopping.yahoo.co.jp/order-history/list

を表示するとボタンが表示されます。

購入履歴が表示されますが、本拡張機能をインストールすると「一覧」の下に
「CSVファイルの取得」ボタンが表示されるようになります。

CSVファイルとして取り出したい条件（例えば、何年のデータか？）を決めてリストを表示します。その状態で、このボタンを押します。
しばらくすると、ダウンロードが開始され、ファイルに保存ダイアログが表示されますのでローカルディスクに保存して下さい。

#　リンク

ブログ記事書きました。
こちらに拡張機能のリスクなど、詳細を書いてます。よろしければ、合わせてご覧ください。

 - [Yahooショッピングの注文履歴をCSVにする　Chrome 拡張機能を作りました](https://tech-landlord.com/articles/publish-yahoo-shopping-chrome-extension/)


# スクリーンショット

![注文履歴ページ](https://github.com/shizuka-na-kazushi/yahoo-shop-odhistory-chrome-extension/blob/main/webstore/Yahoo%20shopping%20extension%20webstore%20page%201.png?raw=true)

![データ取得中](https://github.com/shizuka-na-kazushi/yahoo-shop-odhistory-chrome-extension/blob/main/webstore/Yahoo%20shopping%20extension%20webstore%20page%202.png?raw=true)

# 実演動画
[![](https://img.youtube.com/vi/w84wqTLn55Y/0.jpg)](https://www.youtube.com/watch?v=w84wqTLn55Y)


# 注意
Chrome ブラウザで使って下さい。

# ライセンス
GPL v3 

# 免責
ユーザーがこのプログラムを使用して被ったいかなる損害も、本プログラムの作者が負うことは一切ありません。
