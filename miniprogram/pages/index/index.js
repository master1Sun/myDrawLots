const api = require('../../utils/apiCloud.js');
const networkSpeed = require('/networkSpeed.js');
// 在页面中定义插屏广告
let interstitialAd = null
let netList = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: true,
    isLots: false,
    titleName: '',
    joinNrmber: 3,
    selectNumber: 1,
    step: 1,
    min: 0,
    max: 999,
    lotid: '',
    textInfo1: '玩法介绍：\n抽签会在1~最大数字之间随机抓取一个数。\n如果最大数字是10，\n那么在这个规则中，总共有10次抓阄机会，每次从【1-10】之间随机抓取一个数字。\n设定一个或者多个抽中号码，抽中者会有提示~~\n亲~记得右上角收藏哦',
    textInfo2: '测试规则：\n点击网络测速，\n测试工具会获取当前网络速度，\n等待测试结束，\n就可以查询当前网络速度~~\n亲~记得右上角收藏哦',
    loading: false,
    disabled: false,
    networkContent: '0KB/s',
    startProgress: '0ms',
    broadband: 0,
    networkList: []
  },
  inputValue(e) {
    let v = e.currentTarget.dataset.type;
    let value = e.detail.value
    if (v == 'join') {
      if (value < this.data.min) {
        value = this.data.min
      } else if (value > this.data.max) {
        value = this.data.max
      }
      if (parseInt(value) < this.data.selectNumber) {
        this.setData({
          joinNrmber: this.data.selectNumber
        })
        return
      }
      if (value < this.data.min || value > this.data.max) {
        return
      }
      this.setData({
        joinNrmber: value
      })
    } else if (v == 'select') {
      if (value < this.data.min) {
        value = this.data.min
      } else if (value > this.data.max) {
        value = this.data.max
      }
      if (parseInt(value) > this.data.joinNrmber) {
        this.setData({
          selectNumber: this.data.joinNrmber
        })
        return
      }
      if (value < this.data.min || value > this.data.max) {
        return
      }
      this.setData({
        selectNumber: value
      })
    } else {
      this.setData({
        titleName: value
      })
    }
  },
  handleChange(value, type, v) {
    if (v == 'join') {
      if (parseInt(value) < this.data.selectNumber) {
        return
      }
      this.setData({
        joinNrmber: value
      })
    } else {
      if (parseInt(value) > this.data.joinNrmber) {
        return
      }
      this.setData({
        selectNumber: value
      })
    }
  },
  getScale() {
    let scale = 1;
    //浮点型
    if (this.data.step != parseInt(this.data.step)) {
      scale = Math.pow(10, (this.data.step + '').split('.')[1].length)
    }
    return scale;
  },
  calcNum: function(type, v) {
    const scale = this.getScale()
    let num = 1;
    if (v == 'join') {
      num = this.data.joinNrmber * scale
    } else {
      num = this.data.selectNumber * scale
    }
    let step = this.data.step * scale
    if (type === 'reduce') {
      num -= step
    } else if (type === 'plus') {
      num += step
    }
    let value = num / scale
    if (type === "plus" && value < this.data.min) {
      value = this.data.min
    } else if (type === "reduce" && value > this.data.max) {
      value = this.data.max
    }
    if (value <= this.data.min || value > this.data.max) {
      return
    }

    this.handleChange(value, type, v)
  },
  plus: function(e) {
    wx.vibrateShort() //短暂震动
    let v = e.currentTarget.dataset.type;
    this.calcNum("plus", v)
  },
  reduce: function(e) {
    wx.vibrateShort() //短暂震动
    let v = e.currentTarget.dataset.type;
    this.calcNum("reduce", v)
  },
  create() {
    wx.vibrateShort() //短暂震动
    var that = this;
    that.islogin(function() {
      if (that.data.titleName == '') {
        wx.showModal({
          title: '警告!',
          content: '主题名称必需填写',
          confirmColor: "#5677FC",
          showCancel: false
        })
      } else if (that.data.joinNrmber == 0) {
        wx.showModal({
          title: '警告!',
          content: '参与人数必须大于零',
          confirmColor: "#5677FC",
          showCancel: false
        })
      } else {
        wx.showLoading({
          title: '创建中...',
        })
        that.setData({
          lotid: new Date().getTime().toString() + parseInt(Math.random() * 10000000) //创建时间+随机数
        })
        api.lot_create({
          data: {
            lotid: that.data.lotid,
            title: that.data.titleName,
            joinNrmber: that.data.joinNrmber,
            selectNumber: that.data.selectNumber
          },
          success: function(res) {
            wx.hideLoading();
            wx.navigateTo({
              url: '../details/details?lotid=' + that.data.lotid,
            })
          }
        })
      }
    })
  },
  onAvatarTap() {
    this.islogin();
  },
  islogin(ca) {
    let that = this;
    wx.getUserInfo({
      success: (r) => {
        if (ca) {
          ca(r)
        }
      },
      fail: () => {
        wx.showModal({
          title: '提示!',
          content: '您还没有登录请先登录哦~',
          confirmColor: "#5677FC",
          showCancel: false,
          success: () => {
            wx.navigateTo({
              url: '../login/login',
            })
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    let data = new Date();
    let todayDate = data.getFullYear() + '' + (data.getMonth() + 1) + '' + data.getDate();
    let getDate = wx.getStorageSync('indexDate')
    if (getDate.todayDate == todayDate) {
      that.setData({
        isLots: getDate.data.isLots,
        notice: getDate.data.notice,
        textInfo1: getDate.data.textInfo1 || that.data.textInfo1,
        textInfo2: getDate.data.textInfo2 || that.data.textInfo2
      })
    } else {
      wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'config',
        success: res => {
          let data = new Date();
          let todayDate = data.getFullYear() + '' + (data.getMonth() + 1) + '' + data.getDate();
          wx.setStorageSync('indexDate', {
            todayDate,
            data: res.result
          })
          that.setData({
            isLots: res.result.isLots,
            notice: res.result.notice,
            textInfo1: res.result.textInfo1 || that.data.textInfo1,
            textInfo2: res.result.textInfo2 || that.data.textInfo2
          })
          that.loadingADD()
        }
      })
    }
  },
  loadingADD() {
    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-d8243cea97d9d65d'
      })
      interstitialAd.onLoad(() => {})
      interstitialAd.onError((err) => {})
      interstitialAd.onClose(() => {})
    }

    // 在适合的场景显示插屏广告
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error(err)
      })
    }

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  startSearch() {
    wx.vibrateShort() //短暂震动
    var that = this;
    netList = [];
    that.networkCallback({
      speed: 0,
      networkMillisecond: 0,
      networkContent: '0KM/s',
      networkList: [],
      startProgress: '0ms'
    })

    // 开始网络监测
    networkSpeed.startNetwork({
      self: that
    });
    // 网络监测回调
    networkSpeed.networkCallback = that.networkCallback;

    that.setData({
      loading: true,
      disabled: true
    })
  }, // 网络监测回调
  networkCallback: function(options) {
    var _this = this;
    netList.push({
      networkMillisecond: options.networkMillisecond,
      networkContent: "下载带宽" + options.networkContent,
      startProgress: ">>耗时" + options.startProgress
    })

    _this.setData({
      networkList: netList.reverse()
    })
    if (options.status == 1) {
      netList.push({
        speed: options.speed,
        networkMillisecond: options.networkMillisecond,
        networkContent: '结束测试',
        startProgress: ''
      })
      var kdsl = Math.round(options.networkContent_count * 8)
      if (kdsl <= 1) {
        kdsl = 1
      }
      _this.setData({
        startProgress: options.startProgress,
        networkList: netList.reverse(),
        networkContent: options.networkContent,
        broadband: kdsl,
        loading: false,
        disabled: false
      })
    }
  },
})