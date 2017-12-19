import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    cats: ['mindy', 'john', 'kim', 'joe', 'ben'],
  },
  getters: {
    cats: state => {
      return state.cats;
    }
  },
  mutations: {
    addCats: (state, cats) => {
      state.cats.push(...cats);
    }
  },
  actions: {
    
  }
});
