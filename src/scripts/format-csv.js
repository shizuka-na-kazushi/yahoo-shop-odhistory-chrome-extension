
/** 
 * @param {YhParseContext} ctx  
 * @returns {void} 
 **/
function formatCsvPerProduct(ctx) {
  // csv header
  ctx.csvData = "日付,注文番号,商品名,付帯情報,価格,個数,状態,請求先,商品URL,ストア情報,支払い方法\n";
  // １オーダー毎の出力（フォーマット）
  ctx.writeLines = (ctx) => {

    let line = "";
    for (let item of ctx.details.orderList) {

      line = `"${ctx.date}",`;
      line += `"${ctx.orderNumber}",`;
      line += `"${item.name}",`;
      line += `"${item.shipData}",`;
      line += `"${item.price}",`;
      line += `"${item.num}",`;
      line += `"${ctx.currentStatus}",`;
      line += `"${ctx.details.billName}",`;
      line += `"${item.productUrl}",`;
      line += `"${ctx.storeName}",`;
      line += `"${ctx.details.payMethod}"`;
      line += `\n`;

      ctx.csvData = ctx.csvData + line;
    }

    // 送料の行を発行
    if (ctx.config.enablePostage && (0 < ctx.details.postage)) {
      line = `"${ctx.date}",`;
      line += `"${ctx.orderNumber}",`;
      line += `"注文番号: ${ctx.orderNumber} の送料",`;
      line += `"送料",`;
      line += `"${ctx.details.postage}",`;
      line += `"1",`;
      line += `"${ctx.currentStatus}",`;
      line += `"${ctx.details.billName}",`;
      line += `"",`;
      line += `"${ctx.storeName}",`;
      line += `"${ctx.details.payMethod}"`;
      line += `\n`;

      ctx.csvData = ctx.csvData + line;
    }
  };
}

/** 
 * @param {YhParseContext} ctx  
 * @returns {void} 
 **/
function formatCsvPerOrder(ctx) {
  // csv header
  ctx.csvData = "日付,注文番号,商品名,商品点数,合計金額(税込),商品合計,送料,手数料,状態,請求先,ストア情報,支払い方法\n";
  // １オーダー毎の出力（フォーマット）
  ctx.writeLines = (ctx) => {
    let line = "";
    line = `"${ctx.date}",`;
    line += `"${ctx.orderNumber}",`;
    // 商品名
    line += ((1 < ctx.details.orderList.length) ?
      `"${ctx.details.orderList[0].name}、他 ${ctx.details.orderList.length - 1}点",` :
      `"${ctx.details.orderList[0].name}",`);
    line += `"${ctx.details.orderList.length}",`;
    line += `"${ctx.details.sum}",`;
    line += `"${ctx.details.subtotal}",`;
    line += `"${ctx.details.postage}",`;
    line += `"${ctx.details.commission}",`;
    line += `"${ctx.currentStatus}",`;
    line += `"${ctx.details.billName}",`;
    line += `"${ctx.storeName}",`;
    line += `"${ctx.details.payMethod}"`;
    line += `\n`;

    ctx.csvData = ctx.csvData + line;
  };
}

