const api = require('../../utils/apiCloud.js');
const app = getApp()
// 在页面中定义插屏广告
let interstitialAd = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    show: true,
    win: '',
    desc: '',
    lotid: '',
  },

  onNewJournalBookTap: function() {
    var that = this;
    that.islogin(function() {
      that.getZhuaqu();
      that.setData({
        style: 'transform: rotateY(180deg);',
        show: false
      })
    })
  },
  onSubmitButtonTap: function() {
    var that = this;
    that.islogin(function() {
      that.setData({
        style: 'transform: rotateY(180deg);',
        show: false
      })
    })
  },
  onReturnButtonTap: function() {
    this.setData({
      style: '',
      show: true
    })
  },
  onHome() {
    wx.switchTab({
      url: '../index/index',
    })
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
    wx.hideShareMenu()
    this.setData({
      lotid: options.lotid,
      title: options.title
    })
    this.loadData()

    if (Math.round(Math.random() * 2) == 1) {
      this.loadingADD()
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
  loadData() {
    wx.showLoading({
      title: '加载中...',
    })
    let that = this;
    api.lot_getLottask({
      data: {
        lotid: that.data.lotid,
      },
      success: function(res) {
        wx.hideLoading();
        var data0 = res.result.data[0]
        let joinNrmber = data0.joinNrmber
        let drawnumber = data0.drawnumber.length
        let winnumber = data0.winnumber.length
        let count = 0;
        data0.drawnumber.forEach(function(v) {
          let l = that.getcolor(data0, v)
          if (l) {
            count++;
          }
        })
        let t = drawnumber + '/' + joinNrmber + '张卡片，' + count + '/' + winnumber + '个幸运儿被选中'
        that.setData({
          baseData: data0,
          title: data0.title,
          desc: t,
        })
        if (data0.drawnumber.length >= Number(data0.lotnumber)) {
          that.setData({
            style: 'transform: rotateY(180deg);',
            show: false
          })
        }
        that.getZhongjiangNumber()
      }
    })
  },
  getcolor: function(data, number) {
    var color = false;
    if (data.winnumber.length > 0) {
      data.winnumber.forEach(function(v) {
        if (v == number) {
          color = true;
        }
      })
    }
    return color
  },
  getZhongjiangNumber() {
    let that = this;
    api.lot_getLotNumber({
      data: {
        lotid: that.data.lotid,
      },
      success: function(res) {
        if (res.result.data.length > 0) {
          var data1 = res.result.data[0]
          let l = that.getcolor(that.data.baseData, data1.number) ? '恭喜抓中啦' : '你未被抓中'
          that.setData({
            win: l,
            style: 'transform: rotateY(180deg);',
            show: false
          })
        }
      }
    })
    that.getTaskJoiner()
  },
  getTaskJoiner() {
    let that = this;
    api.lot_getTaskJoiner({
      data: {
        lotid: that.data.lotid,
      },
      success: function(res) {
        if (res.result.list.length > 0) {
          var data2 = res.result.list
          that.setData({
            joinerData: data2
          })
        }
      }
    })
  },
  getZhuaqu() {
    let that = this;
    api.lot_storelotOne({
      data: {
        lotid: that.data.lotid,
      },
      success: function(res) {
        if (res.result != -1) {
          var data1 = res.result
          let l = that.getcolor(that.data.baseData, data1) ? '恭喜抓中啦' : '你未被抓中'
          that.setData({
            win: l,
            style: 'transform: rotateY(180deg);',
            show: false
          })
          that.getTaskJoiner()
          that.loadData()
        } else {
          that.setData({
            win: '',
            style: 'transform: rotateY(180deg);',
            show: false
          })
          that.getTaskJoiner()
        }
      }
    })
  },
  onShareAppMessage: function(res) {
    var that = this;
    return {
      title: that.data.baseData.title,
      path: 'pages/details/details?lotid=' + that.data.lotid + '&title=' + that.data.baseData.title,
    }
  },
  onShow() {
    this.islogin()
  },
})