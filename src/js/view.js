var toastCenter, toastBottom

function showToast(component, text, type) {
  // 第一次调用则初始化
  if (!toastCenter) {
    toastCenter = component.$f7.toast.create({
      name: text,
      position: 'center',
      closeTimeout: 2000
    })
  }

  if (!toastBottom && type === 'always') {
    var toastBottom = component.$f7.toast.create({
      name: 'tip',
      position: 'bottom',
      closeButton: true,
      closeButtonText: '确认'
    })
  }

  if (!type) {
    toastCenter.$el.find('div[class="toast-text"]').html(text)
    setTimeout(function () {
      toastCenter.open()
    }, 100)
  } else if (type === 'always') {
    toastBottom.$el.find('div[class="toast-text"]').html(text)
    setTimeout(function () {
      toastBottom.open()
    }, 100)
  }
}

// 只有一个确认按钮的提示框
function customAlertButton(component, text, title, button, okCallBack) {
  title = title.substring(0, 12)

  var isFlow = text.length > 80
  text = text.substring(0, 80)
  if (isFlow) {
    text += '...'
  }
  var dialog = component.$f7.dialog.create({
    name: text,
    title: title,
    destroyOnClose: true,
    buttons: [{
      name: button
    }],
    onClick: function (el, index) {
      okCallBack && okCallBack()
    }
  })
  dialog.open()
}

// text 提示内容
// title 标题
// buttons 按钮的数组：长度小于2时，默认有个取消按钮。
// callbacks: 按钮从左到右依次的回调事件
// type: 是否需要preloader提示
// force: 是否强制点击
function customConfirmDialog(component, text, title, buttons, callbacks, type, force, listContent) {
  if (!force && callbacks && callbacks instanceof Function) {
    callbacks = [null, callbacks]
  } else if (force && callbacks && callbacks instanceof Function) {
    callbacks = [callbacks]
  }

  title = title.substring(0, 12)

  var isFlow = text.length > 80
  text = text.substring(0, 80)
  if (isFlow) {
    text += '...'
  }
  text = text.replace(/\n/g, '<br>')

  if (!force && buttons.length === 1) {
    buttons[1] = buttons[0]
    buttons[0] = '取消'
  }
  var buttons = buttons.map(function (item) {
    return {
      text: item
    }
  })
  var confirm = {
    text: text,
    title: title,
    destroyOnClose: true,
    buttons: buttons,
    onClick: function (el, index) {
      if (index === 0) {
        if (!force) {
          el.close()
        }

        callbacks[0] && callbacks[0]()
      } else if (index === 1) {
        callbacks[1] && callbacks[1]()
      } else if (index === 2) {
        callbacks[2] && callbacks[2]()
      }
    }

  }
  if (type === 'preloader') {
    if (component.$u.getPlatformType() != 'ios') {
      confirm.content =
        '<div class="preloader color-multi"><span class="preloader-inner"><span class="preloader-inner-gap"></span><span class="preloader-inner-left"><span class="preloader-inner-half-circle"></span></span><span class="preloader-inner-right"><span class="preloader-inner-half-circle"></span></span></span></div>'
    } else {
      confirm.content = '<div class="preloader" style="width: 44px; height: 44px"><span class="preloader-inner">< span class="preloader-inner-line" ></span > <span class="preloader-inner-line"></span> <span class="preloader-inner-line"></span> <span class="preloader-inner-line"></span> <span class="preloader-inner-line"></span> <span class="preloader-inner-line"></span> <span class="preloader-inner-line"></span> <span class="preloader-inner-line"></span> <span class="preloader-inner-line"></span> <span class="preloader-inner-line"></span> <span class="preloader-inner-line"></span> <span class="preloader-inner-line"></span></span ></div >'
    }


    confirm.cssClass = 'dialog-preloader'
  }
  if (type === 'listContent') {
    var listContentTmp = '<div class="word-break">'
    listContent.forEach(element => {
      listContentTmp += '<div>' + element + '</div>'
    });
    confirm.content = listContentTmp + '</div>'
  }
  var confirmDialog = component.$f7.dialog.create(confirm)
  confirmDialog.open()
  return confirmDialog
}

function close() {
  toastCenter && toastCenter.close()
  toastBottom && toastBottom.close()
}

function showLoading(component, text) {
  // SpinnerDialog.show(text)
  customConfirmDialog(component, text, '', [], null, 'preloader')
}

function hideLoading(component) {
  // SpinnerDialog.hide()
  component.$f7.dialog.close()
}

export default {
  showToast: showToast,
  customAlertButton: customAlertButton,
  customConfirmDialog: customConfirmDialog,
  close: close,
  showLoading: showLoading,
  hideLoading: hideLoading
}