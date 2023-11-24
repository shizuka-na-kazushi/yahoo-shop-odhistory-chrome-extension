const debugEnableRunButton = false;

/**
 * @typedef yhDetails
 * @property {string} orderDate
 * @property {string} orderNumber
 * @property {string} billName
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
    /** @type {string} price */
    let price = elPrices[0].innerHTML;
    price = price.replace("円", "");
    price = price.replaceAll(",", "");
    item.price = parseInt(price);
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