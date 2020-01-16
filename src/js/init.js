// 初始化rem设置
(function(designWidth, maxWidth) {
    var doc = document,
        win = window,
        docEl = doc.documentElement,
        remStyle = document.createElement('style'),
        tid

    function refreshRem() {
        var width = docEl.getBoundingClientRect().width
        maxWidth = maxWidth || 540
        width > maxWidth && (width = maxWidth)
        var rem = (width / designWidth).toFixed(2)
        remStyle.innerHTML = 'html{font-size:' + rem + 'px;}'
    }

    if (docEl.firstElementChild) {
        docEl.firstElementChild.appendChild(remStyle)
    } else {
        var wrap = doc.createElement('div')
        wrap.appendChild(remStyle)
        doc.write(wrap.innerHTML)
        wrap = null
    }
    // 要等 wiewport 设置好后才能执行 refreshRem，不然 refreshRem 会执行2次；
    refreshRem()

    //     win.addEventListener("resize", function () {
    //         clearTimeout(tid); //防止执行两次
    //         tid = setTimeout(refreshRem, 300);
    //     }, false);

    win.addEventListener('pageshow', function(e) {
        if (e.persisted) { // 浏览器后退的时候重新计算
            clearTimeout(tid)
            tid = setTimeout(refreshRem, 300)
        }
    }, false)

    if (doc.readyState === 'complete') {
        doc.body.style.fontSize = '14px'
    } else {
        doc.addEventListener('DOMContentLoaded', function(e) {
            doc.body.style.fontSize = '14px'
        }, false)
    }
})(750, 2100)

// var getRegistrationID = function () {
//   window.JPush.getRegistrationID(onGetRegistrationID);
// };

// var onGetRegistrationID = function (data) {
//   try {
//     alert("JPushPlugin:registrationID is " + data);
//     if (data.length == 0) {
//       var t1 = window.setTimeout(getRegistrationID, 1000);
//     }
//   } catch (exception) {
//     console.log(exception);
//   }
// };

// var initiateUI = function () {
//   try {
//     window.JPush.init();
//     window.JPush.setDebugMode(true);
//     getRegistrationID();
//     if (device.platform != "Android") {
//       window.JPush.setApplicationIconBadgeNumber(0);
//     }
//   } catch (exception) {
//     console.log(exception);
//   }
// }

function init() {
    // 判断安卓
    if (cordova.platformId == 'android') {
        StatusBar.overlaysWebView(true);
        // StatusBar.backgroundColorByHexString('#33000000');
    }
    StatusBar.styleDefault();
    // 开启后台模式
    // cordova.plugins.backgroundMode.enable();
    // 极光推送
    // document.addEventListener("jpush.receiveRegistrationId", function (event) {
    //   alert("receiveRegistrationId" + JSON.stringify(event));
    // }, false)
    // initiateUI();
    // 极光聊天
    // JMessage.init({
    //   isOpenMessageRoaming: true
    // })
    // JMessage.setDebugMode({
    //   enable: true
    // })
    var storageProxy = {}
        // 持久存储
    storageProxy.setItem = function(storageKey, storageValue) {
        return new Promise(function(resolve, reject) {
            NativeStorage.setItem(storageKey, storageValue, function(result) {
                resolve(result)
            }, function(result) {
                reject(result)
            })
        })
    }

    storageProxy.getItem = function(storageKey, defaultValue) {
        if (!defaultValue) {
            defaultValue = null
        }
        return new Promise(function(resolve, reject) {
            NativeStorage.getItem(storageKey, function(result) {
                resolve(result)
            }, function(result) {
                if (result.code === 2) {
                    resolve(defaultValue)
                } else {
                    console.log('get the value of key: ' + storageKey + 'error, please check')
                    reject(result)
                }
            })
        })
    }

    storageProxy.remove = function(storageKey) {
        return new Promise(function(resolve, reject) {
            NativeStorage.remove(storageKey, function() {
                resolve()
            }, function(error) {
                // {code: '' , exception: ''}
                reject(error)
            })
        })
    }

    storageProxy.clear = function() {
        return new Promise(function(resolve, reject) {
            NativeStorage.clear(function() {
                resolve()
            }, function(error) {
                reject(error)
            })
        })
    }

    window.storageProxy = storageProxy
}



document.addEventListener('deviceready', init, false)

window.onload = function() {
    // 主题颜色
    if (envConfig.env === 'development' || envConfig.env === 'jdg') {
        document.getElementsByTagName('body')[0].className += 'color-theme-green'
    } else if (envConfig.env === 'production') {
        document.getElementsByTagName('body')[0].className += 'color-theme-blue'
    } else {
        document.getElementsByTagName('body')[0].className += 'color-theme-orange'
    }
    // localstorage存储高度
    window.localStorage.setItem('$$height', document.documentElement.clientHeight)
}

// 热更新
// document.addEventListener("resume", function () {
//   codePush.sync(null, {
//     updateDialog: {
//       appendReleaseDescription: true,
//       descriptionPrefix: '更新内容:\n',
//       mandatoryContinueButtonLabel: '更新',
//       mandatoryUpdateMessage: '请您更新资源',
//       optionalIgnoreButtonLabel: '忽略',
//       optionalInstallButtonLabel: '更新',
//       optionalUpdateMessage: '',
//       updateTitle: '提示',
//     }, installMode: InstallMode.IMMEDIATE
//   });
// });

