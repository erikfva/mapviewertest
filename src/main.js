import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import "./registerServiceWorker";
import VueRouter from "vue-router";
import ourRoutes from "./routes.js";

Vue.config.productionTip = false;
Vue.use(VueRouter);
// We create the router instance here.
const router = new VueRouter({
  routes: ourRoutes,
});
new Vue({
  router,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
