const state = {
  user: {
    userId: null,
    name: '',
    email: '',
    city: '',
    country: '',
    isLoggedIn: false,
  }
};

const getters = {
  user(state) {
    return state.user
  },
  isLoggedIn(state) {
    return state.user.isLoggedIn;
  },
};

const mutations = {
  setUserId(state, data) {
    state.user.userId = data.userId;
  },
  setName(state, data) {
    state.user.name = data.name;
  },
  setEmail(state, data) {
    state.user.email = data.email;
  },
  setCity(state, data) {
    state.user.city = data.city;
  },
  setCountry(state, data) {
    state.user.country = data.country;
  },
  login() {
    state.user.isLoggedIn = true;
  },
  logout() {
    state.user.isLoggedIn = false;
    state.user.userId = null;
    state.user.name = '';
    state.user.email = '';
    state.user.city = '';
    state.user.country = '';
  }
};

const actions = {
  createUser({commit}, data) {
    commit('setName', data);
    commit('setEmail', data);
    commit('setCity', data);
    commit('setCountry', data);
  },
  setUserId({commit}, data) {
    commit('setUserId', data);
  },
  setUserProfilePicture({commit}, data) {
    commit('setProfilePicture', data);
  },
  userLogin({commit}) {
    commit('login')
  },
  userLogout({commit}) {
    commit('logout')
  }
};

export default {
  state,
  actions,
  mutations,
  getters
};