// 网络状态监控
window.ononline = function() {
    console.log('网络已恢复')
}

window.onoffline = function() {
    console.log('您已离线')
}

import _ from 'underscore'
window._ = _

import md5 from 'blueimp-md5'
window.md5 = md5

// import envConfig from './config'
// window.envConfig = envConfig

function backRefresh(self) {
    app.router.back({
        ignoreCache: true,
        force: true,
        reload: true,
        reloadPrevious: true
    })
}

function getCurrentRoute(self) {
    var history = self.$f7.view.current.history
    return history[history.length - 1]
}

function exitApp() {
    navigator.app.exitApp();
}

function checkVersion(finishCB, showLatestTip) {
    console.log('checkVersion')
    navigator.splashscreen.hide();
    var self = this
    const platform = self.$u.getPlatformType()

    self.filePath = function(version) {
        return cordova.file.cacheDirectory + 'hd_terminal_breeding_' + platform + '_' + version + '.apk'
    }

    self.checkExistFile = function(version, okCallback, failCallback) {

        const path = self.filePath(version)
        window.resolveLocalFileSystemURL(path, function(root) {
            okCallback(path)
        }, function(err) {
            failCallback()
        });
    }

    // 资源更新需要提示。整包安装不需要
    self.installFile = function(path) {
        if (path.indexOf('file://') == 0) {
            path = path.substring(7)
        }
        cordova.plugins.fileOpener2.open(
            path,
            'application/vnd.android.package-archive', {
                success: function() {
                    console.log('file opened successfully');
                },
                error: function(e) {
                    console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                    self.$v.showToast(self, '抱歉，安装失败。' + e.message)
                },
            }
        );
    }

    self.downFile = function(downloadUrl, version) {
        console.info(downloadUrl)
            // 禁用返回
        self.$store.dispatch('disableBack')
        self.$v.showLoading(self, '下载中，请稍后')

        var fileTransfer = new FileTransfer();
        var fileURL = self.filePath(version)

        fileTransfer.download(
            downloadUrl,
            fileURL,
            function(entry) {
                self.$v.hideLoading(self)
                console.log("Successful download...");
                console.log("download complete: " + entry.toURL());
                self.installFile(fileURL)
            },
            function(error) {
                self.$v.hideLoading(self)
                console.log("download error source " + error.source);
                console.log("download error target " + error.target);
                console.log("upload error code" + error.code);
            },
            null, // or, pass false
            {
                // chunkedMode: false, headers: { Connection: "close" }
            }
        );
    }

    self.downloadDirect = function(data) {
        self.downFile(data.update_url, data.version)
    }

    self.fullUpdate = function(data) {
        var tip = data.tip || '升级'
        var description = data.description || '您有新版本，请升级'
        const cancelCB = function() {
            finishCB && finishCB()
        }
        const successCB = function() {
            self.downFile(data.update_url, data.latest_version)
        }
        if (data.force_version_update) {
            self.$v.customConfirmDialog(self, description, tip, ['下载'], successCB, null, true)
        } else {
            self.$v.customConfirmDialog(self, description, tip, ['下载'], [cancelCB, successCB])
        }

    }

    // 检查整包更新

    if (!self.$u.isNetEnable()) {
        return finishCB && finishCB()
    }

    cordova.getAppVersion.getVersionNumber(function(version) {
        console.log(version)
        lingFetch(self, 'dl.base', 'app_check_version', function(result) {

            var data = result.data
                // data.description = data.description.replace(/\n/g, '<br>')
                // data.resource_description = data.resource_description.replace(/\n/g, '<br>')
                // 整包升级
            if (self.$u.compareVersion(data.latest_version, version)) {
                // console.info('data.latest_version:' + data.latest_version)
                // 检查本地是否已存在更新文件
                self.checkExistFile(data.latest_version, function(path) {
                    if (data.force_version_update) {
                        self.$v.customConfirmDialog(self, data.description, '离线更新', ['安装'],
                            function() {
                                self.installFile(path)
                            }, null, true)
                    }

                }, function() {
                    self.fullUpdate(data)
                })
            } else if (showLatestTip) {
                self.$v.showToast(self, '当前版本已是最新')
            } else {
                finishCB && finishCB()
            }

        }, {
            terminal_type: platform,
            version: {
                version,
            }
        }, function() {
            finishCB && finishCB()
        }, {
            toastText: '检查更新'
        })
    })

}

window.checkVersion = checkVersion

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
// let time1 = new Date().Format("yyyy-MM-dd");
// let time2 = new Date().Format("yyyy-MM-dd HH:mm:ss");

Date.prototype.Format = function(fmt) { //author: meizz
    let o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

function logout(self) {
    // app.router.history = []
    // app.router.clearPreviousHistory()
    // 清除互动信息
    self.$store.dispatch("updateInteractInfo", {});
    // 清除时间线信息
    self.$store.dispatch("updateTimeList", {});
    // 清除用户信息
    storageProxy.getItem("userLoginInfo").then(function() {
        storageProxy.setItem("userLoginInfo", {});
    });
    self.$store.dispatch("updateTimeList", {});
    // 清除页面数据缓存
    // deleteAllPageCache()

    self.$u.navigate(self, '/login?notFirst=true', {
        clearPreviousHistory: true,
        ignoreCache: true,
    })
}

window.logout = logout