function getRad(d) {
  var PI = Math.PI
  return d * PI / 180.0
}

/**
 * approx distance between two points on earth ellipsoid
 * @param {Object} lat1
 * @param {Object} lng1
 * @param {Object} lat2
 * @param {Object} lng2
 */
function getFlatternDistance(lat1, lng1, lat2, lng2) {
  var EARTH_RADIUS = 6378137.0 // 单位M
  if (lat1 == null || isNaN(lat1) || lng1 == null || isNaN(lng1) || lat2 == null || isNaN(lat2) || lng2 == null ||
    isNaN(lng2)) {
    return 99999999 + 'km'
  }
  lat1 = parseFloat(lat1)
  lng1 = parseFloat(lng1)
  lat2 = parseFloat(lat2)
  lng2 = parseFloat(lng2)
  if (lat1 === lat2 && lng1 === lng2) {
    return 0 + 'm'
  }
  var f = getRad((lat1 + lat2) / 2)
  var g = getRad((lat1 - lat2) / 2)
  var l = getRad((lng1 - lng2) / 2)

  var sg = Math.sin(g)
  var sl = Math.sin(l)
  var sf = Math.sin(f)

  var s,
    c,
    w,
    r,
    d,
    h1,
    h2
  var a = EARTH_RADIUS
  var fl = 1 / 298.257

  sg *= sg
  sl *= sl
  sf *= sf

  s = sg * (1 - sl) + (1 - sf) * sl
  c = (1 - sg) * (1 - sl) + sf * sl

  w = Math.atan(Math.sqrt(s / c))
  r = Math.sqrt(s * c) / w
  d = 2 * w * a
  h1 = (3 * r - 1) / 2 / c
  h2 = (3 * r + 1) / 2 / s

  var distance = parseInt(d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg)))

  if (distance > 1000) {
    return (distance / 1000) + 'km'
  }
  return distance + 'm'
}

/*
 * 版本号比较方法
 * 传入两个字符串，当前版本号：curV；比较版本号：reqV
 * 调用方法举例：compare("1.1","1.2")，将返回false
 */
function compareVersion(curV, reqV) {
  if (curV && reqV) {
    // 将两个版本号拆成数字
    var arr1 = curV.split('.'),
      arr2 = reqV.split('.')
    var minLength = Math.min(arr1.length, arr2.length),
      position = 0,
      diff = 0
    // 依次比较版本号每一位大小，当对比得出结果后跳出循环（后文有简单介绍）
    while (position < minLength && ((diff = parseInt(arr1[position]) - parseInt(arr2[position])) == 0)) {
      position++
    }
    diff = (diff != 0) ? diff : (arr1.length - arr2.length)
    // 若curV大于reqV，则返回true
    return diff > 0
  } else {
    // 输入为空
    // console.log("版本号不能为空");
    return false
  }
}

// 日期相关

function appendZero(str) {
  var intValue = parseInt(str)
  if (intValue >= 0 && intValue <= 9) {
    str = '0' + str
  }
  return str
}

/**
 * 获取当前时间戳或2019-01-01 12:00:00格式的当前日期
 * @param {Boolean} isTimeStamp
 */
function getNowTime(isTimeStamp) {
  if (isTimeStamp) {
    return _.now()
  }

  var date = new Date()
  var seperator1 = '-'
  var seperator2 = ':'
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hours = date.getHours()
  var minutes = date.getMinutes()
  var seconds = date.getSeconds()

  var currentdate = date.getFullYear() + seperator1 + appendZero(month) + seperator1 + appendZero(day) +
    ' ' + appendZero(hours) + seperator2 + appendZero(minutes) +
    seperator2 + appendZero(seconds)
  return currentdate
}

/**
 * 获得上一天日期
 * @return {String}
 */
function getLastDateStr() {
  var date = new Date()
  date.setTime(date.getTime() - 24 * 60 * 60 * 1000)
  var seperator1 = '-'
  var month = date.getMonth() + 1
  var day = date.getDate()

  return date.getFullYear() + seperator1 + appendZero(month) + seperator1 + appendZero(day)
}

/**
 * 获得两个日期的间隔天数：如 1月1号 至 1月2号 相隔两天。
 * @param {String or Date} startDate
 * @param {String or Date} endDate
 * @return {Number}
 */
