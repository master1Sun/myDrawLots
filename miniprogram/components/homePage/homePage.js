// components/homePage/homePage.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title1: {
      type: String,
      value: ''
    },
    title2: {
      type: String,
      value: ''
    },
    text: {
      type: String,
      value: ''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: true,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSubmitButtonTap: function() {
      this.setData({
        style: 'transform: rotateY(180deg);',
        show: false
      })
    },
    onReturnButtonTap: function() {
      this.setData({
        style: '',
        show: true
      })
    },
  }
})