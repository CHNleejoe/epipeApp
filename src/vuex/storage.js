import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    timeList: [],
    interactInfo: [],
    backgroundSetting: {},
    loginUserInfo: {},
    imConnection: null,
    imConnected: false,
    messagesData: [],
  },
  getters: {
    getTimeList: state => {
      return state.timeList
    },
    getInteractInfo: state => {
      return state.interactInfo
    },
    getBackgroundSetting: state => {
      return state.backgroundSetting
    },
    getLoginUserInfo: state => {
      return state.loginUserInfo
    },
    getImConnection: state => {
      return state.imConnection
    },
    getImConnected: state => {
      return state.imConnected
    },
    getMessagesData: state => {
      return state.messagesData
    },
  },

  actions: {
    updateLoginUserInfo({
      commit
    }, loginUserInfo) {
      commit('UPDATE_LOGIN_USER_INFO', loginUserInfo)
    },
    updateTimeList({
      commit
    }, timeList) {
      commit('UPDATE_TIME_LIST', timeList)
    },
    updateInteractInfo({
      commit
    }, interactInfo) {
      commit('UPDATE_INTERACT_INFO', interactInfo)
    },
    updateBackgroundSetting({
      commit
    }, backgroundSetting) {
      commit('UPDATE_BACKGROUND_SETTING', backgroundSetting)
    },
    updateImConnection({
      commit
    }, imConnection) {
      commit('UPDATE_IM_CONNECTION', imConnection)
    },
    updateImConnected({
      commit
    }, imConnected) {
      commit('UPDATE_IM_CONNECTED', imConnected)
    },
    updateMessagesData({
      commit
    }, messagesData) {
      commit('UPDATE_MESSAGES_DATA', messagesData)
    },
  },

  mutations: {
    UPDATE_LOGIN_USER_INFO(state, loginUserInfo) {
      state.loginUserInfo = loginUserInfo;
    },
    UPDATE_TIME_LIST(state, timeList) {
      state.timeList = timeList;
    },
    UPDATE_INTERACT_INFO(state, interactInfo) {
      state.interactInfo = interactInfo;
    },
    UPDATE_BACKGROUND_SETTING(state, backgroundSetting) {
      state.backgroundSetting = backgroundSetting;
    },
    UPDATE_IM_CONNECTION(state, imConnection) {
      state.imConnection = imConnection;
    },
    UPDATE_IM_CONNECTED(state, imConnected) {
      state.imConnected = imConnected;
    },
    UPDATE_MESSAGES_DATA(state, messagesData) {
      state.messagesData = messagesData;
    },
  }
})