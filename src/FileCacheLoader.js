import { isArray, isBlob } from "aomd-utils/src/Type";
import { AEvent } from "./AEvent";

class FileCacheLoader extends AEvent{

  constructor(array, base) {
    super();
    if (!isArray(array)) {
      throw 'array 不是数组';
    }
    // 记录on 事件
    this._event = {
      'progress': [],
      'backBlob': [],
      'error': []
    }

    // 收集资源
    this.filesProgress = {

    }
    this.base = base || ''

    // 文件总大小
    this.num = array.length || 1;

    // file路劲
    this.fileUrl = array;

    // 数据库连接
    this.connect = window.indexedDB.open('hiwebpage');
    // 数据库
    this.db = null


    // 数据库更新
    let that = this;
    this.connect.onupgradeneeded = function (event) {
      // console.log("数据库更新")

      that.db = event.target.result;
      // 判断是否有这个表
      if (!that.db.objectStoreNames.contains('person')) {
        // 创建表
        var objectStore;
        objectStore = that.db.createObjectStore('person', {
          // 主键
          keyPath: 'name'
        });


        // 创建索引
        objectStore.createIndex('blob', 'blob', {
          // 是否唯一
          unique: false
        });
        objectStore.createIndex('name', 'name', {
          // 是否唯一
          unique: true
        });
      }

    };

    this.connect.onsuccess = function (event) {
      // console.log("数据库打开成功")
      that.db = event.target.result

      that.doneBlob(that.fileUrl)
    };

  }

  doneBlob(fileUrl) {
    var that = this;

    for (let urlItem of fileUrl) {
      let key = that.replaceFileName(this.base + urlItem);

      that.readDb(key, (type, blob) => {

        // 成功读取模型
        if (type === 'success') {

          that.filesProgress[key] = 100;
          that._emit('backBlob',{key, blob})
          this.computeTotal();
          // 未读取模型
        } else if (type === 'error') {
          that.xhr(urlItem, (xhr) => {
            that.addDb(key, xhr.target.response)
            that._emit('backBlob',{key, blob:xhr.target.response})


          })
        }
      })


    }
  }
  addDb(name, blob) {
    // 添加
    this.db.transaction(['person'], 'readwrite').objectStore('person').add({
      name: name,
      blob: blob
    })
  }

  readDb(name, cb) {
    // 读取
    var request = this.db.transaction(['person']).objectStore('person').index('name').get(name)

    request.onsuccess = function (e) {
      var result = e.target.result;
      if (result) {
        cb('success', result.blob)
        // result.blob
      } else {
        //  老实http请求
        cb('error', '')
        // console.log('未读取到模型')
      }
    }
  }


  // 发送请求
  xhr(url, cb) {
    let xhr = this.createXHR();
    let that = this;
    // let xhr = new XMLHttpRequest();

    xhr.open('get', url, true)

    xhr.responseType = 'blob'

    xhr.addEventListener('progress', (xhr) => {
      // 统计进度
      that.computeProgress(xhr);
    })
    // 结束操作
    xhr.addEventListener('loadend', (xhr) => {
      if (xhr.target.response.type != 'text/html' && isBlob(xhr.target.response)) {
        cb(xhr)
      } else {
        // 模型加载错误
        that._emit('error',{msg:that.replaceFileName(xhr.target.responseURL) + '加载失败'})
      }
    })
    xhr.send();
  }

  createXHR() {
    var xhr = null;

    if (window.XMLHttpRequest) { //判断当前浏览器是否支持XMLHttpRequest

      xhr = new XMLHttpRequest();

    } else if (window.XMLHttpRequest) { //判断当前浏览器是否支持XMLHttpRequest，这是对于IE浏览器的判断

      try {

        xhr = new ActiveXObject("Msxml2.XMLHTTP"); //IE6及以后的版本支持的

      } catch (e) {

        try {

          xhr = new ActiveXObject('Microsoft.XMLHTTP'); //IE6以下版本的支持

        } catch (e) {
          throw 'xhr 创建失败';
        }

      }

    }

    return xhr;
  }
  replaceFileName(url) {
    return url.replace(/(.*\/)*([^.]+)(.*$)/ig, (url, url2, name, ex) => {
      return name + '-' + ex.slice(1)
    })
  }
  computeTotal() {
    // 计算总进度
    var total = 0;
    for (var i in this.filesProgress) {

      total += this.filesProgress[i]
    }

    // 触发保存的回调函数
    this._emit('progress',{progress:total / this.num})
  }
  // 计算 进度
  computeProgress(xhr) {
    // 去文件名 + 文件大小 做唯一标识
    this.filesProgress[this.replaceFileName(xhr.currentTarget.responseURL)] = (xhr
      .loaded / xhr
        .total * 100);

    this.computeTotal()

  }
  close() {
    this.db.close();
    this.connect.close();
  }
}

export {
  FileCacheLoader
}
