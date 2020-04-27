const api = require('../../utils/apiCloud.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    createDataLot: [],
    joinDatalot: [],
    address: '',
  },
  gotoInfo(e) {
    let lotid = e.detail.lotid;
    let title = e.detail.title;
    wx.navigateTo({
      url: '../details/details?lotid=' + lotid + '&title=' + title,
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    api.lot_myCreate({
      success: function(res) {
        if (res.result.data.length > 0) {
          that.setData({
            createDataLot: res.result.data.reverse()
          })
        }
      }
    })
    api.lot_myJoin({
      success: function(res) {
        if (res.result.list.length > 0) {
          that.setData({
            joinDatalot: res.result.list.reverse()
          })
        }
      }
    })

    that.setData({
      address: getApp().globalData.IPaddress
    })
  },
})