import Vue from 'vue';
import App from './components/App';
import { store } from './components/store';

new Vue({
  el: '#app',
  store: store,
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
