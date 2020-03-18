import {
  resolve
} from "path";
import {
  reject
} from "q";
import {
  fail
} from "assert";

function makeGetUrl(api, method, args) {
  var sign = ''
  if (args != null) {
    sign = signParam({
      api: api,
      method: method,
      args: args
    })
  } else {
    sign = signParam({
      api: api,
      method: method
    })
  }

  var requestParam = {
    sign: sign,
    api: api,
    method: method,
    app_key: envConfig.APP_KEY,
    device_id: envConfig.DEVICE_ID
  }

  if (args != null) {
    requestParam.args = JSON.stringify(args)
  }

  return envConfig.GATEWAY + '?' + app.utils.serializeObject(requestParam)
}

function keySort(obj) {
  // 字典
  if (_.isObject(obj) && !_.isArray(obj)) {
    var newKeys = _.keys(obj).sort()
    var newObj = {}
    for (var i = 0; i < newKeys.length; i++) {
      var key = newKeys[i]
      if (_.isObject(obj[key])) {
        newObj[key] = keySort(obj[key])
      } else {
        newObj[key] = obj[key]
      }
    }
    return newObj
  }
  // 数组
  else if (_.isArray(obj)) {
    var newList = []
    for (var item of obj) {
      if (_.isObject(item)) {
        item = keySort(item)
      }
      newList.push(item)
    }
    return newList
  }
}

function signParam(param) {
  var APP_KEY = envConfig.APP_KEY,
    APP_SECRET = envConfig.APP_SECRET,
    DEVICE_ID = envConfig.DEVICE_ID
  if (param.app_key == null && APP_KEY != null) {
    param.app_key = APP_KEY
  }
  if (param.device_id == null && DEVICE_ID != null) {
    param.device_id = DEVICE_ID
  }
  var sortParams = _.sortBy(_.pairs(param), function (item) {
    return item[0]
  })
  var concatParms = _.map(sortParams, function (item) {
    var key = item[0]
    var value = item[1]
    if (typeof (value) === 'object') {
      value = keySort(value)
      value = JSON.stringify(value).replace(/: /g, ':')
      value = value.replace(/, /g, ',')
    }
    return key + '=' + value
  })
  var concatStr = concatParms.join('&')
  var saltConcat = (concatStr + APP_SECRET)
  // console.info('saltConcat:' + saltConcat.substring(saltConcat.length - 3000, saltConcat.length))
  return md5(saltConcat)
}

var requestMaxCount = 3
var requestCount = 0

function fetchMulti(self, apiList, success, error, options) {
  if (!self.$u.isNetEnable()) {
    self.$v.showToast(self, '您已离线')
    return false
  }

  requestCount += 1
  var APP_KEY = envConfig.APP_KEY,
    APP_SECRET = envConfig.APP_SECRET,
    DEVICE_ID = envConfig.DEVICE_ID,
    GATEWAY = envConfig.GATEWAY
  if (!apiList instanceof Array) {
    return
  }

  var requestParam = {}
  for (var item of apiList) {
    item.app_key = APP_KEY
    item.sign = signParam(item)
  }
  apiList = keySort(apiList)
  requestParam.multi = JSON.stringify(apiList)
  requestParam.device_id = DEVICE_ID

  // 控制是否显示loading提示
  if (!options || !options.hideLoading) {
    self.$v.showLoading(self, options && options.toastText || '请求数据中')
  }
  var param = {
    url: GATEWAY,
    method: 'POST',
    data: requestParam,
    timeout: options && options.timeout || 50000,
    async: options && options.async || true,
    xhrFields: {
      withCredentials: true
    },
    success: function (data, status, xhr) {
      // 重置请求次数
      requestCount = 0
      // alert('返回：' + data)
      data = JSON.parse(data)

      // 关闭loading定时任务
      // globalLoadingTimeout && clearTimeout(globalLoadingTimeout)

      // 隐藏loading则不执行关闭方法
      if (!options || !options.notCloseLoading) {
        self.$v.hideLoading(self)
      }
      if (data.success && success != null && success instanceof Function) {
        success(data, status, xhr)
      } else if (!data.success) {
        data.msg && self.$v.showToast(self, data.msg, 'always')

        // session失效则进行提示跳转
        if (data.error_code === 'user.not.login') {

          return self.$v.customConfirmDialog(self, '您的登录已过期，是否跳转到登录界面。', '登录提示', ['前往登录'],
            function () {
              // Fingerprint.isAvailable(function () {
              self.$u.navigate(self, '/login', {
                clearPreviousHistory: true
              })
              // }, function () {
              //   self.$u.navigate(self, '/login-input/', {
              //     clearPreviousHistory: true
              //   })
              // });

            })
        }

        if (error != null && error instanceof Function) {
          error(data, status, xhr)
        }
      }
    },
    error: function (xhr, status) {
      // 关闭loading定时任务
      // clearTimeout(globalFingerTimeout)
      if (xhr.response === '') {
        // 如果网络异常，自动切换到正式环境，进行初步纠错
        // envConfig.switchEnv('dev')
        // self.$v.showToast(self, '当前网络有问题，已尝试重定位到正确的地址')

        if (!options || !('resend' in options) || !options.resend) {
          requestCount = 0
          self.$v.hideLoading(self)

          self.$v.showToast(self, options && options.errotToastText || '抱歉，网络开了小差，请稍后再试')

          return console.info('请求失败，请检查网络环境')
        } else if (requestCount < requestMaxCount) {
          console.info('错误信息为空，可能是网络异常，重连。。。')
          fetchMulti(JSON.parse(originApiListJson), success, error)
        } else {
          requestCount = 0
          self.$v.hideLoading(self)
          self.$v.showToast(self, options && options.errotToastText || '抱歉，网络开了小差，请稍后再试')
          console.info('请求失败，请检查网络环境')
        }
      }

      self.$v.hideLoading(self)

      var data = JSON.parse(xhr.response)
      data.msg && self.$v.showToast(self, data.msg, 'always')

      // session失效则进行提示跳转
      if (data.error_code === 'user.not.login') {
        return self.$v.customConfirmDialog(self, '您的登录已过期，是否跳转到登录界面。', '登录提示', ['前往登录'], function () {
          self.$u.navigate(self, '/login', {
            clearPreviousHistory: true
          })
        })
      }

      if (error != null && error instanceof Function) {
        error(data)
      }
    }
  }

  self.$request(param)
}

