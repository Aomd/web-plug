//@ts-check
import { AEvent } from "./AEvent";

class WebDB extends AEvent {
  constructor(option) {
    super();
    this._event = {
      'error': [],
      'get': [],
      'getAll': [],
      'set': [],
      'del': [],
      'clear': [],
      'createObjectStore': [],
      'deleteObjectStore': [],
      'createIndex': [],
      'upgradeneeded': [],
      'close':[]
    }
    if (!indexedDB) {
      throw new Error("indexedDB is not undefined")
    }
    this.option = option
    this.connect = null;
    this.db = null;
    this.objectStore = null;
  }
  init() {
    var _this = this;

    this.connect = indexedDB.open(_this.option?.name || 'hiwebpage', _this.option?.version || 1)
    // 试图打开版本号高于其当前版本的数据库时，将触发该事件
    this.connect.addEventListener('upgradeneeded', function (event) {
      _this._upgradeneeded(event)
    })
    this.connect.addEventListener('blocked', function (event) {

    })

    return new Promise(function (resolve, reject) {
      _this.connect.addEventListener('success', function (event) {
        _this.db = event.target.result;
        resolve(event)
        console.log('success')
      })
      _this.connect.addEventListener('error', function (error) {
        _this._emit('error', {
          type: 'open',
          error
        })
        reject(error);
      })
    });
  }

  /**
   * 创建 IDBObjectStore 请在 upgradeneeded 事件调用
   *
   * @param {*} tableName IDBObjectStore 名称
   * @param {*} option 参数
   * @returns
   * @memberof WebDB
   */
  async createObjectStore(tableName, option) {
    // 判断是否有这个表
    if (!this.db.objectStoreNames.contains(tableName)) {
      this.objectStore = this.db.createObjectStore(tableName, {
        keyPath: '_id',
        autoIncrement: true,
        ...option
      });
    } else {
      throw new Error(`createObjectStore ${tableName} Already exists`)
    }

    return this._returnEntity('createObjectStore', { tableName, option })
  }

  /**
   * 删除 IDBObjectStore 请在 upgradeneeded 事件调用
   *
   * @param {*} tableName IDBObjectStore 名称
   * @returns
   * @memberof WebDB
   */
  async deleteObjectStore(tableName) {
    this.db.deleteObjectStore(tableName);
    return this._returnEntity('deleteObjectStore', { tableName })
  }

  /**
   * 获取 IDBObjectStore 
   *
   * @param {*} tableName IDBObjectStore 名称
   * @param {*} type IDBObjectStore mode
   * @returns
   * @memberof WebDB
   */
  getObjectStore(tableName, type) {
    return this.db.transaction(tableName, type).objectStore(tableName);
  }

  /**
   * 创建 IDBObjectStore index  表列名 请在 upgradeneeded 事件调用
   *
   * @param {*} indexName IDBObjectStore index(表列名) 名称
   * @param {*} option 参数
   * @returns
   * @memberof WebDB
   */
  async createIndex(indexName, option) {
    if (this.objectStore) {
      this.objectStore.createIndex(indexName, indexName, option);
    } else {
      throw new Error(`objectStore is not undefined Please run createobjectstore`)
    }

    return this._returnEntity('createIndex', { indexName, option })
  }

  /**
   * IDBObjectStore 添加
   *
   * @param {*} tableName IDBObjectStore 名称
   * @param {*} entity 参数
   * @returns
   * @memberof WebDB
   */
  set(tableName, entity) {
    var _this = this;
    return new Promise(function (resolve, reject) {
      var request = _this.getObjectStore(tableName, 'readwrite').put(entity, entity?.key);

      request.onsuccess = function (e) {
        resolve(_this._returnEntity('set', { tableName, entity }))
      }

      request.onerror = function (e) {
        reject(e)
      }
    })
  }

