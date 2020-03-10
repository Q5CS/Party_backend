class restaurant {
  constructor(io, initAlgValue, maxAlgValue) {
    this.algValue = initAlgValue ? initAlgValue : 0
    this.maxAlgValue = maxAlgValue ? maxAlgValue : 9999
    this.onlineUserNumber = 0
    this.lastAddTime = {}
    this.lastReduceTime = {}
    // this.onlineUsers = []
    this.io = io
    io.on('connection', (socket) => {
      this.sendInitData()
      this.onlineUserNumber++

      this.lastAddTime[socket.id] = new Date().getTime()
      this.lastReduceTime[socket.id] = new Date().getTime()

      socket.on('disconnect', () => {
        this.onlineUserNumber--
      })

      socket.on('getData', () => {
        this.sendInitData()
      })

      this.addAlgValue(socket)
      this.reduceAlgValue(socket)
    });

    setInterval(() => {
      this.io.emit('onlineUserNumber', this.onlineUserNumber)
    }, 1000)
  }

  sendInitData() {
    let data = {
      algValue: this.algValue,
      maxAlgValue: this.maxAlgValue
    }
    this.io.emit('initData', data)
  }

  algVaueChanged() {
    this.io.emit('algValueChanged', this.algValue)
    if (this.algValue > this.maxAlgValue) {
      this.io.emit('goToAlgRestaurant')
      this.algValue = 0
    }
  }

  addAlgValue(socket) {
    const menu = require("../config").menu
    socket.on('addAlgValue', (username) => {
      if (new Date().getTime() - this.lastAddTime[socket.id] < require("../config").addInterval) {
        socket.emit('errorDetected', '点那么多会没钱！')
        return
      }
      let r = this.randomNum(0, menu.length - 1)
      let item = menu[r]
      this.algValue += item.value
      username = username.slice(0,10)
      let data = {
        username,
        item
      }
      this.io.emit('algValueAdded', data)
      this.lastAddTime[socket.id] = new Date().getTime()
      this.algVaueChanged()
    })
  }

  reduceAlgValue(socket) {
    socket.on('reduceAlgValue', (username) => {
      if (new Date().getTime() - this.lastReduceTime[socket.id] < require("../config").reduceInterval) {
        socket.emit('errorDetected', '吃那么快会噎着！')
        return
      }
      if (this.algValue <= 0) {
        socket.emit('errorDetected', '菜都没了，没法再吃啦！')
        return
      }
      let r = this.randomNum(0, 3000)
      this.algValue -= r
      username = username.slice(0,10)
      let data = {
        username,
        value: r
      }
      this.io.emit('algValueReduced', data)
      this.lastReduceTime[socket.id] = new Date().getTime()
      this.algVaueChanged()
    })
  }

  randomNum(minNum, maxNum) {
    switch (arguments.length) {
      case 1:
        return parseInt(Math.random() * minNum + 1, 10)
        break
      case 2:
        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10)
        break
      default:
        return 0
        break
    }
  }
}

module.exports = restaurant;