function getFetchData(api, method, args) {
  var sign = ''
  if (args != null) {
    sign = signParam({
      api: api,
      method: method,
      args: args
    })
  } else {
    sign = signParam({
      api: api,
      method: method
    })
  }

  var requestParam = {}
  requestParam.api = api
  requestParam.method = method
  if (args != null) {
    args = keySort(args)
    requestParam.args = args
  }

  requestParam.device_id = envConfig.DEVICE_ID
  requestParam.app_key = envConfig.APP_KEY
  requestParam.sign = sign

  return requestParam
}

/**
 * 参数api,method,success必填项，其余按需选填
 */
function lingFetch(self, api, method, success, args, error, options) {
  if (!self.$u.isNetEnable()) {
    self.$v.showToast(self, '您已离线')
    return false
  }
  requestCount += 1

  var APP_KEY = envConfig.APP_KEY,
    APP_SECRET = envConfig.APP_SECRET,
    DEVICE_ID = envConfig.DEVICE_ID,
    GATEWAY = envConfig.GATEWAY

  var sign = ''
  if (args != null) {
    sign = signParam({
      api: api,
      method: method,
      args: args
    })
  } else {
    sign = signParam({
      api: api,
      method: method
    })
  }
  var requestParam = {}
  requestParam.api = api
  requestParam.method = method
  if (args != null) {
    args = keySort(args)
    requestParam.args = JSON.stringify(args)
  }

  requestParam.device_id = DEVICE_ID
  requestParam.app_key = APP_KEY
  requestParam.sign = sign
  // 控制是否显示loading提示

  if (!options || !options.hideLoading) {
    self.$v.showLoading(self, options && options.toastText || '请求数据中')
  }
  var param = {
    url: GATEWAY,
    method: 'POST',
    data: requestParam,
    timeout: options && options.timeout || 20000,
    xhrFields: {
      withCredentials: true
    },
    success: function (data, status, xhr) {
      data = JSON.parse(data)

      // 关闭loading定时任务
      // globalFingerTimeout && clearTimeout(globalFingerTimeout)

      // 隐藏loading则不执行关闭方法
      if (!options || !options.notCloseLoading) {
        self.$v.hideLoading(self)
      }

      if (data.success && success != null && success instanceof Function) {
        success(data, status, xhr)
      } else if (!data.success) {
        if (error != null && error instanceof Function && (!options || !options.netError)) {
          error(data, status, xhr)
        } else {
          data.msg && self.$v.showToast(self, data.msg, 'always')
        }
      }
    },
    error: function (xhr, status) {
      // 关闭loading定时任务
      // clearTimeout(globalFingerTimeout)

      if (xhr.response === '') {
        // 如果网络异常，自动切换到正式环境，进行初步纠错
        // envConfig.switchEnv('dev')
        // self.$v.showToast(self, '当前网络有问题，已尝试重定位到正确的地址')

        // 判断是否重发,默认不重发
        if (!options || !('resend' in options) || !options.resend) {
          requestCount = 0
          self.$v.hideLoading(self)

          // 判断是否需要存储请求
          if (options && options.saveRequestName) {
            saveToStorage()
            // backRefresh()
          } else {
            if (!options || !options.hideErrorToast) {
              self.$v.showToast(self, options && options.errotToastText || '抱歉，网络开了小差，请稍后再试')
              self.$v.hideLoading(self)
            }
          }

          console.info('请求失败，请检查网络环境')
          return error && error()
        } else if (requestCount < requestMaxCount) {
          console.info('错误信息为空，可能是网络异常，重连。。。')
          lingFetch(api, method, success, args, error, options)
        } else {
          requestCount = 0
          self.$v.hideLoading(self)
          // self.$v.showToast(self, options && options.errotToastText || '抱歉，网络开了小差，请稍后再试')

          // 判断是否需要存储请求
          if (options && options.saveRequestName) {
            saveToStorage()
            // backRefresh()
          } else {
            if (!options || !options.hideErrorToast) {
              self.$v.showToast(self, options && options.errotToastText || '抱歉，网络开了小差，请稍后再试')
              self.$v.hideLoading(self)
            }
          }
          console.info('请求失败，请检查网络环境')
          return error && error()
        }
      } else {
        // 网络通信正常
        self.$v.hideLoading(self)

        var data = JSON.parse(xhr.response)

        // session失效则进行提示跳转
        if (data.error_code === 'user.not.login') {
          console.log('user.not.login')
          return self.$v.customConfirmDialog(self, '您的登录已过期，是否跳转到登录界面。', '登录提示', ['前往登录'], function () {
            // Fingerprint.isAvailable(function () {
            self.$u.navigate(self, '/login', {
              ignoreCache: true,
              clearPreviousHistory: true
            })
          })
        }

        if (!options || !options.hideErrorToast) {
          data.msg && self.$v.showToast(self, data.msg, 'always')
        }

        if (error != null && error instanceof Function) {
          error(data)
        }
      }
    }
  }
  if (options && 'async' in options) {
    param.async = options.async
  }
  self.$request.crossDomain = true
  self.$request(param)
}

