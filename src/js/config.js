var envConfig = {}

function switchEnv(env) {
    envConfig.env = env
    if (env === 'dev') {
        envConfig.HOST = 'http://192.168.3.217:8069' //yunshen
            // envConfig.HOST = 'http://192.168.3.127:8069' //嘉文
            // envConfig.HOST = 'http://192.168.3.218:8069' //yixin
            // envConfig.HOST = 'https://pms.erptest.epipe.cn' //product
        envConfig.GATEWAY = envConfig.HOST + '/api/gateway'
        envConfig.APP_KEY = 'c3d2fc02f7bc3fec793af3bb1c08b4ec'
        envConfig.APP_SECRET = '5c2805a8a6354390977bb335b7d108d7'
    } else if (env === 'ljw') {
        // envConfig.HOST = 'http://192.168.3.180:8069'
        // envConfig.HOST = 'http://103.38.41.173:8044'
        envConfig.HOST = 'http://pms.erptest.epipe.cn'
            // envConfig.HOST = 'http://192.168.0.104:8069'
            // alert(envConfig.HOST)
        envConfig.GATEWAY = envConfig.HOST + '/api/gateway'

        envConfig.APP_KEY = 'c2cefcc7c4e99edb6dc8a0fb1a04d325'
        envConfig.APP_SECRET = 'f74c0390712245aa8166536821ba5900'
    }
}

switchEnv('dev')

window.envConfig = envConfig