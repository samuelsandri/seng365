import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

const opts = {
  theme: {
    themes: {
      light: {
        primary: '#8bc34a',
        secondary: '#cddc39',
        accent: '#00bcd4',
        error: '#f44336',
        warning: '#ff9800',
        info: '#00bcd4',
        success: '#8bc34a'
      },
    },
  },
};

export default new Vuetify(opts)