function getBetweenDays(startDate, endDate) {
  if (typeof (startDate) === 'string') {
    startDate = getStrDate(startDate)
  }

  if (typeof (endDate) === 'string') {
    endDate = getStrDate(endDate)
  }

  return ((endDate - startDate) / 1000 / 60 / 60 / 24) + 1
}

/**
 * Date类型数据转换成String类型
 * @param {Date} date
 * @return {String}
 */
function getDateStr(date) {
  if (!date) {
    date = new Date()
  }
  var seperator1 = '-'
  var month = date.getMonth() + 1
  var day = date.getDate()

  return date.getFullYear() + seperator1 + appendZero(month) + seperator1 + appendZero(day)
}

/**
 * String类型数据转换成Date类型
 * @param {String} strDate
 * @return {Date}
 */
function getStrDate(strDate) {
  if (!strDate) {
    return new Date()
  }
  var splitDate = strDate.split('-')
  var year = parseInt(splitDate[0])
  var month = parseInt(splitDate[1]) - 1
  var day = parseInt(splitDate[2])
  return new Date(year, month, day)
}

/**
 * html转成文本
 * @param {String} html
 * @return {String} 纯文本
 */
function getSimpleText(html) {
  var re1 = new RegExp('<.+?>', 'g') // 匹配html标签的正则表达式，"g"是搜索匹配多个符合的内容
  var msg = html.replace(re1, '') // 执行替换成空字符
  return msg
}

/**
 * @return {String} 'ios' 或 'android'
 */
function getPlatformType() {
  if (device.platform === 'iOS') {
    return 'ios'
  } else if (device.platform === 'Android') {
    return 'android'
  }
}

/**
 * (依赖cordova网络插件)设备是否有网
 * @return {Boolean}
 */
function isNetEnable() {
  // 判断是否有网络
  var netType = navigator.connection.type
  console.log(netType)
  if (netType === Connection.NONE) {
    return false
  } else {
    return true
  }
}

function checkNetEnable(successCB, failCB, options) {
  // 默认行为是执行的时候马上showLoading
  if (!options) {
    options = {
      notCloseLoading: true,
      hideErrorToast: true,
      timeout: 5000,
      resend: true
    }
  } else {
    options.notCloseLoading = true
    options.hideErrorToast = true
    // 延迟超过10秒则网络不通畅
    options.timeout = 5000
    options.resend = true
  }

  // 本机是否有网
  if (!isNetEnable()) {
    $v.hideLoading()
    // 默认的本机断网提示
    if (!failCB) {
      $v.showToast('您正处于离线模式')
    } else {
      failCB()
    }
    return
  }

  lingFetch('common.public', 'check_net', function (result) {
    successCB && successCB()
  }, null, function () {
    $v.hideLoading()
    if (!failCB) {
      $v.showToast('很抱歉，服务器维护中，请稍后再试')
    } else {
      failCB()
    }
  }, options)
}

/**
 * 传入文件路径，判断文件是否为图片
 * @param {String} filePath
 * @return {Boolean}
 */
function isImage(filePath) {
  if (!filePath) {
    return false
  }
  var subEnd = filePath.indexOf('?timestamp')
  if (subEnd > -1) {
    filePath = filePath.substring(0, subEnd)
  }
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png') ||
    filePath.endsWith(
      '.bmp')) {
    return true
  }
  return false
}

function openFile(component, filePath, fileType) {
  if (fileType === 'pic' || isImage(filePath)) {
    if (!(filePath instanceof Array)) {
      filePath = [filePath]
    }

    var photoBrowse = component.$f7.photoBrowser.create({
      photos: filePath,
      // navbarOfText: filePath.split('/')[filePath.split('/').length - 1],
      theme: 'light',
      toolbar: false,
      expositionHideCaptions: true,
      navbar: false
    })
    photoBrowse.open()
  } else {
    cordova.plugins.disusered.open(filePath)
  }
}

function downloadFile(downloadUrl) {
  downloader.get(downloadUrl)
}

// 删除key开头的$$，并将‘,’替换成‘-’
function escapeSelector(selector) {
  var replace$ = selector.replace(/[$]/g, '')
  var replaceDot = replace$.replace(/[,]/g, '-')
  return replaceDot
}

// 增加key开头的$$，并将‘-’替换成‘,’
function unescapeSelector(escapeSelector) {
  escapeSelector = '$$' + escapeSelector
  escapeSelector = escapeSelector.replace(/[-]/g, ',')
  return escapeSelector
}

