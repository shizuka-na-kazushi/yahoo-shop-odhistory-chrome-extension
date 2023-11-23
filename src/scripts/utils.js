
/**
 * getFirstChildOfClassElement
 * @param {HTMLElement} searchElement 
 * @param {string} className 
 * @returns 
 */
function getFirstChildOfClassElement(searchElement, className) {
  const elm = searchElement.getElementsByClassName(className);
  for (let j = 0; j < elm.length; j++) {
    if (!elm[j].children || elm[j].children.length <= 0)
      return null;

    return elm[j].children[0];
  }
  return null;
}

/**
 * @typedef yhAnchorInfo
 * @property {string} url
 * @property {string} title
 */

/**
 * 
 * @param {HTMLAnchorElement} anchor 
 */
function getAnchorInfo(anchor) {
  
  /** @type {yhAnchorInfo} */
  let info = {url: "", title: ""};
  
  if (!anchor) {
    return info;
  }

  if (anchor.hasAttributes()) {
    for (let attr of anchor.attributes) {
      if (attr.name == "href") {
        info.url = attr.value;
      }
    }
  }
  // title <a><span> title </span></a>
  if (anchor.children && 0 < anchor.children.length) {
    info.title = anchor.children[0].innerHTML;
  }

  return info;
}

/**
 * @typedef yhInputInfo
 * @property {string} name
 * @property {string} value
 */
/**
 * 
 * @param {HTMLFormElement} form 
 * @returns {yhInputInfo[]}
 */
function getInputInfos(form) {
  const elInputs = form.getElementsByTagName("input");
  if (!elInputs) {
    return[];
  }
 
  /** @type {yhInputInfo[]} */
  let ret = [];
  for (let i = 0; i < elInputs.length; i++) {
    /** @type {HTMLInputElement} */
    const input = elInputs[i];
    ret.push({value: input.value, name: input.name});
  }

  return ret;
}