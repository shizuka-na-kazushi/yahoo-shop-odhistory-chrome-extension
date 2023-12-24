
const callingNextPageInterval = 300; // in millisecond
const callingDetailsPageInterval = 150; // in millisecond

const debugStopNextPage = false;

const detailsUrl = "https://odhistory.shopping.yahoo.co.jp/order-history/details";

/**  
 * @callback YhWriteLinesCallback
 * @param {YhParseContext} context
 * @returns 
 */

/**  
 * @callback YhProgressCallback
 * @param {number} percent (0 - 100)
 * @param {number} totalCount
 * @param {number} currentCount
 * @returns 
 */

/**
 * @callback YhErrorCallback
 * @param {Error} e
 */

/**
 * @typedef YhDetailButtonForm
 * @property {string} listCatalog
 * @property {string} catalog
 * @property {string} oid
 */

/**
 * @typedef YhProgressInfo
 * @property {string} totalCount
 * @property {string} processingOrderCount
 */

/**
 * @typedef YhConfig
 * @property {"per-product"|"per-order"} csvType
 * @property {boolean} enablePostage
 */

/**
 * @typedef YhParseContext
 * @property {string} date
 * @property {string} storeName
 * @property {string} currentStatus
 * @property {string} orderNumber
 * @property {YhDetailButtonForm} buttonForm
 * @property {yhDetails} details
 * @property {YhWriteLinesCallback} writeLines
 * @property {YhProgressCallback} onProgress
 * @property {YhErrorCallback} onError
 * @property {boolean} processing
 * @property {YhProgressInfo} progressInfo
 * @property {YhConfig} config
 * @property {string} csvData
 */


/**
 * @param {YhParseContext} context
 * @param {HTMLElement} elOrderItem 
 * @returns {boolean}
 */
function handleOrderDate(context, elOrderItem) {
  const elDate = getFirstChildOfClassElement(elOrderItem, "elDate");
  if (elDate) {
    context.date = elDate.innerHTML;
    return true;
  }
  return false;
}

/**
 * getTitleInfo() 
 * if it returns true, context will have proper productInfo object which can be safely access to.
 * @param {YhParseContext} context
 * @param {HTMLElement} elProductInfo 
 * @returns {boolean}
 */
// returns {title: string, url: string}
function handleTitleInfo(context, elProductInfo) {
  let retObj = { title: "", url: "" };

  // url <.elTitle><a href="..."><span>title</span></a></.elTitle>
  const anchor = getFirstChildOfClassElement(elProductInfo, "elTitle");
  retObj = getAnchorInfo(anchor);

  if (!retObj.title || !retObj.url) {
    return false;
  }

  context.productInfo = retObj;
  return true;
}

/**
 * @param {YhParseContext} context
 * @param {HTMLElement} elItemList 
 */
function handleStoreInfo(context, elItemList) {
  const elStoreInfo = elItemList.getElementsByClassName("elStoreInfo");
  if (elStoreInfo && 0 < elStoreInfo.length) {
    let anchor = getFirstChildOfClassElement(elStoreInfo[0], "elName");
    let info = getAnchorInfo(anchor);
    context.storeName = info.title;
  }
}

/**
 * @param {YhParseContext} context
 * @param {HTMLElement} elItemList 
 */
function handleCurrentStatus(context, elItemList) {
  const elCurrentStatusTexts = elItemList.getElementsByClassName("elCurrentStatusText");
  if (elCurrentStatusTexts && 0 < elCurrentStatusTexts.length) {
    context.currentStatus = elCurrentStatusTexts[0].innerHTML;
  }
}

/**
 * @param {YhParseContext} context
 * @param {HTMLElement} elItemList 
 */
function handleOrderNumber(context, elItemList) {
  const elOrderData = elItemList.getElementsByClassName("elOrderData");
  if (elOrderData && 0 < elOrderData.length) {
    context.orderNumber = elOrderData[0].innerHTML;
  }
}

/**
 * @param {YhParseContext} context
 * @param {HTMLElement} elItemList 
 */
function handleControl(context, elItemList) {
  const elControls = elItemList.getElementsByClassName("elControl");
  if (elControls && 0 < elControls.length) {
    let forms = elControls[0].getElementsByTagName("form");
    if (forms && 0 < forms.length) {

      /** @type {YhDetailButtonForm} */
      let obj = {};
      const a = getInputInfos(forms[0]);
      a.forEach((i) => {
        if (i.name == "list-catalog") {
          obj.listCatalog = i.value;
        } else if (i.name == "catalog") {
          obj.catalog = i.value;
        } else if (i.name == "oid") {
          obj.oid = i.value;
        }
      })
      context.buttonForm = obj;
    }
  }
}

