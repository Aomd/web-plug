//@ts-check
class PointSimplifierManager {

  constructor() {
    this.PointSimplifier = function (o) { };
    this.pointSimplifierEntity = function () { }
    this._rightClick = function () { }
  }

  /**
   * Promise 加载 misc/PointSimplifier
   *
   * @returns
   * @memberof PointSimplifierManager
   */
  load() {
    var _this = this;
    return new Promise(function (resolve, reject) {
      // 加载 misc/PointSimplifier
      // @ts-ignore
      AMapUI.loadUI(['misc/PointSimplifier'], function (PointSimplifier) {
        if (!PointSimplifier.supportCanvas) {
          reject('当前环境不支持 Canvas！')
        }
        console.info('加载 misc/PointSimplifier')
        _this.PointSimplifier = PointSimplifier
        resolve(PointSimplifier)
      });

    })
  }
  _init(option) {
    var pointSimplifierEntity = new this.PointSimplifier({
      compareDataItem: function (a, b, aIndex, bIndex) {
        //数据源中靠后的元素优先，index大的排到前面去
        return aIndex > bIndex ? -1 : 1;
      },
      getPosition: function (dataItem) {
        //返回数据项的经纬度，AMap.LngLat实例或者经纬度数组
        // return dataItem.position;
        return [dataItem.longitude, dataItem.latitude]
      },
      getHoverTitle: function (dataItem, idx) {
        return dataItem.name || idx
      },
      renderOptions,
      ...option
    })

    //  模拟海量点右键
    // 添加 海量点 right 事件
    // 前提 PointSimplifier 开启 pointMouseover pointMouseout
    pointSimplifierEntity.on('pointMouseover', function (e, record) {
      this._tempExt = record
    })

    pointSimplifierEntity.on('pointMouseout', function (e, record) {
      this._tempExt = null;
    })
    this._rightClick = function (e) {
      // 有属性 并且点击右键就出发 rightClick
      if (pointSimplifierEntity._tempExt && e.button == 2) {
        // 触发 rightClick 事件
        pointSimplifierEntity.trigger('rightClick', pointSimplifierEntity._tempExt)
      }
    }
    window.addEventListener('mouseup', this._rightClick)

    this.pointSimplifierEntity = pointSimplifierEntity

    return pointSimplifierEntity
  }
  /**
   * 创建海量点
   *
   * @param {*} option 海量点构造参数配置 参考(https://lbs.amap.com/api/amap-ui/reference-amap-ui/mass-data/pointsimplifier)
   * @returns
   * @memberof PointSimplifierManager
   */
  async create(option) {
    if ('map' in option) {
      // 判断是否需要重新加载
      if (this.PointSimplifier.name === 'PointSimplifier') {
        return this._init(option);
      } else {
        // 加载资源
        try {
          this.PointSimplifier = await this.load();
          return this._init(option);
        } catch (error) {
          throw new Error(error);
        }
      }
    } else {
      throw new Error('option 中 缺少重要参数 map');
    }
  }


  /**
   *销毁 海量点
   *
   * @param {*} type
   * @memberof PointSimplifierManager
   */
  destroy(type) {
    window.removeEventListener('mouseup', this._rightClick)
    this.pointSimplifierEntity = null;
    this.PointSimplifier = null;
  }
}

var renderOptions = {
  // 关闭四叉树计算密度红
  topNAreaStyle: {
    content: 'none',
  },
  //点的样式
  pointStyle: {
    width: 15,
    height: 15,
    fillStyle: '#A2D0FA'
  },
  // 清除外边框
  pointHoverStyle: {
    content: 'none',
    width: 0,
    height: 0,
  },
  //鼠标hover时的title信息
  hoverTitleStyle: {
    position: 'top',
    offset: [0, '-50%']
  }
}

export {
  PointSimplifierManager,
  renderOptions
}
