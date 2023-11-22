
const idForOutputBox = "yh-extension-output-box";
const idForDialog = "hy-extension-dialog";
const zIndexForDialog = 999;
const callingNextPageInterval = 500; // in millisecond

/**
 * @typedef YhProductInfo 
 * @property {string} title
 * @property {string} price 
 * @property {string} url
 */

/**  
 * @callback YhWriteOneOrderCallback
 * @param {YhParseContext} context
 * @returns 
 */

/**
 * @typedef YhParseContext
 * @property {string} date
 * @property {string} storeName
 * @property {string} currentStatus
 * @property {string} orderNumber
 * @property {YhProductInfo} productInfo
 * @property {YhWriteOneOrderCallback} writeOneOrder
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
 * @returns {boolean}
 */
function handleProductInfos(context, elItemList) {
  const elProductInfos = elItemList.getElementsByClassName("elProductInfo");

  for (let i = 0; i < elProductInfos.length; i++) {
    const elPrice = getFirstChildOfClassElement(elProductInfos[i], "elPrice");
    // getTitleInfo may create productInfo property on context.
    // Then, let's set the price to it.
    if (elPrice && handleTitleInfo(context, elProductInfos[i])) {
      let price = elPrice.innerHTML;
      price = price.replace("円", "");
      price = price.replaceAll(",", "");
      context.productInfo.price = price;
      writeOneLine(context);
    }
  }
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
 * @param {HTMLElement} elOrderItem 
 * @returns {boolean}
 */
function handleItems(context, elOrderItem) {
  const elItems = elOrderItem.getElementsByClassName("elItem");
  for (let i = 0; i < elItems.length; i++) {
    const elItemList = elItems[i].getElementsByClassName("elItemList");
    for (let x = 0; x < elItemList.length; x++) {
      handleCurrentStatus(context, elItemList[x]);
      handleStoreInfo(context, elItemList[x]);
      handleOrderNumber(context, elItemList[x]);
      handleProductInfos(context, elItemList[x]);
    }
  }
}

/**
 * @param {YhParseContext} context
 * @param {HTMLElement} ordHistory 
 * @returns {boolean}
 */
function handleOrderItem(context, ordHistory) {
  const elOrderItems = ordHistory.getElementsByClassName("elOrderItem");
  for (let i = 0; i < elOrderItems.length; i++) {
    handleOrderDate(context, elOrderItems[i]);
    handleItems(context, elOrderItems[i]);
  };
}

/**
 * @param {YhParseContext} context
 * @returns
 */
function writeOneLine(context) {
  if (context.writeOneOrder) {
    context.writeOneOrder(context);
  }
}

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
        await handleDocument(context, doc);
        console.log("parsing next page is done!");
        return Promise.resolve(true);
      } catch (e) {
        console.error("hy extension: while fetching and parsing the next page, error happened : " + JSON.stringify(e));
        return Promise.resolve(false);
      }
    }
  }
  return Promise.resolve(false);
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
    handleOrderItem(context, ordHistory);
    await handleElNext(context, d);
  } else {
    console.error("hy extension: no #ordhist Element in the document");
    return Promise.resolve(false);
  }
  return Promise.resolve(true);
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

  appendOutputBox() {
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
        this.showOutputBox(false)
      }
    });

    /** close button */
    let closeBtn = d.createElement("button");
    closeBtn.innerText = "閉じる";
    let ui = this;
    closeBtn.addEventListener("click", () => {
      ui.showOutputBox(false);
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
  check1();
  
  const runButton = ui.appendRunButton();
  runButton.addEventListener("click", () => {

    let csvData = "日付,商品名,価格,ステータス,URL,ストア名,注文番号\n"; // csv header

    /** @type {YhParseContext} */
    let ctx = {
      writeOneOrder: (ctx) => {
        let line = `"${ctx.date}", "${ctx.productInfo.title}", "${ctx.productInfo.price}", "${ctx.currentStatus}", "${ctx.productInfo.url}", "${ctx.storeName}", "${ctx.orderNumber}"\n`;
        ui.writeToOutputBox(line);
        csvData = csvData + line;
      }
    };

    ui.clearOutputBox();
    ui.showOutputBox(true);
    handleDocument(ctx, document).then(() => {
      console.log("all done!");
      downloadCsv(csvData);
    })
  })

  ui.appendOutputBox();
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