  /**
   * IDBObjectStore 获取单个
   *
   * @param {*} tableName IDBObjectStore 名称
   * @param {*} option 参数
   * @returns
   * @memberof WebDB
   */
  get(tableName, option) {
    var _this = this;
    return new Promise(function (resolve, reject) {
      var request = _this.getObjectStore(tableName, 'readonly').index(option?.rowName).get(option?.value)
      request.onsuccess = function (e) {
        resolve(_this._returnEntity('get', { tableName, option }))
      }
      request.onerror = function (e) {
        reject(e)
      }
    })
  }

  /**
   * IDBObjectStore 获取所有
   *
   * @param {*} tableName IDBObjectStore 名称
   * @param {*} option 参数
   * @returns
   * @memberof WebDB
   */
  getAll(tableName, option) {
    var _this = this;
    return new Promise(function (resolve, reject) {
      var request = _this.getObjectStore(tableName, 'readonly').index(option?.rowName).getAll(option?.value, option?.limit)
      request.onsuccess = function (e) {
        resolve(_this._returnEntity('getAll', { entity: e.target.result, tableName, option }))
      }
      request.onerror = function (e) {
        reject(e)
      }
    })
  }

  /**
   * IDBObjectStore index 删除
   *
   * @param {*} tableName IDBObjectStore 名称
   * @param {*} option 参数
   * @returns
   * @memberof WebDB
   */
  del(tableName, option) {
    var _this = this;
    return new Promise(function (resolve, reject) {
      var request = _this.getObjectStore(tableName, 'readwrite').delete(option?.key)
      request.onsuccess = function (e) {
        resolve(_this._returnEntity('del', { entity: e.target.result, tableName, option }))
      }
      request.onerror = function (e) {
        reject(e)
      }
    })

    // return this._returnEntity('del', { tableName, option })
  }



  /**
   * 清楚 指定名称 IDBObjectStore
   *
   * @param {*} tableName IDBObjectStore 名称
   * @returns
   * @memberof WebDB
   */
  async clear(tableName) {
    this.getObjectStore(tableName, 'readwrite').clear()

    return this._returnEntity('clear', { tableName })
  }


  /**
   * 简化 事件和 返回值 
   *
   * @param {*} eventName  事件名称
   * @param {*} value 返回值
   * @returns
   * @memberof WebDB
   */
  _returnEntity(eventName, value) {
    this._emit(eventName, value)
    return {eventName,...value}
  }

  /**
   * upgradeneeded 事件
   *
   * @param {*} event 
   * @returns
   * @memberof WebDB
   */
  _upgradeneeded(event) {
    this.db = event.target.result;
    return this._returnEntity('upgradeneeded', event)
  }

  // 模糊查询
  //   通过cursor和js逻辑来完成模糊搜索：
  // 1. 建立索引，打开对应cursor，进行遍历。
  // 2. 遍历过程中处理匹配逻辑。

  /**
   * 模糊查询
   * 
   * @param {*} tableName IDBObjectStore 名称
   * @param {*} option 参数
   * @returns
   * @memberof WebDB
   */
  async fuzzySearch(tableName, option) {
    var _this = this;
    var list = [];
    return new Promise(function (resolve, reject) {
      var request = _this.getObjectStore(tableName, 'readwrite').openCursor()
      request.onsuccess = function (e) {
        var cursor = e.target.result;
        if (cursor) {

          if (list.length >= option?.limit) {
            resolve(list);
            return;
          }

          var value = cursor.value[option?.rowName] + '';
          if (value.includes(option?.value)) {
            list.push(cursor.value)
          }


          cursor.continue();
        } else {
          resolve(list);
        }
      }
      request.onerror = function (e) {
        reject(e)
      }
    })
  }
  /**
   *
   *
   * @memberof WebDB
   */
  close() {
    this.db.close();
    this.connect = null;
    this.objectStore = null;
    return this._returnEntity('close', {state:true})
  }
}

export {
  WebDB
}