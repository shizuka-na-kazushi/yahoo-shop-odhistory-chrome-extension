const debugEnableRunButton = false;

/**
 * @typedef yhDetails
 * @property {string} orderDate
 * @property {string} orderNumber
 * @property {string} billName
 * @property {string} payMethod
 * @property {string} subtotal
 * @property {number} postage
 * @property {number} commission
 * @property {number} sum
 * @property {yhDetailsOrderItem[]} orderList
 * 
 * @typedef yhDetailsOrderItem
 * @property {string} productUrl
 * @property {string} name
 * @property {number} price
 * @property {number} num
 * @property {string} shipData
 */


/**
 * 
 * @param {string} str ex. "123,456,789円"
 * @returns {number}  ex. 123456789 
 */
function priceStrToInt(str) {
  let price = str;
  price = price.replace("円", "");
  price = price.replaceAll(",", "");
  return parseInt(price);
}

/**
 * 
 * @param {yhDetails} details 
 * @param {HTMLElement} shpMain
 */
function handleMdOrderNumber(details, shpMain) {
  const mdOrderNumber = shpMain.getElementById("ordov");
  if (!mdOrderNumber) {
    return;
  }

  const elOrderDates = mdOrderNumber.getElementsByClassName("elOrderDate");
  if (!elOrderDates || elOrderDates.length <= 0) {
    return;
  }
  handleElOrderDate(details, elOrderDates[0]);

  const elOrderNumbers = mdOrderNumber.getElementsByClassName("elOrderNumber");
  if (!elOrderNumbers || elOrderNumbers.length <= 0) {
    return;
  }

  handleElOrderNumber(details, elOrderNumbers[0]);
}

/**
 * 
 * @param {yhDetails} details 
 * @param {HTMLElement} elOrderDate 
 */
function handleElOrderDate(details, elOrderDate) {
  const elDetails = elOrderDate.getElementsByClassName("elDetail");
  if (!elDetails || elDetails.length <= 0) {
    return;
  }

  if (elDetails[0].children && 0 < elDetails[0].children.length) {
    let date = elDetails[0].children[0].innerHTML;
    date = date.split(" ")[0];
    details.orderDate = date;
  } else {
    details.orderDate = "";
  }
}

/**
 * 
 * @param {yhDetails} details 
 * @param {HTMLElement} elOrderDate 
 */
function handleElOrderNumber(details, elOrderNumber) {
  const elOrderList = getFirstChildOfClassElement(elOrderNumber, "elOrderList");
  if (!elOrderList) {
    return;
  }
  details.orderNumber = elOrderList.innerHTML;
}


/**
 * 
 * @param {yhDetails} details 
 * @param {HTMLElement} shpMain 
 */
function handleMdOrderItem(details, shpMain) {
  const mdOrderItem = shpMain.getElementById("orddtl");
  if (!mdOrderItem) {
    return;
  }

  const elLists = mdOrderItem.getElementsByClassName("elList");
  if (!elLists || elLists.length <= 0) {
    return;
  }

  const elDetails = elLists[0].getElementsByClassName("elDetail");
  for (let i = 0; i < elDetails.length; i++) {
    handleMdOrderDetail(details, elDetails[i]);
  }

  return;
}

/**
 * 
 * @param {yhDetails} details 
 * @param {HTMLElement} elDetail 
 */
function handleMdOrderDetail(details, elDetail) {
  /** @type {yhDetailsOrderItem} */
  let item = {};

  // image
  // const anchorImage = getFirstChildOfClassElement(elDetail, "elImage");
  // const imageInfo = getAnchorInfo(anchorImage);
  // item.imageUrl = imageInfo.url;

  // product name and url
  const anchorName = getFirstChildOfClassElement(elDetail, "elName");
  const nameInfo = getAnchorInfo(anchorName);
  item.productUrl = nameInfo.url;
  if (anchorName && anchorName.children && 0 < anchorName.children.length) {
    item.name = anchorName.children[0].innerHTML;
  } else {
    item.name = "";
  }

  // price
  handleMdOrderDetailInfo(item, elDetail);

  // push item
  details.orderList.push(item);
}