/**
 * @param {YhParseContext} context
 * @param {HTMLElement} elOrderItem 
 * @returns {Promise<boolean>}
 */
async function handleItems(context, elOrderItem) {

  let result = true;
  const elItems = elOrderItem.getElementsByClassName("elItem");
  for (let i = 0; i < elItems.length && result; i++) {
    const elItemList = elItems[i].getElementsByClassName("elItemList");
    for (let x = 0; x < elItemList.length && result; x++) {

      context.progressInfo && context.progressInfo.processingOrderCount++;

      handleCurrentStatus(context, elItemList[x]);
      handleStoreInfo(context, elItemList[x]);
      handleOrderNumber(context, elItemList[x]);
      handleControl(context, elItemList[x]);
      context.details = await fetchDetails(context.buttonForm);
      if (!context.details && context.onError) {
        context.onError(new Error("注文情報が取得できない"));
      } else {

        context.writeLines(context);
      
        if (context.progressInfo) {
          const percent = parseInt((context.progressInfo.processingOrderCount / context.progressInfo.totalCount) * 100);
          console.log(`progress: ${context.progressInfo.processingOrderCount} / ${context.progressInfo.totalCount}`);
          if (context.onProgress) {
            context.onProgress(percent, context.progressInfo.totalCount, context.progressInfo.processingOrderCount);
          }
        }
      }

      if (!context.processing) {
        result = false;
        console.log("process aborted, while fetchDetails()!");
      }
    }
  }
  return Promise.resolve(result);
}

/**
 * @param {YhParseContext} context
 * @param {HTMLElement} ordHistory 
 * @returns {boolean}
 */
async function handleOrderItem(context, ordHistory) {

  let result = true;
  const elOrderItems = ordHistory.getElementsByClassName("elOrderItem");
  for (let i = 0; i < elOrderItems.length && result; i++) {
    handleOrderDate(context, elOrderItems[i]);
    result = await handleItems(context, elOrderItems[i]);
  };

  return Promise.resolve(result);
}

/**
 * 
 * @param {YhDetailButtonForm} bf
 * @returns {Promise<yhDetails|null>} 
 */
async function fetchDetails(bf) {

  await waitForSometime(callingDetailsPageInterval);

  try {
    let body = `list-catalog=${encodeURIComponent(bf.listCatalog)}&catalog=${encodeURIComponent(bf.catalog)}&oid=${encodeURIComponent(bf.oid)}`;
    const htmlOfDetails = await (await fetch(detailsUrl, {
      method: "POST",
      headers:
        { "Content-Type": "application/x-www-form-urlencoded", },
      body: body,
    })).text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlOfDetails, 'text/html');
    let details = await handleShpMain(doc);
    return Promise.resolve(details);

  } catch (e) {
    console.error("fetching and parsing 'details' page failed! order number: " + bf.orderNumber);
  }

  return Promise.resolve(null);
}

/**
 * @param {YhParseContext} context
 * @returns
 */
// function writeOneLine(context) {
//   if (context.writeLines) {
//     context.writeLines(context);
//   }
// }

/**
 * @param {YhParseContext} context
 * @param {Document} d
 * @returns {Promise<boolean>} 
 */
async function handleElNext(context, d) {
  let elNexts = d.getElementsByClassName("elNext");
  if (elNexts && 0 < elNexts.length && elNexts[0].hasAttributes()) {
    let href = "";
    for (let attr of elNexts[0].attributes) {
      if (attr.name == "href") {
        href = attr.value;
        break;
      }
    }
    if (href !== "") {
      console.log("parse next page: " + href);
      console.log(`will call next page after ${callingNextPageInterval} millisec...`);
      await waitForSometime(callingNextPageInterval);
      try {
        const html = await (await fetch(href)).text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const result = await handleDocument(context, doc);
        console.log("parsing next page is done!");
        return Promise.resolve(result);
      } catch (e) {
        console.error("hy extension: while fetching and parsing the next page, error happened : " + JSON.stringify(e));
        return Promise.resolve(false);
      }
    }
  }
  return Promise.resolve(true);
}

/**
 * 
 * @param {YhParseContext} context 
 * @param {Document} d 
 */
function handleMdOrderFilter(context, d) {

  if ("progressInfo" in context) {
    // If progressInfo is already available in context, 
    // it may be created as result of parsing and setting in the first page.
    // Let's skip parsing below...
    return;
  }

  const mdOrderFilter = d.getElementById("ordsea");
  const elCounts = mdOrderFilter.getElementsByClassName("elCount");
  if (!elCounts || elCounts.length <= 0) {
    return;
  }

  const total = parseInt(elCounts[0].innerText);
  context.progressInfo = { totalCount: total, processingOrderCount: 0 };
}

