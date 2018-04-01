<template>
  <div @click.right="mousePosition()" class="screen" oncontextmenu="return false;">
    <div class="hxw">
      <button @click="setH"> H </button>x
      <button @click="setW"> W </button>
    </div>
    <img class="plan" src="../static/img/plan.png" :width="width.now" :height="height.now"/>
    <div class="aInp">
      <div class="inp" v-for="(i, index) in position" :key="index">
        {{i.name}}
        <!-- <input v-model="i.radius" @input="plotUser"> -->
        {{i.radius / 50}}
        <!-- <input v-model="radius[1]" @input="test">
        {{radius[1]}}
        <input v-model="radius[2]" @input="test">
        {{radius[2]}}
        <input v-model="radius[3]" @input="test">
        {{radius[3]}}
        {{x}} -->
     </div>
     <!-- <button @click="plotUser">Cal</button> -->
    </div>
    <div class="bInp">
      <div v-for="(i, index) in rssi" :key="index" @click="getAPName(i.ssid, i.mac)">
        {{i.ssid}} {{i.rssi}} channel{{i.channel}}
      </div>
    </div>
    <div class="sho" @click.left="setHW()">
      <canvas id="canvas" :width="width.now" :height="height.now"></canvas>
    </div>
    <div v-for="(i, index) in position" :key="index">
      <div @click="reMac(i.mac)" :style="{'position':'absolute', 'top': i.y + 'px', 'left': i.x + 'px'}">
        <!-- AP {{index + 1}} -->
        {{i.name}}
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import VueSocketio from 'vue-socket.io'
Vue.use(VueSocketio, 'http://localhost:3010/')

// window.onscroll = function (e) {
//   var scrollX = window.scrollX
//   var scrollY = window.scrollY
// }

