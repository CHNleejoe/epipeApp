import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        timeList: [],
        loginInfo: null,
        messageInfo: null,
        dictionaryData: null
    },
    getters: {
        getTimeList: state => {
            return state.timeList
        },
    },

    actions: {
        updateLoginInfo({
            commit
        }, loginInfo) {
            commit('UPDATE_LOGIN_USER_INFO', loginInfo)
        },
        updateMessageInfo({
            commit
        }, loginInfo) {
            commit('UPDATE_MESSAGE_INFO', loginInfo)
        },
        updateDictionaryData({
            commit
        }, dictionaryData) {
            commit('UPDATE_DICTIONARY_DATA', dictionaryData)
        },
    },

    mutations: {
        UPDATE_LOGIN_USER_INFO(state, loginInfo) {
            state.loginInfo = loginInfo;
        },
        UPDATE_MESSAGE_INFO(state, messageInfo) {
            state.messageInfo = messageInfo;
        },
        UPDATE_DICTIONARY_DATA(state, dictionaryData) {
            state.dictionaryData = dictionaryData;
        },
    }
})