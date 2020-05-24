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
        accent: '#ffeb3b',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3',
        success: '#4caf50'
      },
    },
  },
};

export default new Vuetify(opts)