export default {
  name: 'App',
  data () {
    return {
      mouseX: 0,
      mouseY: 0,
      count: 0,
      position: [],
      // radius: [],
      rssi: [],
      x: 0,
      name: '',
      mac: '',
      width: {
        one: 0,
        two: 0,
        now: '',
        enable: false
      },
      height: {
        one: 0,
        two: 0,
        now: 834,
        enable: false
      }
    }
  },
  created () {
    window.addEventListener('keydown', this.slideAP)
  },
  sockets: {
    connect () {
      console.log('socket connected')
    },
    wifi (network) {
      if (this.rssi.length === 0) {
        this.rssi = network
        this.rssi.forEach(e => {
          e.indicator = 40
          e.indicator = this.changeIndicator(e.rssi)
          e.far = this.calculateDistance(e.rssi, e.indicator)
        })
      } else {
        network.forEach((e, i) => {
          // var index = vm.rssi.findIndex(rssi => rssi.mac === e.mac)
          // if (index !== -1) {
          //
          // }
          var item = this.rssi.find(rssi => rssi.mac === e.mac)
          if (item) {
            item.channel = e.channel
            item.rssi = e.rssi
            item.quality = e.quality
            item.indicator = this.changeIndicator(item.rssi)
            item.far = this.calculateDistance(item.rssi, item.indicator)
          } else {
            // console.log('not item')
            e.indicator = 40
            e.indicator = this.changeIndicator(e.rssi)
            e.far = this.calculateDistance(e.rssi, e.indicator)
            this.rssi.push(e)
          }
        })
      }
      this.position.map((item) => {
        let i = this.rssi.find(items => items.mac === item.mac)
        item.radius = i.far
      })
      this.plotUser()
      // console.log(network)
    }
  },
  methods: {
    shows () {
      console.log(window['mouseX'])
    },
    reMac (mac) {
      // console.log(mac)
      this.mac = mac
    },
    setH () {
      this.height.enable = true
    },
    setW () {
      this.width.enable = true
    },
    setHW () {
      var img = document.querySelector('img')
      this.width.now = img.width
      var canvas = document.getElementById('canvas')
      // canvas.height = this.height.now
      // console.log(img.height)
      // console.log(img.width)
      let position = window.event
      // console.log(this.width.enable)
      if (this.width.enable) {
        if (this.width.one === 0) {
          this.width.one = position.clientX
          // console.log(this.width.now)
        } else {
          this.width.two = position.clientX
          this.width.now = (50 / Math.abs(this.width.one - this.width.two)) * this.width.now
          this.width.one = 0
          this.width.two = 0
          this.width.enable = false
          // console.log(this.width.now)
          canvas.width = this.width.now
        }
        // console.log(this.width.now)
      } else if (this.height.enable) {
        if (this.height.one === 0) {
          this.height.one = position.clientY
        } else {
          this.height.two = position.clientY
          this.height.now = (50 / Math.abs(this.height.one - this.height.two)) * this.height.now
          this.height.one = 0
          this.height.two = 0
          this.height.enable = false
          // console.log(this.height.now)
          canvas.height = this.height.now
        }
      }
    },
    slideAP (e) {
      var i = this.position.findIndex(items => items.mac === this.mac)
      if (e.code === 'Numpad4') {
        this.position[i].x--
      } else if (e.code === 'Numpad6') {
        this.position[i].x++
      } else if (e.code === 'Numpad8') {
        this.position[i].y--
      } else if (e.code === 'Numpad2') {
        this.position[i].y++
      }
      this.plotUser()
      // console.log(e)
    },
    changeIndicator (rssi) {
      if (Math.abs(rssi) < 40) {
        return Math.abs(rssi)
      } else {
        return 40
      }
    },
    getAPName (name, mac) {
      this.name = name
      this.mac = mac
      // console.log(name, mac)
    },
    plotUser () {
      var canvas = document.getElementById('canvas')
      var context = canvas.getContext('2d')
      var img = document.querySelector('img')
      this.width.now = img.width
      canvas.width = this.width.now
      context.clearRect(0, 0, canvas.width, canvas.height)
      for (var i = 0; i < this.position.length; i++) {
        // console.log(i)
        this.drawCricle(i)
        this.plotPoint('red', this.position[i].x, this.position[i].y)
      }
      if (this.position.length > 2) {
        this.drawPoint()
        // console.log(this.position.length)
      }
    },
    updateCanvas () {
      // if (this.count < 4) {
      this.plotPoint('#dd0343', this.mouseX, this.mouseY)
      this.drawCricle(this.count)
      // console.log(this.position)
      // } else {
      //   this.drawPoint()
      //   this.plotPoint('pink', this.mouseX, this.mouseY)
      // }
    },
    mousePosition () {
      // let vm = this
      let position = window.event
      var i = this.position.findIndex(items => items.mac === this.mac)
      // console.log(i)
      // console.log(window.scrollX)
      if (i === -1 && this.mac !== '') {
        if (this.count < 6) {
          this.mouseX = position.clientX + window.scrollX
          this.mouseY = position.clientY + window.scrollY
          this.position.push({name: this.name, x: this.mouseX, y: this.mouseY, mac: this.mac, radius: 0})
          // this.radius.push(0)
          this.updateCanvas()
          this.count++
        }
      }
    },
    plotPoint (color, x, y) {
      var canvas = document.getElementById('canvas')
      var context = canvas.getContext('2d')
      context.beginPath()
      context.fillStyle = color
      context.arc(x, y, 10, 0, Math.PI * 2)
      context.fill()
      context.closePath()
    },
    drawCricle (i) {
      // console.log(this.radius[i])
      var canvas = document.getElementById('canvas')
      var context = canvas.getContext('2d')
      context.beginPath()
      context.strokeStyle = 'black'
      context.lineWidth = 2
      context.arc(this.position[i].x, this.position[i].y, this.position[i].radius, 0, Math.PI * 2, false)
      context.stroke()
      context.closePath()
    },
    drawPoint () {
      // var x1 = this.position[0].x
      // var y1 = this.position[0].y
      // var x2 = this.position[1].x
      // var y2 = this.position[1].y
      // var x3 = this.position[2].x
      // var y3 = this.position[2].y
      // var long = this.calLong(x1, y1, x2, y2)
      // var r1 = (this.radius[0] / long)
      // var xnew1 = this.calPointInLineX(x1, x2, r1)
      // var ynew1 = this.calPointInLineY(y1, y2, r1)
      // // this.plotPoint('yellow', xnew1, ynew1)
      //
      // var r2 = (this.radius[1] / long)
      // var xnew2 = this.calPointInLineX(x2, x1, r2)
      // var ynew2 = this.calPointInLineY(y2, y1, r2)
      // // this.plotPoint('yellow', xnew2, ynew2)
      //
      // var xcc = this.calPointInLineX(xnew2, xnew1, 0.5)
      // var ycc = this.calPointInLineY(ynew2, ynew1, 0.5)
      // this.plotPoint('blue', xcc, ycc)
      //
      // var long2 = this.calLong(x3, y3, xcc, ycc)
      // var r3 = (this.radius[2] / long2)
      // var xn = this.calPointInLineX(x3, xcc, r3)
      // var yn = this.calPointInLineY(y3, ycc, r3)
      // this.plotPoint('green', xn, yn)

      // triangulation
      var xa = this.position[0].x
      var ya = this.position[0].y
      var xb = this.position[1].x
      var yb = this.position[1].y
      var xc = this.position[2].x
      var yc = this.position[2].y
      var ra = this.position[0].radius
      var rb = this.position[1].radius
      var rc = this.position[2].radius
      var S = (Math.pow(xc, 2) - Math.pow(xb, 2) + Math.pow(yc, 2) - Math.pow(yb, 2) + Math.pow(rb, 2) - Math.pow(rc, 2)) / 2
      var T = (Math.pow(xa, 2) - Math.pow(xb, 2) + Math.pow(ya, 2) - Math.pow(yb, 2) + Math.pow(rb, 2) - Math.pow(ra, 2)) / 2
      var y = ((T * (xb - xc)) - (S * (xb - xa))) / (((ya - yb) * (xb - xc)) - ((yc - yb) * (xb - xa)))
      var x = ((y * (ya - yb)) - T) / (xb - xa)
      this.plotPoint('cyan', x, y)

      // 4
      if (this.position.length > 3) {
        var xd = this.position[3].x
        var yd = this.position[3].y
        var rd = this.position[3].radius
        var U = (Math.pow(xd, 2) - Math.pow(xb, 2) + Math.pow(yd, 2) - Math.pow(yb, 2) + Math.pow(rb, 2) - Math.pow(rd, 2)) / 2
        var ys = ((T * (xb - xd)) - (U * (xb - xa))) / (((ya - yb) * (xb - xd)) - ((yd - yb) * (xb - xa)))
        var xs = ((ys * (ya - yb)) - T) / (xb - xa)
        this.plotPoint('magenta', xs, ys)
      }
      if (this.position.length > 4) {
        var xe = this.position[4].x
        var ye = this.position[4].y
        var re = this.position[4].radius
        var V = (Math.pow(xe, 2) - Math.pow(xb, 2) + Math.pow(ye, 2) - Math.pow(yb, 2) + Math.pow(rb, 2) - Math.pow(re, 2)) / 2
        var yt = ((T * (xb - xe)) - (V * (xb - xa))) / (((ya - yb) * (xb - xe)) - ((ye - yb) * (xb - xa)))
        var xt = ((yt * (ya - yb)) - T) / (xb - xa)
        console.log(xt)
        console.log(yt)
        this.plotPoint('yellow', xt, yt)
      }
    },
    calLong (x1, y1, x2, y2) {
      return (Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)))
    },
    calPointInLineX (x1, x2, r) {
      // x2 คือตัวหลัก
      if (x1 - x2 < 0) {
        return (x1 + (Math.abs(x1 - x2) * r))
      } else {
        return (x1 - (Math.abs(x1 - x2) * r))
      }
    },
    calPointInLineY (y1, y2, r) {
      if (y1 - y2 < 0) {
        return (y1 + (Math.abs(y1 - y2) * r))
      } else {
        return (y1 - (Math.abs(y1 - y2) * r))
      }
    },
    calculateDistance (rssi, i) {
      var txPower = -43.8
      // hard coded power value. Usually ranges between -59 to -65
      if (rssi === 0) {
        return -1.0
      }
      var ratio = rssi * (1.0 / txPower)
      if (ratio < 1.0) {
        return Math.pow(ratio, 10)
      } else {
        // var distance = Math.pow(10, ((-35 - (rssi)) / (10 * 2)))
        // var distance = (0.89976) * Math.pow(ratio, 7.7095) + 0.111
        var rssiAvg = i
        var distance = Math.abs(rssi + rssiAvg)
        if (distance === 0) {
          distance = 1
        }
        // console.log(distance)
        return distance * 50
        // return distance
      }
    }
  },
  components: {
  },
  mounted () {
    this.shows()
    // this.width.now = img.width
    // this.$socket.emit('setName', {name: vm.nameMe, room: vm.key})
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
div.screen {
  position: relative;
  width: 100vw;
  height: 100vh;
  top: -10px;
  left: -10px;
}
div.sho {
  position: relative;
  /* top: -15px; */
  /* right: -5px; */
}
div.inp {
  position: relative;
  z-index: 9999;
  /* float: left; */
}
div.aInp {
  position: absolute;
  z-index: 9999;
  /* left: 150px; */
}
div.bInp {
  position: absolute;
  z-index: 9999;
  right: 0;
  /* left: 150px; */
}
div.hxw {
  position: absolute;
  z-index: 9999;
  left: 0;
  bottom: 5%;
}

img.plan {
  position: absolute;
}
</style>