// 所有需要上传图片的单据的接口都应该有个images接收参数
function uploadImageAndFetch(imageArgsList, api, method, successCB, args, failCB, options) {
  storage.setItem(api + ',fetched', 0)
  var task = plus.uploader.createUpload(config.HOST + '/img/upload', {
    retryInterval: 60,
    timeout: 30,
    retry: 0
  }, function (response, status) {
    var result = JSON.parse(response.responseText)
    if (status == 200 && result.success) {
      if (!options) {
        options = {
          hideLoading: true
        }
      } else {
        options.hideLoading = true
      }

      args.images = result.data

      var isFetching = storage.getItem(api + ',fetched')
      if (isFetching != 1) {
        storage.setItem(api + ',fetched', 1)
        lingFetch(api, method, function (bizResult) {
            // plus.nativeUI.closeWaiting();
            if (!options || !('imgNotShowToast' in options) || !options.imgNotShowToast) {
              showToast(bizResult.msg)
            }
            // app.router.back()
            successCB && successCB(bizResult)
          }, args,
          function (result) {
            // 创建单据失败
            if (!options || !('imgNotCloseLoading' in options) || !options.imgNotCloseLoading) {
              plus.nativeUI.closeWaiting()
            }
            if (!options || !('imgNotShowToast' in options) || !options.imgNotShowToast) {
              showToast(result.msg)
            }
            failCB && failCB(result)
          }, options)
      }
    } else {
      // 图片上传失败
      if (!options || !('imgNotCloseLoading' in options) || !options.imgNotCloseLoading) {
        plus.nativeUI.closeWaiting()
      }
      if (!options || !('imgNotShowToast' in options) || !options.imgNotShowToast) {
        showToast('抱歉，图片未能上传到服务器，操作失败。')
      }

      failCB && failCB(result)
    }
  })

  for (var imageArgs of imageArgsList) {
    // console.info(imageArgs.path)
    task.addFile(imageArgs.path, {
      key: imageArgs.id,
      name: imageArgs.name
    })
  }

  task.start()
}

function uploadMultiImageAndFetch(requestCodeList, successCB, options) {
  storage.setItem('multi,fetched', 0)
  // console.info('requestCodeList:' + JSON.stringify(requestCodeList))
  var task = plus.uploader.createUpload(config.HOST + '/img/multi/upload', {
    retryInterval: 60,
    timeout: 30,
    retry: 0
  }, function (response, status) {
    var result = JSON.parse(response.responseText)
    if (status == 200 && result.success) {
      if (!options) {
        options = {
          hideLoading: true
        }
      } else {
        options.hideLoading = true
      }

      // 拼装fetch_multi
      var multiParams = []
      for (var requestCode of requestCodeList) {
        var imageResult = result.data[requestCode]

        var request = storage.getItem(requestCode)
        var api = request.param.api
        var method = request.param.method
        var args = {}
        if (request.param.args) {
          args = request.param.args
          if (imageResult) {
            args.images = imageResult
          }
        } else if (imageResult) {
          args.images = imageResult
        }

        multiParams.push({
          api: api,
          method: method,
          request_code: requestCode,
          args: args
        })
      }

      // console.info('multiParams:' + JSON.stringify(multiParams))
      if (storage.getItem('multi,fetched') != 1) {
        storage.setItem('multi,fetched', 1)
        fetch_multi(multiParams, function (result) {
          // console.info('fetch_multi')
          for (var requestCode in result.data) {
            var requestResult = result.data[requestCode]

            var request = storage.getItem(requestCode)
            if (request.isSuccess) {
              continue
            }
            if (!requestResult.success) {
              request.isSuccess = false
              request.msg = requestResult.msg
              request.updateTime = getNowFormatDate()
              storage.setItem(requestCode, request)
            } else {
              // 判断是否为死淘记录
              if (request.param.api === 'farm.patrol.biz.death_confirm' && request.param.method === 'add_eliminate_rec') {
                pageControl.makeDoneTag(request.param.args.data['farm_id'], pageControl.DEATH_CONFIRM, request.param.args.data[
                  'date'])
              }

              request.isSuccess = true
              request.msg = requestResult.msg
              request.updateTime = getNowFormatDate()
              storage.setItem(requestCode, request)
            }
          }
          plus.nativeUI.closeWaiting()
          successCB && successCB()
        }, null, options)
      }
    } else {
      // 图片上传失败
      plus.nativeUI.closeWaiting()
      if (!options || !('imgNotShowToast' in options) || !options.imgNotShowToast) {
        showToast('抱歉，图片未能上传到服务器，操作失败。')
      }
      // failCB && failCB(result)
    }
  })

  for (var requestCode of requestCodeList) {
    var request = storage.getItem(requestCode)
    var imageArgsList = request.param.imageArgsList
    var api = request.param.api
    var method = request.param.method

    for (var imageArgs of imageArgsList) {
      // console.info(imageArgs.path)
      task.addFile(imageArgs.path, {
        key: requestCode + '*' + imageArgs.id,
        name: imageArgs.name
      })
    }
  }

  task.start()
}