/**
 * 
 * @param {yhDetailsOrderItem} item 
 * @param {HTMLElement} elDetail 
 */
function handleMdOrderDetailInfo(item, elDetail) {
  const elInfos = elDetail.getElementsByClassName("elInfo");
  if (!elInfos || elInfos.length < 0) {
    return;
  }

  const elPrices = elInfos[0].getElementsByClassName("elPrice");
  if (elPrices && 0 < elPrices.length) {
    item.price = priceStrToInt(elPrices[0].innerHTML);
  } else {
    item.price = 0;
  }

  const elNums = elInfos[0].getElementsByClassName("elNum");
  if (elNums && 0 < elNums.length) {
    /** @type {string} num */
    let num = elNums[0].innerHTML;
    num = num.replace(/[^0-9]/g, '');
    item.num = parseInt(num);
  } else {
    item.num = 0;
  }

  const elShipDatas = elInfos[0].getElementsByClassName("elShipData");
  if (elShipDatas && 0 < elShipDatas.length) {
    item.shipData = elShipDatas[0].innerHTML;
  } else {
    item.shipData = "";
  }
}


/**
 * 
 * @param {yhDetails} details 
 * @param {HTMLElement} shpMain 
 */
function handleMdOrderAddress(details, shpMain) {
  const mdOrderDetails = shpMain.getElementsByClassName("mdOrderDetail");
  if (!mdOrderDetails || mdOrderDetails.length <= 0) {
    return;
  }

  const elBills = mdOrderDetails[0].getElementsByClassName("elBill");
  if (!elBills || elBills.length <= 0) {
    return;
  }

  handleBill(details, elBills[0]);

  const elPayMethods = mdOrderDetails[0].getElementsByClassName("elPayMethod");
  if (!elPayMethods || elPayMethods.length <= 0) {
    return;
  }

  handlePayMethod(details, elPayMethods[0]);
}

/**
 * 
 * @param {yhDetails} details 
 * @param {HTMLElement} elBill 
 */
function handleBill(details, elBill) {
  const el = getFirstChildOfClassElement(elBill, "elName");
  if (el) {
    details.billName = el.innerHTML;
  } else {
    details.billName = "";
  }
}

/**
 * 
 * @param {yhDetails} details 
 * @param {HTMLElement} elBill 
 */
function handlePayMethod(details, elBill) {
  const el = getFirstChildOfClassElement(elBill, "elInfo");
  if (!el) {
    details.payMethod = "";
    return;
  }

  let str = el.textContent;
  str = str.replaceAll(" ", "");
  str = str.replaceAll("\n", "");
  details.payMethod = str;
}

/**
 * 
 * @param {yhDetails} details 
 * @param {HTMLElement} shpMain 
 * @returns 
 */
function handleMdOrderReceipt(details, shpMain) {
  const mdOrderReceipts = shpMain.getElementsByClassName("mdOrderReceipt");
  if (!mdOrderReceipts || mdOrderReceipts.length <= 0) {
    return;
  }

  handleTotalAmount(details, mdOrderReceipts[0]);
}

/**
 * 
 * @param {yhDetails} details 
 * @param {HTMLElement} mdOrderReceipt 
 * @returns 
 */
function handleTotalAmount(details, mdOrderReceipt) {
  details.subtotal = 0;
  details.postage = 0;
  details.commission = 0;
  details.sum = 0;

  const elTotalAmounts = mdOrderReceipt.getElementsByClassName("elTotalAmount");
  if (!elTotalAmounts || elTotalAmounts.length <= 0) {
    return;
  }

  const elLists = elTotalAmounts[0].getElementsByClassName("elList");
  if (!elLists || elLists.length <= 0) {
    return;
  }

  const elList = elLists[0];
  // searching "商品合計(xx)" <li> element in <li> list 
  // <li><dl>   <dt>商品合計</dt> <dd>〇,〇円</dd>   </dl></li>
  for (let i = 0; i < elList.children.length; i++) {
    let strText = (elList.children[i]).innerText;
    if (0 <= strText.indexOf("商品合計")) {
      handleSubtotal(details, elList.children[i]);
    } else if (0 <= strText.indexOf("送料")) {
      handlePostage(details, elList.children[i]);
    } else if (0 <= strText.indexOf("手数料")) {
      handleCommission(details, elList.children[i]);
    }
  }
  
  handleElSum(details, elList);
}

