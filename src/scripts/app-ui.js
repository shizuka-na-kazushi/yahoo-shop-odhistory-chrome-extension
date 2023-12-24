
const idForDialog = "hy-extension-dialog";
const zIndexForDialog = 999;

const getStorage = () => chrome.storage.local;

class UiProgressBar {

  /** @type {Document} */
  doc;

  /** @type {HTMLDivElement} */
  bar;

  /** @type {string} */
  width;

  /**
   * 
   * @param {Document} doc 
   * @param {HTMLElement} parent 
   */
  constructor(doc, parent, width) {
    this.doc = doc;
    this.init(parent, width);
  }

  /**
   * 
   * @param {HTMLElement} parent 
   */
  init(parent, width) {
    // bar-body
    const barBody = this.doc.createElement("div");
    const barBodyStyle = `
      position: relative;
      width: ${width};
      height: 8px;
      background-color: #EEF5FF;
    `;
    barBody.setAttribute("style", barBodyStyle);

    // bar
    this.bar = this.doc.createElement("div");
    const barStyle = `
      position: absolute;
      width: 0%;height: 
      100%;background-color: #9EB8D9;
    `;

    this.bar.setAttribute("style", barStyle);
    barBody.appendChild(this.bar);

    parent.appendChild(barBody);
  }

  /**
   * 
   * @param {num} percent (0-100)
   */
  setProgress(percent) {
    if (percent <= 0)
      percent = 0;
    if (100 <= percent)
      percent = 100;

    this.bar.style.width = percent + "%";
  }
}

class UiButton {
  /** @type {HTMLButtonElement} */
  el;

  /**
   * 
   * @param {Document} doc 
   * @param {HTMLElement} parent 
   * @param {string} text 
   */
  constructor(doc, parent, text) {
    this.el = doc.createElement("button");
    this.el.setAttribute("style", `
      margin: 10px 10px 10px 10px;
    `);
    this.el.innerText = text;
    parent.appendChild(this.el);
  }

  setEnable(enable) {
    this.el.disabled = enable ? null : "disabled";
  }
}

class UiText {
  /** @type {HTMLButtonElement} */
  el;

  /**
   * 
   * @param {Document} doc 
   * @param {HTMLElement} parent 
   * @param {string} text 
   */
  constructor(doc, parent, text) {
    this.el = doc.createElement("div");
    this.el.setAttribute("style", `
      margin: 20px 0 0 0;
      padding: 0 10px 0 10px;
      width: 100%;
      height: 30px;
      color: white;
    `);
    this.el.innerText = text;
    parent.appendChild(this.el);
  }

  setText(str) {
    this.el.innerText = str;
  }
}

class UiLoadingIcon {
  /** @type {HTMLDivElement} */
  el;

  constructor(doc, parent) {
    this.el = doc.createElement("div");
    this.el.setAttribute("style", `
      width: 8%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      visibility: hidden;
    `);
    parent.appendChild(this.el);

    this.initKeyframe(doc);
    this.initBubble(doc, "0s");
    this.initBubble(doc, ".2s");
    this.initBubble(doc, ".4s");
  }

  initBubble(doc, param) {
    let bubble = doc.createElement("div");
    bubble.setAttribute("style", `
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #9EB8D9;
      animation: yhx-pulse .4s ease ${param} infinite alternate;
    `);
    this.el.appendChild(bubble);
  }

  initKeyframe(doc) {
    const keyframes = `@keyframes yhx-pulse {
      from {
        opacity: 1;
        transform: scale(1);
      }
      to {
        opacity: .25;
        transform: scale(.75);
      }
    }`;

    // const blob = new Blob([keyframes], { type: 'text/css' });
    // const url = URL.createObjectURL(blob);
    // const style = document.createElement("style");
    // style.href = url;
    // doc.head.appendChild(style);

    const style = document.createElement("style");
    style.type = "text/css";
    style.appendChild(document.createTextNode(keyframes));
    doc.head.appendChild(style);
  }

  /**
   * 
   * @param {boolean} enable 
   */
  setEnable(enable) {
    this.el.style.visibility = enable ? "visible" : "hidden";
  }
}

class UiCheckBox {
  /** @type {HTMLLabelElement} */
  label;
  /** @type {HTMLInputElement} */
  el;

  constructor(doc, el, label) {
    this.label = label;
    this.el = el;
  }

  /**
   * 
   * @param {boolean} checked 
   */
  setCheck(checked) {
    this.el.checked = checked;
  }

