
# Yahoo！　ショッピング 注文履歴　CSVファイル作成

Yahoo ショッピングの注文履歴をCSVファイルとしてダウンロードするための、Chrome 拡張機能のソースコードです。

# インストール方法
Chrome ウェブストアからインストールできるように準備中。

ストア以外から使用する場合は、以下の手順でどうぞ
1. ローカルディスクに本ソースコードをダウンロード
2. Chromeのメニュー＞拡張機能＞拡張機能を管理にて、「ディベロッパー　モード」を有効にします。
3. 「パッケージ化されていない拡張機能を読み込む」ボタンを押してダウンロードしたソースファイルの**src**ディレクトリを指定します
4. Yahooショッピングの「注文履歴」ページを開く

# 使い方
https://odhistory.shopping.yahoo.co.jp/order-history/list

を表示するとボタンが表示されます。

購入履歴が表示されますが、本拡張機能をインストールすると「一覧」の下に
「ダウンロードCSVファイル」ボタンが表示されるようになります。

CSVファイルとして取り出したい条件（例えば、何年のデータか？）を決めてリストを表示します。その状態で、このボタンを押します。
しばらくすると、ダウンロードが開始され、ファイルに保存ダイアログが表示されますのでローカルディスクに保存して下さい。

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
