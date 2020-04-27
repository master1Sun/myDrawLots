const api = require('utils/apiCloud.js');
App({
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'mybase',
        traceUser: true,
      })
    }
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function(res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function() {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经上线啦~，为了获得更好的体验，建议立即更新',
              showCancel: false,
              confirmColor: "#5677FC",
              success: function(res) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
              }
            })
          })
          updateManager.onUpdateFailed(function() {
            // 新的版本下载失败
            wx.showModal({
              title: '更新失败',
              content: '新版本更新失败，为了获得更好的体验，请您删除当前小程序，重新搜索打开',
              confirmColor: "#5677FC",
              showCancel: false
            })
          })
        }
      })
    } else {
      // 当前微信版本过低，无法使用该功能
    }
    this.globalData = {}
    this.login();
    this.getIP();
  },
  login: function() {
    const that = this;
    wx.login({
      success(res) {
        that.getUserInfo(); //用户授权，并存储用户信息
      }
    })
  },
  getUserInfo: function(cb) {
    const that = this;
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: (res) => {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
          let data = new Date();
          let todayDate = data.getFullYear() + '' + (data.getMonth() + 1) + '' + data.getDate();
          let storageday = wx.getStorageSync('loginDate')
          if (todayDate != storageday) {
            that.storeuserInfo(); //更新用户信息
          }
        },
        fail: () => {
          that.getAuthorize();
        }
      })
    }
  },
  storeuserInfo: function() { //将登陆的用户详情信息存储到数据库
    let userInfo = this.globalData.userInfo;
    api.addUser({
      data: {
        avatarUrl: userInfo.avatarUrl, //用户信息：图像
        city: userInfo.city, //用户信息：所在城市
        gender: userInfo.gender, //用户信息：性别。0:未知，1：男，2：女
        language: userInfo.language, //用户信息：语言
        nickName: userInfo.nickName, //用户信息：姓名
        province: userInfo.province, //用户信息：省份
      },
      success: (res) => {
        let data = new Date();
        let todayDate = data.getFullYear() + '' + (data.getMonth() + 1) + '' + data.getDate();
        wx.setStorageSync('loginDate', todayDate)
      }
    })
  },
  getIP() {
    var that = this;
    wx.request({
      url: 'https://pv.sohu.com/cityjson?ie=utf-8',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (e) {
        var aaa = e.data.split(' ');
        var bbb = aaa[4].replace('"', '').replace('"', '').replace(',', '')
        var ccc = aaa[8].replace('"', '').replace('"', '').replace(',', '').replace('};', '')
        var ddd = aaa[6].replace('"', '').replace('"', '').replace(',', '').replace('};', '')
        that.globalData.IPaddress = ccc;
      },
      fail: function () {
        // fail
      }
    })
  },
})