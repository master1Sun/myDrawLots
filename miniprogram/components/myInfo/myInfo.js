// Component/myInfo.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: ''
    },
    desc: {
      type: String,
      value: ''
    },
    data: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    gotoInfo(e) {
      let lotid = e.currentTarget.dataset.lotid;
      let title = e.currentTarget.dataset.title;
      this.triggerEvent('click', {
        lotid,
        title
      })
    }
  }
})