/**
 * 
 * @param {YhParseContext} context 
 * @param {Document} d
 * @return {Promise<boolean>}
 */
async function handleDocument(context, d) {

  handleMdOrderFilter(context, d);

  const ordHistory = d.querySelector('#ordhist');
  // `d.querySelector` may return null if the selector doesn't match anything.
  if (ordHistory) {

    // making progress with looking total order count
    handleMdOrderFilter(context, ordHistory);

    // let's parse orders
    let result = await handleOrderItem(context, ordHistory);

    // go next page! it may make call for handleDocument() recursively with the next page Document
    if (!debugStopNextPage && result) {
      result = await handleElNext(context, d);
    }
    return Promise.resolve(result);
  } else {
    console.error("hy extension: no #ordhist Element in the document");
    return Promise.resolve(false);
  }
}



class UIFactory {

  /** @type {UiDialog} */
  dialog;

  constructor() {
    this.dialog = new UiDialog(document, document.body);
    this.appendOpenButton();
  }

  /**
   * 
   */
  appendOpenButton() {
    const d = document;
    let shpMain = d.getElementById("shpHeader");
    if (shpMain) {
      let elButton = d.createElement("button");
      elButton.innerText = "CSVファイルの取得";
      elButton.setAttribute("style", "margin: 10px 10px 10px 10px");
      elButton.addEventListener("click", () => {
        this.dialog.show();
      })
      shpMain.appendChild(elButton);
      return elButton;
    }
  }

  /**
   * 
   * @param {() => void} callback 
   */
  addStartListener(callback) {
    this.dialog.startButton.el.addEventListener("click", callback);
  }

  /**
   * 
   * @param {() => void} callback 
   */
  addOnCloseListener(callback) {
    this.dialog.onClose = callback;
  }

  /**
   * 
   * @param {string} msg 
   */
  displayMessage(msg) {
    this.dialog.message.setText(msg);
  }
};

/**
 * check if showing page is the first page of list
 * if pagination is needed, second or upper page does not require 'csv file ' start button
 */
function isFirstListPage() {
  const params = (new URL(location.href)).searchParams;
  const firstorder = params.get("firstorder");
  const type = params.get("type");
  return (!firstorder || firstorder == "1") && !type;
}

function pageMainForList() {

  if (!isFirstListPage()) {
    return;
  }

  const ui = new UIFactory();

  ui.addStartListener(() => {
    ui.dialog.message.setText(`データ取得中: ...`);

    /** @type {YhParseContext} */
    let ctx = {
      processing: true,
      config: {
        csvType: ui.dialog.preference.type,
        enablePostage: ui.dialog.preference.checkboxPostage.getCheck()
      },
      csvData: "",
    }
    
    /** set writeLines function to context depended on csv type **/
    if (ctx.config.csvType === "per-product") {
      formatCsvPerProduct(ctx);
    } else if (ctx.config.csvType === "per-order") {
      formatCsvPerOrder(ctx);
    }

    // 更新情報
    ctx.onProgress = (percent, totalCount, currentCount) => {
      ui.dialog.progressBar.setProgress(percent);
      ui.dialog.message.setText(`データ取得中: ${currentCount} / ${totalCount}`);
    }

    // エラー情報
    ctx.onError = (e) => {
      alert("エラーが発生しました(注文情報が取得できません)。\nブラウザの再読み込みを行い、再度実行して下さい。");
      ctx.processing = false;
    }

    // dialog を閉じたときの処理
    ui.addOnCloseListener(() => {
      ctx.processing = false;
    });

    // 実行
    handleDocument(ctx, document).then((result) => {
      if (result) {
        ui.dialog.progressBar.setProgress(100);
        console.log("all done!");
        downloadCsv(ctx.csvData, 'order-history.csv');
        ui.dialog.close();
      } else {
        console.log("csv file is not generated due to result false returned.");
        ui.dialog.close();
      }
    })
  })

}


/*
  elOrderItem: {
    elDate : data,
    elItem : [ 
      {
        elItemList: {
          elSummary : {elCurrentStatusText: text},
          elProduct : [
            {elProductItem: data},
            {elProductItem: data},
          ],
          elInfo: {
            elStore: { elStoreInfo: {elName: }}
          }
        }, 

      },
      {
        elItemList: {
          elSummary : {elCurrentStatusText: text},
          elProduct : [
            {elProductItem: data},
            {elProductItem: data},
          ],
          elInfo: {
            elStore: { elStoreInfo: {elName: }}
          }
        }
    ]
  }

*/
