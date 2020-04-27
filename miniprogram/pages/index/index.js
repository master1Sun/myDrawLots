const api = require('../../utils/apiCloud.js');
// 在页面中定义插屏广告
let interstitialAd = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLots: false,
    titleName: '',
    joinNrmber: 3,
    selectNumber: 1,
    step: 1,
    min: 0,
    max: 999,
    lotid: '',
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
          content: '抓阄标题必需填写',
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
        notice: getDate.data.notice
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
            notice: res.result.notice
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
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})