function uploadImgAndFetch(self, imageArgsList, api, method, successCB, args, failCB, options) {
  // 如果上传列表为空则直接新家单据
  if (!imageArgsList || imageArgsList.length == 0) {
    return lingFetch(self, api, method, successCB, args, failCB, options)
  }
  self.$v.showLoading(self, '图片上传中。。。')
  if (!imageArgsList instanceof Array) {
    let toArray = []
    for (let key of _.keys(imageArgsList)) {
      toArray.push({
        id: key,
        path: imageArgsList[key]
      })
    }
    imageArgsList = toArray
  }
  const promiseList = []
  const imgData = new FormData()
  var xhr = new XMLHttpRequest();
  for (let i = 0; i < imageArgsList.length; i++) {

    let imageArgs = imageArgsList[i]
    // 若是已经创建的图片（编辑）则跳过
    if (imageArgs.isExist) {
      continue
    }
    let fileUrl = imageArgs.path
    let fileName = imageArgs.name
    let fileId = imageArgs.id
    // 解析图片
    promiseList.push(function (fileUrl, fileName, fileId) {
      return new Promise((resolve, reject) => {
        window.resolveLocalFileSystemURL(fileUrl, fileEntry => {
          fileEntry.file(file => {
            let reader = new FileReader();
            reader.onloadend = e => {
              const theFile = new Blob([e.target.result], {
                type: file.type
              });
              imgData.append(fileId, theFile, fileName);
              resolve()
            };
            reader.readAsArrayBuffer(file);
          });
        });
      })
    }(fileUrl, fileName, fileId))

  }


  // if (promiseList.length > 0) {
  Promise.all(promiseList).then(() => {
    if (!options) {
      options = {
        hideLoading: true
      }
    } else {
      options.hideLoading = true
    }

    const fetchData = getFetchData(api, method, args)
    imgData.append('request_info_json', JSON.stringify(fetchData))

    // 是否删除图片
    if (options && 'deletePhoto' in options && options.deletePhoto.length > 0) {
      imgData.append('delete_photo_ids', JSON.stringify(options['deletePhoto']))
    }

    // cordovaFetch(envConfig.HOST + '/img/upload/breeding', {
    //   method: 'POST',
    //   body: imgData,
    // })
    //   .then(function (response) {
    //     self.$v.hideLoading(self)
    //     if (response.status == 200) {
    //       return response.json()
    //     } else {
    //       return JSON.parse(response.statusText)
    //     }
    //   }).then(function (data) {
    //     if (!options || !'imgNotShowToast' in options || !options.imgNotShowToast) {
    //       self.$v.showToast(self, data.msg)
    //     }
    //     if (data.success) {
    //       successCB && successCB(data)
    //     } else {
    //       failCB && failCB(data)
    //     }
    //   }).catch(function (ex) {
    //     console.log('parsing failed', ex)
    //   })

    xhr.timeout = 20000
    xhr.open('POST', envConfig.HOST + '/img/upload/breeding', true);
    // xhr.withCredentials = true
    xhr.send(imgData)

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        self.$v.hideLoading(self)
        var result = JSON.parse(xhr.responseText)
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
          if (!options || !'imgNotShowToast' in options || !options.imgNotShowToast) {
            self.$v.showToast(self, result.msg)
          }

          if (result.success) {
            successCB && successCB(result)
          } else {
            failCB && failCB(result)
          }
        } else {
          if (!options || !'imgNotCloseLoading' in options || !options.imgNotCloseLoading) {
            self.$v.hideLoading(self)
          }
          if (!options || !'imgNotShowToast' in options || !options.imgNotShowToast) {
            self.$v.showToast(self, result.msg)
          }
          failCB && failCB()
        }
      }
    }

    xhr.ontimeout = function () {
      self.$v.showToast('请求超时')
      self.$v.hideLoading(self)
    }

  }).catch((info) => {
    self.$v.showToast(self, info)
    self.$v.hideLoading(self)
  })

  xhr.ontimeout = function () {
    self.$v.showToast('请求超时')
    self.$v.hideLoading(self)
  }

}

