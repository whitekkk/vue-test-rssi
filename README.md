# rssi-beta

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

Add code in node_modules > node-wifi-scanner > lib > iwlist.js (line 52) before run this project

var elements = line.split('=');
elements.forEach(e => {
  if (e.indexOf('/') > 0) {
    // that's our part
    var parts    = e.split('/');
    var level    = Math.floor(100 * parseInt(parts[0], 10) / parseInt(parts[1], 10));
    // network.rssi = level / 2 - 100;
    network.quality = level;
  }
})