function timeoutCloseLoading(text, timeout) {
  if (!timeout) {
    timeout = 40000
  }
  $v.showLoading(text || '请求数据中')
  globalLoadingTimeout = setTimeout(function () {
    $v.hideLoading()
  }, timeout)
}

// 拍照压缩，并判断是否存入相册
// options: {'isSaveGallery': '是否保存照片到相册', 'compressDst': '照片压缩路径'}
function takePhoto(successCB, failCB, options) {
  if (!options) {
    options = {
      quality: 50,
      // 后置摄像头
      cameraDirection: Camera.Direction.BACK
    }
  }

  navigator.camera.getPicture(function (imageData) {
    console.log(imageData)
    successCB && successCB()
  }, function (message) {
    console.log(message)
    failCB && failCB()
  }, options)
}

function isLogin() {
  return globalLoginInfo !== null
}

function checkLogin(component) {
  if (!component.$store.state.loginInfo || _.isEmpty(component.$store.state.loginInfo)) {
    $v.customConfirmDialog('您的登录已过期，是否跳转到登录界面。您也可以切换到离线状态，进行离线操作。', '登录提示', ['前往登录'], function () {
      location.reload()
    })
    return false
  } else {
    return true
  }
}

// 用户相关

function getLoginInfo() {
  return JSON.parse(JSON.stringify(globalLoginInfo))
}

function updateLoginInfo(newValue) {
  globalLoginInfo = _.extend(globalLoginInfo, newValue)
}

function getUserId(component) {
  if (checkLogin(component)) {
    return component.$store.state.loginInfo.userId
  }
}

function getCompanyId(component) {
  if (checkLogin(component)) {
    return component.$store.state.loginInfo.selected_company.id
  }
}

function getSvcOrgId(component) {
  if (checkLogin(component)) {
    return component.$store.state.loginInfo.selected_company.svc_org_id
  }
}

function userStorageKey() {
  return getUserId() + ',' + getCompanyId() + ','
}

function switchCompany(companyId, companyName, svgOrgId) {
  var originCompanyId = globalLoginInfo.selected_company.id

  if (companyId && companyName && svgOrgId) {
    globalLoginInfo.selected_company = {
      id: companyId,
      name: companyName,
      svg_org_id: svgOrgId
    }
  } else {
    var selectCompany = _.filter(globalLoginInfo.company_list, function (company) {
      return company.id == companyId
    })
    if (selectCompany.length > 0) {
      // 更新选中的公司
      globalLoginInfo.selected_company = selectCompany[0]
    }
  }

  if (originCompanyId != companyId) {
    lingFetch('common.user', 'change_company', function (result) {
      $v.showToast(result.msg)
    }, {
      company_id: companyId
    })
  }
}

function companyFilter(originList) {
  if (!originList) return []
  var companyId = getCompanyId()
  return _.filter(originList, function (item) {
    return item.company_id == companyId
  })
}

function getNavbarSize(self) {
  console.log('getNavbarSize')
  const isAndroid = self != null ? self.$f7.device.android : getPlatformType() === 'android'
  return isAndroid ? 56 : 44
}

function changeImg(img, imgSelector) {
  // console.log(obj.files[0]);//这里可以获取上传文件的name
  var newsrc = getObjectURL(img)
  $$(imgSelector).attr('src', newsrc)
  return newsrc
}

// 建立一个可存取到该file的url
function getObjectURL(file) {
  var url = null
  // 下面函数执行的效果是一样的，只是需要针对不同的浏览器执行不同的 js 函数而已
  if (window.createObjectURL != undefined) { // basic
    url = window.createObjectURL(file)
  } else if (window.URL != undefined) { // mozilla(firefox)
    url = window.URL.createObjectURL(file)
  } else if (window.webkitURL != undefined) { // webkit or chrome
    url = window.webkitURL.createObjectURL(file)
  }
  return url
}