// function uploadImgAndFetch(self, imageArgsList, api, method, successCB, args, failCB, options) {
//   console.log('uploadImgAndFetch')
//   if (_.isObject(imageArgsList)) {
//     let toArray = []
//     for (let key of _.keys(imageArgsList)) {
//       toArray.push({
//         id: key,
//         path: imageArgsList[key]
//       })
//     }
//     imageArgsList = toArray
//   }
//   const promiseList = []
//   for (let i = 0; i < imageArgsList.length; i++) {
//     let imageArgs = imageArgsList[i]
//     let fileUrl = imageArgs.path
//     let uploadOptions = { fileKey: imageArgs.id, fileName: imageArgs.name, chunkedMode: false, headers: { Connection: "close" } }
//     let ft = new FileTransfer()

//     // 构建Promise
//     promiseList.push(function () {
//       return new Promise((resolve, reject) => {
//         self.$v.showLoading(self, '图片上传中，请稍后')
//         ft.upload(fileUrl, encodeURI(envConfig.HOST + '/img/upload/breeding'), (result) => {
//           // 某个文件上传成功的回调
//           resolve(JSON.parse(result.response))
//         }, (result) => {
//           // 某个文件上传失败的回调
//           reject('附件 ' + options.fileName + ',上传失败')
//         }, uploadOptions)
//       })
//     }(fileUrl, uploadOptions, ft))
//   }
//   Promise.all(promiseList).then((results) => {

//     if (!options) {
//       options = {
//         hideLoading: true
//       }
//     } else {
//       options.hideLoading = true
//     }

//     console.log(results)
//     let images = {}
//     for (let result of results) {
//       images = _.extend(images, result.data)
//     }
//     console.log(images)
//     args.images = images


//     lingFetch(self, api, method, (bizResult) => {
//       if (!options || !'imgNotShowToast' in options || !options.imgNotShowToast) {
//         self.$v.showToast(self, bizResult.msg)
//       }
//       successCB && successCB(bizResult)
//     }, args, (bizResult) => {
//       // 创建单据失败
//       if (!options || !'imgNotCloseLoading' in options || !options.imgNotCloseLoading) {
//         self.$v.hideLoading(self)
//       }
//       if (!options || !'imgNotShowToast' in options || !options.imgNotShowToast) {
//         self.$v.showToast(self, bizResult.msg)
//       }
//       failCB && failCB(bizResult)
//     }, options)
//   }).catch((info) => {
//     self.$v.showToast(self, info)
//   })

// }

window.lingFetch = lingFetch
window.fetchMulti = fetchMulti
window.uploadImgAndFetch = uploadImgAndFetch
window.getFetchData = getFetchData