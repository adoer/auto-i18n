import Vue from 'vue';
import iView from 'iview';
import App from './App.vue';
Vue.use(iView, {
  modal: {
    maskClosable: false,
  },
});
new Vue({
  render: (h) => h(App),
}).$mount('#app');
