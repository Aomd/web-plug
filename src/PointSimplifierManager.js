//@ts-check
class PointSimplifierManager {

  constructor() {
    this.PointSimplifier = function (o) { };
    // 用来装载 PointSimplifier 实例集合
    this.PointSimplifiers = {

    }
  }

  _load() {
    return new Promise(function (resolve, reject) {
      // 加载 misc/PointSimplifier
      // @ts-ignore
      AMapUI.loadUI(['misc/PointSimplifier'], function (PointSimplifier) {
        if (!PointSimplifier.supportCanvas) {
          reject('当前环境不支持 Canvas！')
        }
        console.info('加载 misc/PointSimplifier')
        resolve(PointSimplifier)
      });
    })
  }
  _init(type,option) {
     var pointSimplifierEntity =  new this.PointSimplifier({
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
        return dataItem.name
      },
      drawShadowPoint:false,
      renderOptions: {
        pointHoverStyle: {
            'strokeStyle': 'rgba(0,0,0,0)',
            'lineWidth': 0,
            'height': 0,
            'width': 0
        },
        //点的样式
        pointStyle: {
            // @ts-ignore
            'content': this.PointSimplifier.Render.Canvas.getImageContent(
              option.imgUrl,
                function onload() {
                  pointSimplifierEntity.renderLater();
                },
                function onerror(e) {
                    console.error(`option.imgUrl:${option.imgUrl} 加载失败！`);
                }),
            //宽度
            'width': 15,
            //高度
            'height': 15,
            //定位点为底部中心
            'offset': ['-50%', '-100%'],
            'fillStyle': null,
            'strokeStyle': null
        },
    },
      ...option
    })

    return pointSimplifierEntity
  }
  /**
   * 创建海量点
   *
   * @param {*} type PointSimplifier 类型
   * @param {*} option 海量点构造参数配置 参考(https://lbs.amap.com/api/amap-ui/reference-amap-ui/mass-data/pointsimplifier)
   * @returns
   * @memberof PointSimplifierManager
   */
  async create(type, option) {
    if (!('imgUrl' in option)){
      throw new Error('option 中 缺少重要参数 imgUrl');
    }

    if ('map' in option) {
      if (this.PointSimplifier.name === 'PointSimplifier') {
        this.PointSimplifiers[type] = this._init(type,option);
        return this.PointSimplifiers[type]
      } else {
        // 加载资源
        this.PointSimplifier = await this._load();
        this.PointSimplifiers[type] = this._init(type,option);
        return this.PointSimplifiers[type]
      }
    }else{
      throw new Error('option 中 缺少重要参数 map');
    }
  }
  /**
   * 添加 海量点 right 事件
   * 前提 PointSimplifier 开启 pointMouseover pointMouseout
   *
   * @param {string} type PointSimplifier 类型
   * @memberof PointSimplifierManager
   */
  addEvent(type) {
    if (type in this.PointSimplifiers) {
      var PointSimplifier = this.PointSimplifiers[type];
      PointSimplifier.on('pointMouseover', function (e, record) {
        this._tempExt = record
      })

      PointSimplifier.on('pointMouseout', function (e, record) {
        this._tempExt = null;
      })
      // 添加伪右键事件
      window.addEventListener('mouseup', function (e) {

        // 有属性 并且点击右键就出发 rightClick
        if (PointSimplifier._tempExt && e.button == 2) {

          // 触发 rightClick 事件
          PointSimplifier.trigger('rightClick', PointSimplifier._tempExt)

        }
      })
    } else {
      throw new Error(`添加类型 PointSimplifier ${type} 未创建`)
    }

  }

  /**
   *销毁 海量点
   *
   * @param {*} type
   * @memberof PointSimplifierManager
   */
  destroy(type){
    if (type in this.PointSimplifiers) {
      this.PointSimplifiers[type].setData([])
      this.PointSimplifiers[type] = null;
      delete this.PointSimplifiers[type];
      // 解绑事件


      
    }else{
      throw new Error(`添加类型 PointSimplifier ${type} 未创建`)
    }
  }
}



export{
  PointSimplifierManager
}