  /**
   * @return {boolean}
   */
  getCheck() {
    return this.el.checked;
  }

  /**
   * @param {boolean} disabled
   */
  setDisabled(disabled) {
    this.el.disabled = disabled;
    this.label.style.color = disabled ? "gray" : "white";
  }
}

class UiPreference {

  /** @type {Document} */
  doc;

  /** @type {HTMLFormElement} */
  form;

  /** @type {UiCheckBox} */
  checkboxPostage;

  /** @type {"per-order" | "per-product"} */
  type = "per-product"

  /**
   * 
   * @param {*} doc 
   * @param {*} parent 
   * @param {*} prefix 
   * @param { [{label: string}] } options 
   */
  constructor(doc, parent) {
    this.doc = doc;

    const strHtml = `
    <form id="pref_options_form" >
      <div style="width: auto; margin: 0 16px 0 16px;" >
        <input type="radio" id="ysox_radio_1" value="ysox_radio_1" name="pref_options" />
        <label for="ysox_radio_1" style="color:white"> 「購入品目」優先: (購入品目ごとに行を出力) </label>

        <br />
        <div style="width: auto; margin: 0 16px 2px 16px" >
          <input type="checkbox" id="ysox_output_postage" name="ysox_output_postage" value="ysox_output_postage">
          <label for="ysox_output_postage" style="color:white"> 「送料」を行として出力する</label>
        </div>

        <br />
      
        <input type="radio" id="ysox_radio_2" value="ysox_radio_2" name="pref_options"/>
        <label for="ysox_radio_2" style="color:white"> 「合計金額(税込)」優先: (決済ごとに行を出力) </label>

      </div>
    </form>
    `;

    const el = doc.createElement("div");
    el.innerHTML = strHtml;
    parent.appendChild(el);

    this._setupCheckbox(doc);
    this._setupForm(doc);
    this._restorePreference(() => { this._updateUi() });
  }

  /**
   * 
   * @param {Document} doc 
   */
  _setupCheckbox(doc) {
    const elCheckbox = doc.getElementById("ysox_output_postage");
    const elLabel = doc.querySelector('label[for="ysox_output_postage"]');

    this.checkboxPostage = new UiCheckBox(doc, elCheckbox, elLabel);
  }

  /**
   * 
   * @param {Document} doc 
   */
  _setupForm(doc) {
    this.form = doc.getElementById("pref_options_form");
    this.form.addEventListener("change", () => {
      const selectedOption = this.form.querySelector(`input[name="pref_options"]:checked`);
      if (selectedOption.id == "ysox_radio_1") {
        // alert("ysox_radio_1 was selected");
        this.type = "per-product";
        this.checkboxPostage.setDisabled(false);
      } else {
        this.type = "per-order";
        this.checkboxPostage.setDisabled(true);
      }
    })
  }

  /**
   * 
   */
  _updateUi() {
    const doc = this.doc;
    if (this.type === "per-product") {
      doc.getElementById("ysox_radio_1").checked = true;
      this.checkboxPostage.setDisabled(false);
    } else if (this.type === "per-order") {
      doc.getElementById("ysox_radio_2").checked = true;
      this.checkboxPostage.setDisabled(true);
    }
  }

  /**
   * 
   * @param {boolean} disabled 
   */
  setDisabled(disabled) {
    const doc = this.doc;
    doc.getElementById("ysox_radio_1").disabled = disabled;
    doc.getElementById("ysox_radio_2").disabled = disabled;
    doc.querySelector('label[for="ysox_radio_1"]').style.color = disabled ? "gray" : "white";
    doc.querySelector('label[for="ysox_radio_2"]').style.color = disabled ? "gray" : "white";
    if (disabled) {
      this.checkboxPostage.setDisabled(true);
    } else {
      this._updateUi();
    }
  }

  /**
   * 
   */
  storePreference() {
    try {
      const storage = getStorage();
      storage.set({
        preference: {
          type: this.type,
          checkPostage: this.checkboxPostage.getCheck(),
        }
      })
    } catch (e) {
      console.warn("storePreference: " + e);
    }
  }

  _restorePreference(callback) {
    try {
      const storage = getStorage();
      storage.get(["preference"]).then((value) => {
        if (value.preference) {
          this.type = value.preference.type;
          this.checkboxPostage.setCheck(value.preference.checkPostage);
        }
        callback();
      })
    } catch (e) {
      console.warn("_restorePreference: " + e);
      callback();
    }
  }

}

class UiDialog {

