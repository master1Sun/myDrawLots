// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()




//生成日期格式
const formatTimeDay = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

let time = new Date()
time.setHours(time.getHours() + 8);
let ft = formatTimeDay(time);


// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  if (event.NODEJS == 'getOpenid') {
    return {
      event,
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
    }
  } else if (event.NODEJS == "addUser") {
    let data = await db.collection('wxuser').where({
      openid: wxContext.OPENID
    }).get()
    if (data.data.length <= 0) {
      return await db.collection('wxuser').add({
        data: {
          openid: wxContext.OPENID, //用户唯一标识
          avatarUrl: event.avatarUrl, //用户信息：图像
          city: event.city, //用户信息：所在城市
          gender: event.gender, //用户信息：性别。0:未知，1：男，2：女
          language: event.language, //用户信息：语言
          nickName: event.nickName, //用户信息：姓名
          province: event.province, //用户信息：省份
          createTime: ft,
          joinerName: ''
        }
      })
    } else {
      return await db.collection('wxuser').where({
        openid: wxContext.OPENID
      }).update({
        data: {
          avatarUrl: event.avatarUrl, //用户信息：图像
          city: event.city, //用户信息：所在城市
          gender: event.gender, //用户信息：性别。0:未知，1：男，2：女
          language: event.language, //用户信息：语言
          nickName: event.nickName, //用户信息：姓名
          province: event.province, //用户信息：省份
          updateTime: ft
        }
      })
    }
  } else if (event.NODEJS == "getUser") {
    return await db.collection('wxuser').where({
      openid: wxContext.OPENID
    }).get()
  } else if (event.NODEJS == "getAllUser") {
    return await db.collection('wxuser').get()
  }
}