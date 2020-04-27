// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

cloud.init()

const db = cloud.database()
const $ = db.command.aggregate
const _ = db.command



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

let myDate = new Date();
myDate.setDate(myDate.getDate() - 30);
let nightDay = formatTimeDay(myDate); //获取7天前日期

// 云函数入口函数
exports.main = async(event, context) => {
  if (event.NODEJS == 'createLot') {
    return await createLot(event);
  } else if (event.NODEJS == 'getTaskJoiner') {
    return await getTaskJoiner(event);
  } else if (event.NODEJS == 'myCreate') {
    return await myCreate(event);
  } else if (event.NODEJS == 'myJoin') {
    return await myJoin(event);
  } else if (event.NODEJS == 'storelotOne') {
    return await storelotOne(event);
  } else if (event.NODEJS == 'getLottask') {
    return await getLottask(event);
  } else if (event.NODEJS == 'getLotNumber') {
    return await getLotNumber(event);
  }
}


async function createLot(event) {
  const wxContext = cloud.getWXContext()
  let title = '';
  if (event.title != '') {
    try {
      await cloud.openapi.security.msgSecCheck({
        content: event.title
      })
      title = event.title
    } catch (err) {
      title = '标题含有违规文字~'
    }
  }
  var winnumber = [];
  if (parseInt(event.selectNumber) > 0) {
    var arr = Array.from(Array(Number(event.joinNrmber)), (v, k) => k + 1);
    for (let i = 0; i < parseInt(event.selectNumber); i++) {
      var random = Math.floor(Math.random() * arr.length)
      winnumber.push(arr[random])
      arr.splice(random, 1)
    }

  }
  return await db.collection('lots_task').add({
    data: {
      openid: wxContext.OPENID,
      lotid: event.lotid,
      joinNrmber: event.joinNrmber,
      selectNumber: event.selectNumber,
      winnumber: winnumber,
      drawnumber: [],
      title: title,
      createTime: ft
    }
  })
}


async function getTaskJoiner(event) {
  //获取参加活动用户
  let joiner = await db.collection('lots_user').aggregate()
    .lookup({
      from: "wxuser",
      localField: "openid",
      foreignField: "openid",
      as: "noticeList",
    })
    .match({
      lotid: event.lotid,
      createTime: _.gte(nightDay)
    })
    .replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$noticeList', 0]), '$$ROOT'])
    })
    .project({
      noticeList: 0
    })
    .end()
  return joiner
}


async function getLottask(event) {
  return await db.collection('lots_task').where({
    lotid: event.lotid,
    createTime: _.gte(nightDay)
  }).get()
}

async function myCreate() {
  const wxContext = cloud.getWXContext()
  return await db.collection('lots_task').where({
    openid: wxContext.OPENID,
    createTime: _.gte(nightDay)
  }).get()
}

async function myJoin() {
  const wxContext = cloud.getWXContext()
  let data = await db.collection('lots_user').aggregate()
    .lookup({
      from: "lots_task",
      localField: "lotid",
      foreignField: "lotid",
      as: "noticeList",
    })
    .match({
      openid: wxContext.OPENID,
      createTime: _.gte(nightDay)
    })
    .replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$noticeList', 0]), '$$ROOT'])
    })
    .project({
      noticeList: 0
    })
    .end()
  return data;
}


async function storelotOne(event) {
  const wxContext = cloud.getWXContext()
  let c = await db.collection('lots_user').where({
    lotid: event.lotid,
    openid: wxContext.OPENID
  }).get()
  if (c.data.length > 0) {
    return c.data[0].number;
  }
  let data = await db.collection('lots_task').where({
    lotid: event.lotid
  }).get()
  var arr3 = [];
  if (data.data.length > 0) {
    var arr = Array.from(Array(Number(data.data[0].joinNrmber)), (v, k) => k + 1);
    var array2 = data.data[0].drawnumber;
    for (let i = 0; i < arr.length; i++) {
      var stra = arr[i];
      var count = 0;
      for (var j = 0; j < array2.length; j++) {
        var strb = array2[j];
        if (stra == strb) {
          count++;
        }
      }
      if (count === 0) {
        arr3.push(stra);
      }
    }
  }
  let number;
  if (arr3.length > 0) {
    number = arr3[Math.floor(Math.random() * arr3.length)];
    let data = await db.collection('lots_task').where({
      lotid: event.lotid
    }).update({
      data: {
        drawnumber: _.push(number),
        updateTime: ft
      }
    })
    let data1 = await db.collection('lots_user').add({
      data: {
        lotid: event.lotid,
        openid: wxContext.OPENID,
        number: number,
        createTime: ft
      }
    })
  }
  if (number) {
    return number
  } else {
    return -1
  }
}

async function getLotNumber(event) {
  const wxContext = cloud.getWXContext()
  return await db.collection('lots_user').where({
    lotid: event.lotid,
    openid: wxContext.OPENID,
  }).get()
}