function uploadAttachment(url, dataMap, successCB, failCB) {
  var formData = new FormData()
  var xhr = new XMLHttpRequest()

  xhr.onreadystatechange = function () {
    plus.nativeUI.closeWaiting()
    globalLoadingTimeout && clearTimeout(globalLoadingTimeout)
    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
      var result = JSON.parse(xhr.responseText)
      successCB && successCB(result)
    } else {
      failCB && failCB()
      showToast('上传失败')
    }
  }
  for (var key in dataMap) {
    formData.append(key, dataMap[key])
  }
  xhr.open('POST', url, true)
  xhr.send(formData)

  timeoutCloseLoading('上传中，请您稍后', 40000)
}

function getScreenHeight() {
  var screenHeight = window.localStorage.getItem('$$height') || 0
  return screenHeight > document.documentElement.clientHeight ? screenHeight : document.documentElement.clientHeight
}

/* 命名转换
** author: jiawen.ling@yunside.com
** 小驼峰命名： breedingFilter 主要用于js函数、方法的命名
** 帕斯卡命名： BreedingFilter 主要用于js es6类写法的命名
** 下划线命名： breeding_filter 主要用于python中的字段命名
** 破折号命名： breeding-filter 主要用于css中class的命名

** 小驼峰转下划线：
** camelToUnder
** param: (camel: string)
** return: (under: string)

** 下划线转小驼峰：
** underToCamel
** param: (under: string)
** return: (camel: string)
**

** 小驼峰转帕斯卡：
** camelToPascal
** param: (camel: string)
** return: (pascal: string)

** 下划线转小驼峰：
** PascalToCamel
** param: (pascal: string)
** return: (camel: string)
**

** 帕斯卡转下划线：
** pascalToUnder
** param: (pascal: string)
** return: (under: string)

** 下划线转帕斯卡：
** underToPascal
** param: (under: string)
** return: (pascal: string)

** 下划线转破折号：
** underToHyphen
** param: (under: string)
** return: (hyphen: string)

** 破折号转下划线：
** hyphenToUnder
** param: (hyphen: string)
** return: (under: string)
*/



function camelToUnder(camel) {
  return camel.replace(/[A-Z]/g, function (match) {
    return "_" + match.toLowerCase();
  });
}

function underToCamel(under) {
  return under.replace(/([^_])(?:_+([^_]))/g, function ($0, $1, $2) {
    return $1 + $2.toUpperCase();
  });
}

function objUnderToCamel(target) {
  if (target instanceof Array) {
    for (var item of target) {
      objUnderToCamel(item)
    }

  } else if (target instanceof Object) {
    var keys = _.keys(target)
    for (var key of keys) {
      target[underToCamel(key)] = target[key]
      if (underToCamel(key) !== key) {
        delete target[key]
      }
      // 处理对象中的对象或数组
      objUnderToCamel(target[underToCamel(key)])
    }
  }
}

function objCamelToUnder(target) {
  if (target instanceof Array) {
    for (var item of target) {
      objCamelToUnder(item)
    }

  } else if (target instanceof Object) {
    var keys = _.keys(target)
    for (var key of keys) {
      target[camelToUnder(key)] = target[key]
      if (camelToUnder(key) !== key) {
        delete target[key]
      }
      // 处理对象中的对象或数组
      objCamelToUnder(target[camelToUnder(key)])
    }
  }
}

function camelToPascal(camel) {
  return camel[0].toUpperCase() + camel.slice(1);
}

function pascalToCamel(pascal) {
  return pascal[0].toLowerCase() + camel.slice(1);
}

function pascalToUnder(pascal) {
  return camelToUnder(pascal).slice(1);
}

function underToPascal(under) {
  return camelToPascal(underToCamel(under));
}

function underToHyphen(under) {
  return under.replace(/_/g, '-');
}

function hyphenToUnder(hyphen) {
  return hyphen.replace(/-/g, '_');
}

function back(self, url) {
  if (!url) {
    self.$f7.views.main.router.back({
      ignoreCache: true,
      force: true,
      reload: true,
      reloadPrevious: true
    })
  } else {
    self.$f7.views.main.router.back({
      ignoreCache: true,
      force: true,
      reload: true,
      reloadPrevious: true,
      url
    })
  }

}

