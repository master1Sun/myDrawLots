const wxRequest = (params, url, tip) => {
  if (tip) {
    wx.showLoading({
      title: tip,
    })
  }
  Math.ceil(Math.random() * 10) == 1 ? wx.showNavigationBarLoading() : ''
  wx.cloud.callFunction({
    // 要调用的云函数名称
    name: url,
    data: params.data || {},
    success: res => {
      params.success && params.success(res)
    },
    fail: err => {
      params.fail && params.fail(err)
    },
    complete: c => {
      params.complete && params.complete(c)
      wx.hideLoading()
      wx.hideNavigationBarLoading()
    }
  })
}


/**用户信息 */
const getopenid = (params) => {
  params.data ? params.data.NODEJS = 'getOpenid' : params.data = {
    NODEJS: 'getOpenid'
  }
  wxRequest(params, 'userInfo')
}
const addUser = (params) => {
  params.data ? params.data.NODEJS = 'addUser' : params.data = {
    NODEJS: 'addUser'
  }
  wxRequest(params, 'userInfo')
}
/*结束 */


/**群抓阄 */
const lot_create = (params) => {
  params.data ? params.data.NODEJS = 'createLot' : params.data = {
    NODEJS: 'createLot'
  }
  wxRequest(params, 'lots')
}

const lot_getTaskJoiner = (params) => {
  params.data ? params.data.NODEJS = 'getTaskJoiner' : params.data = {
    NODEJS: 'getTaskJoiner'
  }
  wxRequest(params, 'lots')
}
const lot_myCreate = (params) => {
  params.data ? params.data.NODEJS = 'myCreate' : params.data = {
    NODEJS: 'myCreate'
  }
  wxRequest(params, 'lots')
}
const lot_myJoin = (params) => {
  params.data ? params.data.NODEJS = 'myJoin' : params.data = {
    NODEJS: 'myJoin'
  }
  wxRequest(params, 'lots')
}
const lot_storelotOne = (params) => {
  params.data ? params.data.NODEJS = 'storelotOne' : params.data = {
    NODEJS: 'storelotOne'
  }
  wxRequest(params, 'lots')
}
const lot_getLottask = (params) => {
  params.data ? params.data.NODEJS = 'getLottask' : params.data = {
    NODEJS: 'getLottask'
  }
  wxRequest(params, 'lots')
}
const lot_getLotNumber = (params) => {
  params.data ? params.data.NODEJS = 'getLotNumber' : params.data = {
    NODEJS: 'getLotNumber'
  }
  wxRequest(params, 'lots')
}
/**结束 */
module.exports = {
  getopenid,
  addUser,
  lot_create,
  lot_getTaskJoiner,
  lot_myCreate,
  lot_myJoin,
  lot_storelotOne,
  lot_getLottask,
  lot_getLotNumber
}