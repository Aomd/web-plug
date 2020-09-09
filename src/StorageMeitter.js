// 唯一值
const KEY = '@storage-emitter-key';

/**
 * 浏览器同域跨页面传值
 *
 * @class StorageMeitter
 */
class StorageMeitter {
  constructor() {
    var _this = this;

    this.event = {}

    window.addEventListener('storage', function (ev) {
      var e = ev || this.event;
      // only key
      if (e.key !== KEY) {
        return
      }
      // removeItem
      if (!e.newValue) {
        return
      }
      try {
        const cmd = JSON.parse(e.newValue)

        // 循环收集到的事件
        for (var fun of _this.event[cmd.event]) {
          fun(cmd.args, { url: e.url });
        }

      } catch (err) {
        console.error('unexpected value: ' + err.newValue)
      }
    });
  }
  /**
   * 监听事件
   *
   * @param {*} event 事件名称
   * @param {*} fun 回调函数
   * @memberof StorageMeitter
   */
  on(event, fun) {
    if (event in this.event) {
      this.event[event].push(fun);
    } else {
      this.event[event] = [];
      this.event[event].push(fun);
    }
  }

  /**
   * 触发事件
   *
   * @param {*} event 事件名称
   * @param {*} args 参数
   * @memberof StorageMeitter
   */
  emit(event, args) {

    const cmd = JSON.stringify({ event, args })

    localStorage.setItem(KEY, cmd)
    localStorage.removeItem(KEY)

  }
}

export {
  StorageMeitter
}