function navigate(self, url, options) {
  self.$f7.views.main.router.navigate(url, options)
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function uniqueId() {
  return new Date().getTime() + (parseInt(Math.random() * 100000) + '')
}

var eventDict = {};

function registerEvent(eventName, listener) {
  if (eventDict[eventName]) {
    return;
  }
  document.addEventListener(eventName, listener, false);
  eventDict[eventName] = listener;
}

function unregisterEvent(eventName) {
  if (!eventDict[eventName]) {
    return;
  }
  document.removeEventListener(eventName, eventDict[eventName], false);
  delete eventDict[eventName];
}

function hasEvent(eventName) {
  if (eventDict[eventName]) {
    return true;
  }
  return true;
}

function exitApp() {
  navigator.app.exitApp();
}

function backToExit(self, time) {
  if (self.$f7router.history.length <= 1) {
    if (self.$u.hasEvent("backbutton")) {
      var toast = self.$f7.toast.create({
        text: "再按一次退出",
        position: 'center',
        closeTimeout: 1200
      });
      toast.open();

      self.$u.unregisterEvent("backbutton");
      self.$u.registerEvent("backbutton", self.$u.exitApp);
    }
    setTimeout(() => {
      self.$u.unregisterEvent("backbutton");
      self.$u.registerEvent("backbutton", self.clickBackBtn);
    }, time);
  } else {
    self.$f7router.back();
    self.$f7.popup.close()
  }
  // 关闭所有弹出层
  // self.$f7.popup.close()
}

function sizeChange(limit) {
  var size = "";
  if (limit < 0.1 * 1024) { //小于0.1KB，则转化成B
    size = limit.toFixed(2) + "B"
  } else if (limit < 0.1 * 1024 * 1024) { //小于0.1MB，则转化成KB
    size = (limit / 1024).toFixed(2) + "KB"
  } else if (limit < 0.1 * 1024 * 1024 * 1024) { //小于0.1GB，则转化成MB
    size = (limit / (1024 * 1024)).toFixed(2) + "MB"
  } else { //其他转化成GB
    size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB"
  }

  var sizeStr = size + ""; //转成字符串
  var index = sizeStr.indexOf("."); //获取小数点处的索引
  var dou = sizeStr.substr(index + 1, 2) //获取小数点后两位的值
  if (dou == "00") { //判断后两位是否为00，如果是则删除00                
    return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
  }
  return size;
}

function getTimeWithZone(time, zone) {
  var localTime = time.getTime();
  var localOffset = time.getTimezoneOffset() * 60000; //获得当地时间偏移的毫秒数
  var utc = localTime + localOffset; //utc即GMT时间
  var offset = zone;
  var hawaii = utc + (3600000 * offset);
  var nd = new Date(hawaii);
  return nd
}

export default {
  getTimeWithZone: getTimeWithZone,
  sizeChange: sizeChange,
  registerEvent: registerEvent,
  unregisterEvent: unregisterEvent,
  hasEvent: hasEvent,
  exitApp: exitApp,
  backToExit: backToExit,

  getFlatternDistance: getFlatternDistance,
  compareVersion: compareVersion,
  getNowTime: getNowTime,
  getLastDateStr: getLastDateStr,
  getBetweenDays: getBetweenDays,
  getDateStr: getDateStr,
  getStrDate: getStrDate,
  getSimpleText: getSimpleText,
  getPlatformType: getPlatformType,
  isNetEnable: isNetEnable,
  checkNetEnable: checkNetEnable,
  isImage: isImage,
  openFile: openFile,
  downloadFile: downloadFile,
  takePhoto: takePhoto,
  getNavbarSize: getNavbarSize,
  getScreenHeight: getScreenHeight,

  getUserId: getUserId,
  getCompanyId: getCompanyId,
  switchCompany: switchCompany,
  getLoginInfo: getLoginInfo,
  updateLoginInfo: updateLoginInfo,
  checkLogin: checkLogin,
  isLogin: isLogin,

  camelToUnder: camelToUnder,
  underToCamel: underToCamel,
  camelToPascal: camelToPascal,
  pascalToCamel: pascalToCamel,
  pascalToUnder: pascalToUnder,
  underToPascal: underToPascal,
  underToHyphen: underToHyphen,
  hyphenToUnder: hyphenToUnder,
  objUnderToCamel,
  objCamelToUnder,
  back,
  navigate,
  deepClone,
  uniqueId,
}