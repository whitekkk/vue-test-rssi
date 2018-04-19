<template>
  <div @click.right="mousePosition()" class="screen" oncontextmenu="return false;">
    <div class="hxw">
      <button @click="setH"> H </button>x
      <button @click="setW"> W </button>
      <input v-model="n">
    </div>
    <img class="plan" src="../static/img/plan.png" :width="width.now" :height="height.now"/>
    <div class="aInp">
      <div class="inp" v-for="(i, index) in position" :key="index">
        {{i.name}}
        <!-- <input v-model="i.radius" @input="plotUser"> -->
        {{i.radiusA / 50}}
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
        {{i.ssid}} {{i.rssi}} channel{{i.channel}} rssi with quality{{i.quality/2 - 100}} {{i.mac}}
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
var d = new Date()
var morethan50 = require('./../morethan50')
// var db = require('./../rssiDB')
var gridArr = require('./../gridArr')

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
      y: 0,
      name: '',
      mac: '',
      width: {
        one: 0,
        two: 0,
        now: '1359',
        enable: false
      },
      height: {
        one: 0,
        two: 0,
        now: 834,
        enable: false
      },
      n: 2.4,
      counts: 0,
      typeC: {}
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
      d = new Date()
      if (this.rssi.length === 0) {
        this.rssi = network
        this.rssi.forEach(e => {
          e.time = d.getSeconds()
          e.indicator = 40
          e.morethan50 = morethan50
          e.indicator = this.changeIndicator(e.rssi, e.indicator)
          e.far = 0
        })
      } else {
        network.forEach(e => {
          // var index = vm.rssi.findIndex(rssi => rssi.mac === e.mac)
          // if (index !== -1) {
          //
          // }
          // console.log(e.times)
          if (e.mac === '2A:A4:3C:BF:3D:AA' || e.mac === '2A:A4:3C:BF:3E:12' || e.mac === '2A:A4:3C:BD:65:C6') {
          // if (e.mac === '2A:A4:3C:BF:3D:AA' || e.mac === '2E:51:01:1A:2B:C0' || e.mac === 'E2:AA:96:D4:F3:46') {
            if (this.counts < 30) {
              console.log(e.ssid, e.rssi)
              this.counts++
            }
            var item = this.rssi.find(rssi => rssi.mac === e.mac)
            if (item) {
              // console.log(item)
              item.time = d.getSeconds()
              item.channel = e.channel
              item.rssi = e.rssi
              item.quality = e.quality
              item.indicator = this.changeIndicator(item.rssi, item.indicator)
              // item.far = this.calculateDistanceTypeA(item.rssi, item.indicator, item.quality, item.mac)
            } else {
              // console.log('not item')
              e.time = d.getSeconds()
              e.indicator = 40
              e.morethan50 = morethan50
              e.indicator = this.changeIndicator(e.rssi, e.indicator)
              e.far = 0
              this.rssi.push(e)
            }
          }
        })
      }
      let temp1 = 0
      let temp2 = 0
      let temp3 = 0
      this.position.forEach(e => {
        let i = this.rssi.find(item => item.mac === e.mac)
        i.farA = this.calculateDistanceTypeA(i.rssi, i.indicator, i.quality, i.mac)
        i.farB = this.calculateDistanceTypeB(i.rssi, i.indicator, i.quality, i.mac)
        if (i.mac === '2A:A4:3C:BF:3D:AA') {
          temp1 = i.rssi
        } else if (i.mac === '2A:A4:3C:BF:3E:12') {
          temp2 = i.rssi
        } else if (i.mac === '2A:A4:3C:BD:65:C6') {
          temp3 = i.rssi
        }
        // if (i.mac === '2A:A4:3C:BF:3D:AA') {
        //   temp1 = i.rssi
        // } else if (i.mac === '2E:51:01:1A:2B:C0') {
        //   temp2 = i.rssi
        // } else if (i.mac === 'E2:AA:96:D4:F3:46') {
        //   temp3 = i.rssi
        // }
        e.radiusA = i.farA
        e.radiusB = i.farB
      })
      if (temp1 !== 0 && temp2 !== 0 && temp3 !== 0) {
        let tC = this.calculateDistanceTypeC(temp1, temp2, temp3)
        if (tC.x !== 181 || this.x === 0) {
          this.typeC = tC
          this.x = tC.x
          this.y = tC.y
        }
      }
      this.rssi.forEach((e, i) => {
        let time = e.time % 4
        let timeNow = d.getSeconds() % 4
        let checkTime = Math.abs(timeNow - time)
        if (checkTime >= 3) {
          this.rssi.splice(i, 1)
        }
      })
      this.plotUser()
      // console.log(network)
    }
  },
  methods: {
    test () {
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
    changeIndicator (rssi, indicator) {
      var inverst = Math.abs(rssi)
      if (inverst < indicator) {
        return inverst
      } else if (indicator >= 40) {
        return 40
      } else {
        return indicator
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
      var allPA = []
      var allPB = []
      for (var i = 0; i < this.position.length; i++) {
        // console.log(i)
        this.drawCricle(i)
        this.plotPoint('red', this.position[i].x, this.position[i].y)
        allPA[i] = this.position[i].radiusA
        allPB[i] = this.position[i].radiusB
      }
      if (this.position.length > 2) {
        this.drawPoint(allPA, 'cyan')
        this.drawPoint(allPB, 'magenta')
        this.drawPointC(this.typeC, 'yellow')
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
      // console.log(position.clientX)
      // console.log(position.clientY)
      if (i === -1 && this.mac !== '') {
        if (this.count < 6) {
          this.mouseX = position.clientX + window.scrollX
          this.mouseY = position.clientY + window.scrollY
          this.position.push({name: this.name, x: this.mouseX, y: this.mouseY, mac: this.mac, radiusA: 0, radiusB: 0, radiusC: 0})
          var item = this.rssi.find(rssi => rssi.mac === this.mac)
          item.farA = this.calculateDistanceTypeA(item.rssi, item.indicator, item.indicator, item.mac)
          item.farB = this.calculateDistanceTypeB(item.rssi, item.indicator, item.indicator, item.mac)
          // item.farC = this.calculateDistanceTypeC(item.rssi, item.indicator, item.indicator, item.mac)
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
      context.arc(this.position[i].x, this.position[i].y, this.position[i].radiusA, 0, Math.PI * 2, false)
      context.stroke()
      context.closePath()
    },
    drawPointC (p, color) {
      this.plotPoint(color, p.x, p.y)
    },
    drawPoint (p, color) {
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
      // var xn = this.calPointInLineX(x3, xcc, r3)this.position[i].radiusA
      // var yn = this.calPointInLineY(y3, ycc, r3)
      // this.plotPoint('green', xn, yn)

      // triangulation
      var sureX = 0
      var sureY = 0
      var xa = this.position[0].x
      var ya = this.position[0].y
      var xb = this.position[1].x
      var yb = this.position[1].y
      var xc = this.position[2].x
      var yc = this.position[2].y
      var ra = p[0]
      var rb = p[1]
      var rc = p[2]
      var S = (Math.pow(xc, 2) - Math.pow(xb, 2) + Math.pow(yc, 2) - Math.pow(yb, 2) + Math.pow(rb, 2) - Math.pow(rc, 2)) / 2
      var T = (Math.pow(xa, 2) - Math.pow(xb, 2) + Math.pow(ya, 2) - Math.pow(yb, 2) + Math.pow(rb, 2) - Math.pow(ra, 2)) / 2
      var y = ((T * (xb - xc)) - (S * (xb - xa))) / (((ya - yb) * (xb - xc)) - ((yc - yb) * (xb - xa)))
      var x = ((y * (ya - yb)) - T) / (xb - xa)
      sureX = x
      sureY = y
      // this.plotPoint('cyan', x, y)

      // 4
      if (this.position.length > 3) {
        var xd = this.position[3].x
        var yd = this.position[3].y
        var rd = p[3]
        var U = (Math.pow(xd, 2) - Math.pow(xb, 2) + Math.pow(yd, 2) - Math.pow(yb, 2) + Math.pow(rb, 2) - Math.pow(rd, 2)) / 2
        var ys = ((T * (xb - xd)) - (U * (xb - xa))) / (((ya - yb) * (xb - xd)) - ((yd - yb) * (xb - xa)))
        var xs = ((ys * (ya - yb)) - T) / (xb - xa)
        sureX = x + xs / 2
        sureY = y + ys / 2
        // this.plotPoint('magenta', xs, ys)
      }
      if (this.position.length > 4) {
        var xe = this.position[4].x
        var ye = this.position[4].y
        var re = p[4]
        var V = (Math.pow(xe, 2) - Math.pow(xb, 2) + Math.pow(ye, 2) - Math.pow(yb, 2) + Math.pow(rb, 2) - Math.pow(re, 2)) / 2
        var yt = ((T * (xb - xe)) - (V * (xb - xa))) / (((ya - yb) * (xb - xe)) - ((ye - yb) * (xb - xa)))
        var xt = ((yt * (ya - yb)) - T) / (xb - xa)
        sureX = x + xs + xt / 3
        sureY = y + ys + yt / 3
        // this.plotPoint('yellow', xt, yt)
      }
      this.plotPoint(color, sureX, sureY)
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
    calculateDistanceTypeA (rssi, i, q, mac) {
      // var txPower = -43.8
      // // hard coded power value. Usually ranges between -59 to -65
      // if (rssi === 0) {
      //   return -1.0
      // }
      // var ratio = rssi * (1.0 / txPower)
      // if (ratio < 1.0) {
      //   return Math.pow(ratio, 10)
      // } else {
      //   // var distance = Math.pow(10, ((-35 - (rssi)) / (10 * 2)))
      //   // var distance = (0.89976) * Math.pow(ratio, 7.7095) + 0.111
      //   var rssiAvg = i
      //   var distance = Math.abs(rssi + rssiAvg)
      //   if (distance === 0) {
      //     distance = 1
      //   }
      //   // console.log(distance)
      //   return distance * 50
      //   // return distance
      // }
      // quality solution
      // var item = this.rssi.find(rssi => rssi.mac === mac)
      // q = Math.abs(q / 2 - 100)
      // if (q > 50 && item) {
      //   if (item.morethan50[q] === 0) {
      //     item.morethan50[q] = rssi
      //   } else if (item.morethan50[q] > rssi) {
      //     item.morethan50[q] = rssi
      //   }
      //   rssi = item.morethan50[q]
      // }
      // nomal solution
      //
      let rssiMin = i
      // let distance = Math.abs((rssi + rssiMin) / 2)
      // if (distance === 0) {
      //   distance = 1
      // }
      //
      // from dBm = -10n log10(d) + A chage to find d
      let distance = Math.pow(10, ((-1 * rssi) - rssiMin) / (10 * this.n))
      // db solution
      // for (let i in Object.keys(db)) {
      //   if (db[i - 1]) {
      //     // find range of distance
      //     if (rssi <= db[i - 1].db1 && rssi > db[i].db2) {
      //       // find where rssi nearby
      //       let low, height
      //       height = Math.abs(rssi - db[i - 1].abA)
      //       low = Math.abs(rssi - db[i].abA)
      //       // verify distance
      //       if (height > low) {
      //         if (db[i].abA <= rssi) {
      //           distance = parseInt(i) + 1
      //         } else {
      //           distance = parseInt(i) + 1 + 0.5
      //         }
      //       } else {
      //         if (db[i - 1].abA <= rssi) {
      //           distance = parseInt(i)
      //         } else {
      //           distance = parseInt(i) + 0.5
      //         }
      //       }
      //     }
      //   }
      // }
      // console.log(distance)
      return distance * 50
    },
    calculateDistanceTypeB (rssi, i, q, mac) {
      // quality solutiont
      rssi = Math.abs(q / 2 - 100)
      let rssiMin = i
      let distance = Math.pow(10, ((-1 * rssi) - rssiMin) / (10 * this.n))
      return distance * 50
    },
    calculateDistanceTypeC (rssi1, rssi2, rssi3) {
      // quality solution
      let goodGrid = []
      let mockGrid = gridArr
      // let tempX = 0
      // let tempY = 0
      for (let i = 0; i < mockGrid.length; i++) {
        if (Math.abs(mockGrid[i][0] - rssi1) < 12 && Math.abs(mockGrid[i][1] - rssi2) < 12 && Math.abs(mockGrid[i][2] - rssi3) < 12) {
          mockGrid[i][3] = i
          mockGrid[i][4] = 0
          goodGrid.push(mockGrid[i])
        } else if (i === mockGrid.length - 1 && goodGrid.length === 0) {
          goodGrid.push([this.x, this.y, 1, 0])
        }
      }
      if (goodGrid.length > 1) {
        console.log(goodGrid)
        for (let i = 1; i < goodGrid.length; i++) {
          for (let j = 0; j < 3; j++) {
            // console.log(goodGrid[i][j])
            if (goodGrid[i][j] < 7) {
              goodGrid[i][goodGrid[i].length - 1]++
              if (goodGrid[i][goodGrid[i].length - 1] > 2) {
                return ({x: (45 * (goodGrid[i][goodGrid[i].length - 2] % 12)) + 121 + 15, y: (Math.floor(goodGrid[i][goodGrid[i].length - 2] / 12) * 45) + 154 + 15})
              }
            }
          }
        }
      }
      return ({x: (45 * (goodGrid[0][goodGrid[0].length - 2] % 12)) + 121 + 15, y: (Math.floor(goodGrid[0][goodGrid[0].length - 2] / 12) * 45) + 154 + 15})
    }
  },
  components: {
  },
  mounted () {
    // this.test()
    // console.log(db)
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
  bottom: 0;
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
