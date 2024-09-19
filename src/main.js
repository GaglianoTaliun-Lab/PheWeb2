import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'

// Import our custom CSS
import './scss/styles.scss'
// Import the FontAwesome icon component
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


router.beforeEach((to, from, next) => {
    document.title = to.meta.title || 'Default Title';
    next();
  });
const app = createApp(App);
const vuetify = createVuetify({
  components,
  directives,
})

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router);
app.use(vuetify);
app.mount('#app');
