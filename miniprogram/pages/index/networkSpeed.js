// 下载事件
var downloadTask
// 下载开始时间
var start
// 下载结束时间 
var end
// 重复下载
var networkTimeOut
// 当前是否有网络连接
var networkConnected
var networktype
var nototalBytesWritten = 0
var startProgress = 0;
var timeout;
//文件大小
var fileSize = 0;
var networkSpeed = {
  // 开始
  startNetwork: function(options) {
    var self = this;
    networkTimeOut = setTimeout(() => {
      self.network(options);
    }, 1000);
    wx.getNetworkType({
      success: function(res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        console.log('返回网络类型, 有效值：', res.networkType)
        if (res.networkType != 'none') {
          // 当前是否有网络连接
          networkConnected = true;
          networktype = res.networkType
        }
      }
    })
    wx.onNetworkStatusChange(function(res) {
      console.log('当前是否有网络连接', res.isConnected)
      console.log(res.networkType)
      // 当前是否有网络连接
      networkConnected = res.isConnected;
    })
  },

  // 下载
  network: function(options) {
    var self = this;
    start = new Date().getTime()
    startProgress = start;
    if (!networkConnected) {
      self.networkCallback({
        speed: 0,
        networkMillisecond: "-",
        networkContent: '没有网络'
      })
      wx.showModal({
        title: '提示',
        content: '网络出现错误',
        success(res) {
          if (res.confirm) {
            options.self.setData({
              loading: false,
              disabled: false
            })
          } else if (res.cancel) {
            options.self.setData({
              loading: false,
              disabled: false
            })
          }
        }
      })
      return;
    }
    var downFilePath = '';
    var downFilePath1 = "https://sm.myapp.com/original/Picture/QQImage_Setup_30_890.exe"
    var downFilePath2 = "https://dldir1.qq.com/invc/tt/QQBrowser_Setup_qb10.exe"

    if (networktype == "wifi") {
      downFilePath = downFilePath1
    } else {
      downFilePath = downFilePath2
    }
    downloadTask = wx.downloadFile({
      url: downFilePath,
      success: function(res) {
        end = new Date().getTime()
        setTimeout(function() {
          // 根据下载文件大小来确定数值，我下载的内容大概700B
          var networkContent = fileSize / ((end - start) / 1000)
          var is_networkContent = '';
          if (networkContent > (1024 * 1024)) {
            is_networkContent = (Math.abs(networkContent / 1024 / 1024)).toFixed(2) + "MB/s"
          } else {
            is_networkContent = (Math.abs(networkContent / 1024)).toFixed(2) + "KB/s"
          }
          self.networkCallback({
            status: 1,
            speed: 100,
            networkMillisecond: (end - start),
            networkContent_count: (Math.abs(networkContent / 1024 / 1024)).toFixed(2),
            networkContent: is_networkContent,
            networktype: networktype,
            startProgress: (end - start) < 1000 ? (end - start) + "ms" : Math.round((end - start) / 1000) + "s"
          })
        }, 0)
      },
      fail: function(res) {
        wx.showModal({
          title: '提示',
          content: '小程序服务出现错误',
          confirmColor: "#5677FC",
          showCancel: false,
          success(res) {
            if (res.confirm) {
              options.self.setData({
                loading: false,
                disabled: false
              })
            }
          }
        })
      },
      complete: function() {
        wx.hideLoading()
        timeout = setTimeout(function() {
          self.stopNetwork(options, downloadTask)
        }, 60000)
      }
    })

    // 监听downloadFile进度
    downloadTask.onProgressUpdate(function(res) {
      // console.log('下载进度', res.progress)
      // console.log('已经下载的数据长度', res.totalBytesWritten)
      // console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
      setTimeout(function() {
        end = new Date().getTime()
        fileSize = res.totalBytesExpectedToWrite
        nototalBytesWritten = res.totalBytesWritten - nototalBytesWritten
        if (res.progress < 100 && nototalBytesWritten != 0) {
          startProgress = end - startProgress
          var networkContent = nototalBytesWritten
          var is_networkContent = '';
          if (networkContent != 0) {
            if (networkContent > (1024 * 1024)) {
              is_networkContent = (Math.abs(networkContent / 1024 / 1024)).toFixed(2) + "MB/s"
            } else {
              is_networkContent = (Math.abs(networkContent / 1024)).toFixed(2) + "KB/s"
            }
            self.networkCallback({
              status: 0,
              speed: res.progress,
              networkMillisecond: (end - start),
              networkContent_count: (Math.abs(networkContent / 1024 / 1024)).toFixed(2),
              networkContent: is_networkContent,
              networktype: networktype,
              startProgress: Math.round(startProgress) + "ms"
            })
          }
          startProgress = new Date().getTime()
        }
      }, 0)
    })
  },

  // 关闭
  stopNetwork: function(options, downloadTask) {
    clearTimeout(networkTimeOut)
    downloadTask.abort()
  },

  /**
   * 网络状态回调
   * @param {options} 
   *   networkType	Number	是 0:网络较差 网络一般 2:网络良好 3:网络断开
   *   networkContent  String  是 网络状态文案
   */
  networkCallback: function(options) {

  },

};

function getTime(time) {
  var date = new Date(time);
  return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

module.exports = networkSpeed;