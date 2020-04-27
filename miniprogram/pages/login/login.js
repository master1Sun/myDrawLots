var app = getApp()
Page({
  onGetUserInfo(e) {
    if (e.detail.errMsg == "getUserInfo:ok") {
      app.globalData.userInfo = e.detail.userInfo //获取用户信息给全局
      app.storeuserInfo() //存储用户信息
      wx.navigateBack()
    }
  }
})