/**
 * 
 * @param {yhDetails} details 
 * @param {HTMLElement} elLi 
 */
function handleSubtotal(details, elLi) {
  const elSubtotalData = elLi.getElementsByTagName("dd");
  if (!elSubtotalData || elSubtotalData.length <= 0) {
    return;
  }
  details.subtotal = priceStrToInt(elSubtotalData[0].innerText); 
}

/**
 * 
 * @param {yhDetails} details 
 * @param {HTMLElement} elLi 
 */
function handlePostage(details, elLi) {
  const elPostages = elLi.getElementsByTagName("dd");
  if (!elPostages || elPostages.length <= 0) {
    return;
  }
  details.postage = priceStrToInt(elPostages[0].innerText); 
}

/**
 * 
 * @param {yhDetails} details 
 * @param {HTMLElement} elLi 
 */
function handleCommission(details, elLi) {
  const elCommissions = elLi.getElementsByTagName("dd");
  if (!elCommissions || elCommissions.length <= 0) {
    return;
  }
  details.commission = priceStrToInt(elCommissions[0].innerText);
}

/**
 * 
 * @param {yhDetails} details 
 * @param {HTMLElement} elList 
 */
function handleElSum(details, elList) {
  // <li class="elSum"><dl>  <dt>合計金額(税込)</dt> <dd>〇,〇円</dd>  </dl></li>

  const elSums = elList.getElementsByClassName("elSum");
  if (!elSums || elSums.length <= 0) {
    return;
  }

  const elSum = elSums[0];
  const elSumData = elSum.getElementsByTagName("dd");
  if (!elSumData || elSumData.length <= 0) {
    return;
  }

  details.sum = priceStrToInt(elSumData[0].innerText);
}



/**
 * 
 * @param {Document} d 
 * @returns {yhDetails | null}  null if parsing is failed.
 */
function handleShpMain(d) {

  /**  @type {yhDetails} */
  const details = { orderList: [] };

  const shpMain = d.getElementById("shpMain");
  if (!shpMain) {
    return null;
  }

  handleMdOrderNumber(details, d);
  handleMdOrderItem(details, d);
  handleMdOrderAddress(details, d);
  handleMdOrderReceipt(details, d);

  return details;
}

function createCheckButton() {
  const d = document;

  const elTitle = d.getElementsByClassName("mdPageTitle");
  if (elTitle && 0 < elTitle.length) {
    const button = d.createElement("button");
    button.innerText = "run";
    button.addEventListener("click", () => {

      const details = handleShpMain(d);

      console.log(JSON.stringify(details, null, " "));

      let total = 0;
      details.orderList.map((item) => {
        total += (item.price * item.num);
      })
    
      console.log("total price: " + total);
    })

    elTitle[0].appendChild(button);
  }
}

function pageMainForDetails() {
  if (debugEnableRunButton) {
    createCheckButton();
  }
}


/* 
  mdOrderNumber: {
    elOrder: {
      elOrderDate: {
        elTitle: {},
        elDetail: {}
      },
      elOrderNumber: {
        elTitle: {},
        elDetail: {}
      }
    }
  },
  mdOrderItem : {
    elItem: {
      elList: [
        elDetail: {
          elImage: {data},
          elName: {a: {}},
          elInfo: {
            elPrice: string,
            elNum: string,
            elShipData: string,
          }
        },
        elDetail: {
          ...
        }
      ]
    }
  }

*/