  /** @type {Document} */
  doc;
  /** @type {HTMLElement} */
  parent;
  /** @type {HTMLDivElement} */
  el;
  /** @type {HTMLDivElement} */
  dimmer;
  /** @type {HTMLDivElement} */
  controlPanel;

  /** @type {UiProgressBar} */
  progressBar;

  /** @type {UiLoadingIcon} */
  loading;

  /** @type {UiText} */
  message;

  /** @type {UiPreference} */
  preference;

  /** @type {UiButton} */
  startButton;
  /** @type {UiButton} */
  cancelButton;

  /** @type {UiButton} */
  buttonTestUp;
  /** @type {UiButton} */
  buttonTestDown;
  /** @type {number} */
  testProgress = 0;

  /** @type {string} */
  defaultMessage = "[開始]ボタンを押すと、CSVファイルの作成を開始します。";

  /** @type {() => void | null} */
  onClose = null;

  /**
   * 
   * @param {Document} doc
   * @param {HTMLElement} parent
   */
  constructor(doc, parent) {
    this.doc = doc;
    this.parent = parent;
    this.init();
  }

  createDimmer() {
    this.dimmer = this.doc.createElement("div");
    this.dimmer.setAttribute("style", `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5); 
      z-index: ${zIndexForDialog - 1};
      display:none;
    `);
    this.parent.appendChild(this.dimmer);
    this.dimmer.addEventListener("click", (e) => {
      e.preventDefault();
      this.close()
    });
  }

  createDialogBody() {
    this.el = this.doc.createElement("div");
    this.el.setAttribute("style", `
      width: 450px;
      height: 240px;
      z-index: ${zIndexForDialog}; 
      position:fixed;
      top: 50%; 
      left: 50%;
      transform: translate(-50%, -50%); 
      background: #333;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
      border-radius: 3px;
      padding: 10px;
      display: none;
    `);
    this.el.id = idForDialog;
    this.parent.appendChild(this.el);
    this.el.addEventListener("click", () => { });
  }

  createControlPanel() {
    this.controlPanel = this.doc.createElement("div");
    this.controlPanel.setAttribute("style", `
    z-index: ${zIndexForDialog}; 
    display:flex; 
    justify-content: center; 
  `);
    this.el.appendChild(this.controlPanel);

    this.startButton = new UiButton(this.doc, this.controlPanel, "開始");
    this.startButton.el.addEventListener("click", () => {
      this.loading.setEnable(true);
      this.startButton.setEnable(false);
      this.preference.setDisabled(true);
      this.preference.storePreference();
    });

    this.cancelButton = new UiButton(this.doc, this.controlPanel, "キャンセル");
    this.cancelButton.el.addEventListener("click", () => { this.close(); });

    // this.testButtonInit();
  }

  testButtonInit() {
    this.buttonTestDown = new UiButton(this.doc, this.controlPanel, "Down");
    this.buttonTestDown.el.addEventListener("click", () => {
      this.testProgress -= 5;
      this.progressBar.setProgress(this.testProgress);
      this.message.setText(`progress: ${this.testProgress}`);
    })

    this.buttonTestUp = new UiButton(this.doc, this.controlPanel, "Up");
    this.buttonTestUp.el.addEventListener("click", () => {
      this.testProgress += 5;
      this.progressBar.setProgress(this.testProgress);
      this.message.setText(`progress: ${this.testProgress}`);
    })
  }

  createLoadingIcon() {
    let div = this.doc.createElement("div");
    div.setAttribute("style", `
      display: flex;
      justify-content: center;
      width: 100%;
      margin: 15px 0 15px 0;
    `);
    this.el.appendChild(div);

    this.loading = new UiLoadingIcon(this.doc, div);
  }

  init() {
    this.createDimmer();
    this.createDialogBody();
    this.progressBar = new UiProgressBar(this.doc, this.el, "100%");

    this.message = new UiText(this.doc, this.el, this.defaultMessage);

    this.preference = new UiPreference(this.doc, this.el);
    
    this.createLoadingIcon();
    this.createControlPanel();
  }

  close() {
    this.el.style.display = "none";
    this.dimmer.style.display = "none";
    this.onClose && this.onClose();
    this.loading.setEnable(false);
    this.startButton.setEnable(true);
    this.preference.setDisabled(false);
  }

  show() {
    this.message.setText(this.defaultMessage);
    this.progressBar.setProgress(0);
    this.dimmer.style.display = "block";
    this.el.style.display = "block";
  }
}