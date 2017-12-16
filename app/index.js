import Vue from 'vue';
import App from './components/App.vue';

new Vue({
  el: '#app',
  render: h => (
    <App>
      <div slot="header">
        <h2>Header</h2>
      </div>
      <div slot="footer">
        <h2>footer</h2>
      </div>
    </App>
  ),
});
