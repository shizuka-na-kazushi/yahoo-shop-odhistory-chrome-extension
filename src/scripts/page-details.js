
function check1() {
  console.log("check1() is called...");
}

/**
 * @typedef yhDetails
 * @property {string} orderDate
 * @property {string} orderNumber
 * @property {yhDetailsOrderItem[]} orderList
 * 
 * @typedef yhDetailsOrderItem
 * @property {string} url
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

  const elDetails = elLists.getElementsByClassName("elDetail");
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

}

/**
 * 
 * @param {Document} d 
 * @returns {yhDetails | null}  null if parsing is failed.
 */
function handleShpMain(d) {

  /**  @type {yhDetails} */
  const details = {orderList:[]};

  const shpMain = d.getElementById("shpMain");
  if (!shpMain) {
    return null;
  }

  handleMdOrderNumber(details, d);
  handleMdOrderItem(details, d);

  return details;
}

function createCheckButton() {
  const d = document;

  const elTitle = d.getElementsByClassName("mdPageTitle");
  if (elTitle && 0 < elTitle.length) {
    const button = d.createElement("button");
    button.innerText = "run";
    button.addEventListener("click", () => {
      handleShpMain(d);
    })

    elTitle.appendChild()
  }
}

function pageMainForDetails() {

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