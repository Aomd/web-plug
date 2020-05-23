/**
 * 粘贴
 *
 * @class Paste
 */
class Paste{
  constructor(option){
    this.event = {
      'html':[],
      'file':[],
      'content':[]
    }
    this.dom  = option && document.getElementById(option.dom) || document.body

    this.dom.addEventListener('onpaste',this._onpaste)
  }
  _onpaste(e){
    debugger
    var e = event || e
    for(var item of e.clipboardData.items){
      if(item.kind == 'string'){
        if(item.type.indexOf('plain') > -1){
          this._getString(item)
        }else if(item.type.indexOf('html') > -1){
          this._getHtml(item)
        }
      }else if(item.kind == 'file'){
        this._getFile(item)
      }
    }
  }
  _getHtml(item){
    var _this = this;
    item.getAsString(function(content){
      for(var fun of _this.event['html']){
        fun(content)
      }
    })
  }
  _getString(item){
    var _this = this;
    item.getAsString(function(content){
      for(var fun of _this.event['content']){
        fun(content)
      }
    })
  }
  _getFile(item){
    var tempFile  = item.getAsFile();

    for(var fun of _this.event['file']){
      fun(tempFile)
    }
  }
  on(name,fun){
    if(name in this.event){
      this.event[name].push(fun)
    }
  }
}