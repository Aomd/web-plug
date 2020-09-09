import { AEvent } from "./AEvent";

/**
 * 粘贴
 *
 * @class Paste
 */
class Paste extends AEvent {
  constructor(option) {
    super();
    this._event = {
      'html': [],
      'file': [],
      'content': []
    }
    this.dom = option && document.getElementById(option.dom) || document.body

    this.dom.addEventListener('onpaste', this._onpaste)
  }
  _onpaste(e) {
    var e = event || e
    for (var item of e.clipboardData.items) {
      if (item.kind == 'string') {
        if (item.type.indexOf('plain') > -1) {
          this._getString(item)
        } else if (item.type.indexOf('html') > -1) {
          this._getHtml(item)
        }
      } else if (item.kind == 'file') {
        this._getFile(item)
      }
    }
  }
  _getHtml(item) {
    var _this = this;
    item.getAsString(function (content) {
      _this._emit('html', content);
    })
  }
  _getString(item) {
    var _this = this;
    item.getAsString(function (content) {
      _this._emit('content', content);

    })
  }
  _getFile(item) {
    var tempFile = item.getAsFile();
    this._emit('file', tempFile);
  }
}