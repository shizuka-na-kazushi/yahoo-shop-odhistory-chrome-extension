
const idForOutputBox = "yh-extension-output-box";
const idForDialog = "hy-extension-dialog";
const zIndexForDialog = 999;
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
 * @typedef YhDetailButtonForm
 * @property {string} listCatalog
 * @property {string} catalog
 * @property {string} oid
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
 * @property {boolean} processing
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
      handleCurrentStatus(context, elItemList[x]);
      handleStoreInfo(context, elItemList[x]);
      handleOrderNumber(context, elItemList[x]);
      handleControl(context, elItemList[x]);
      context.details = await fetchDetails(context.buttonForm);
      context.writeLines(context);
      if (!context.processing) {
        result = false;
        console.warn("process aborted, while fetchDetails()!");
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
 * @return {Promise<boolean>}
 */
async function handleDocument(context, d) {
  const ordHistory = d.querySelector('#ordhist');
  // `d.querySelector` may return null if the selector doesn't match anything.
  if (ordHistory) {
    let result = await handleOrderItem(context, ordHistory);
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
  /**
   * 
   */
  appendRunButton() {
    const d = document;
    let shpMain = d.getElementById("shpHeader");
    if (shpMain) {
      let elButton = d.createElement("button");
      elButton.innerText = "ダウンロードCSVファイル";
      elButton.setAttribute("style", "margin: 10px 10px 10px 10px");
      shpMain.appendChild(elButton);
      return elButton;
    }
  }

  appendOutputBox(onClose) {
    const d = document;
    let divDlg = d.createElement("div");
    divDlg.id = idForDialog;
    divDlg.setAttribute("style",
      `z-index: ${zIndexForDialog}; position:absolute; top: 0px; left: 0px; 
      display:none;
      background: lightgray;
      `);
    d.body.appendChild(divDlg);

    /** text area */
    let taOutput = d.createElement("textarea");
    taOutput.id = idForOutputBox;
    taOutput.readOnly = true;
    taOutput.cols = 120;
    taOutput.rows = 24;
    taOutput.addEventListener("keypress", (e) => {
      if (e.code === 27) {
        this.showOutputBox(false);
        onClose();
      }
    });

    /** close button */
    let closeBtn = d.createElement("button");
    closeBtn.innerText = "閉じる";
    let ui = this;
    closeBtn.addEventListener("click", () => {
      ui.showOutputBox(false);
      onClose();
    })

    divDlg.appendChild(closeBtn);
    divDlg.appendChild(taOutput);
  }

  showOutputBox(enable) {
    let divDlg = document.getElementById(idForDialog);
    if (divDlg) {
      divDlg.style.display = enable ? "block" : "none";
    }
  }

  writeToOutputBox(str) {
    let taOutput = document.getElementById(idForOutputBox);
    taOutput.value = taOutput.value + str;
  }

  clearOutputBox() {
    document.getElementById(idForOutputBox).value = "";
  }

};

/**
 * 
 * @param {number} millisecond 
 * @returns {Promise<>}
 */
async function waitForSometime(millisecond) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, millisecond);
  })
}

/**
 * 
 * @param {string} cvsData 
 */
function downloadCsv(csvData) {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
  let elAnchor = document.createElement('a');
  document.body.appendChild(elAnchor);

  elAnchor.href = URL.createObjectURL(blob);
  elAnchor.download = 'order-history.csv';
  elAnchor.click();

  URL.revokeObjectURL(elAnchor.href);
  document.body.removeChild(elAnchor);
}

const ui = new UIFactory();


function pageMainForList() {

  /** @type {YhParseContext} */
  let ctx = {
    processing: true,
  }

  const runButton = ui.appendRunButton();
  runButton.addEventListener("click", () => {

    let csvData = "日付,注文番号,商品名,付帯情報,価格,個数,状態,請求先,商品URL,ストア情報\n"; // csv header


    ctx.processing = true;
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
        line += `"${ctx.storeName}"`;
        line += `\n`;

        ui.writeToOutputBox(line);
        csvData = csvData + line;
      }
    };

    ui.clearOutputBox();
    ui.showOutputBox(true);
    handleDocument(ctx, document).then((result) => {
      if (result) {
        console.log("all done!");
        downloadCsv(csvData);  
      } else {
        console.warn("csv file is not generated due to result false returned.");
      }
    })
  })

  ui.appendOutputBox(() => {
    ctx.processing = false;
  });
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
