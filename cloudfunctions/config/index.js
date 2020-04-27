// 云函数入口文件
const cloud = require('wx-server-sdk')


cloud.init()

let notice = 'Hi，欢迎使用抽签小能手小程序\n觉得好玩右上角点击收藏\n~\n1、本程序github已经开源'
let isLots = false;
// 云函数入口函数
exports.main = async(event, context) => {
  return {
    notice,
    isLots,
  };
}