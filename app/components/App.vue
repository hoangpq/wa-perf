<template>
  <Settings>
    <Layout slot-scope="props">
      <Header :header="props.header"/>
      <div slot="content">
        <div v-html="content"></div>
        <select v-model="selectedComp">
          <option v-for="comp in comps" :key="comp.name" :value="comp">
            {{ comp.name }}
          </option>
        </select>
        <component :is="selectedComp" />
        <br/>
        <input type="number" v-model="limit"/>
        <Cats :names="names" :limit="limit"/>
      </div>
      <Footer :footer="props.footer"/>
    </Layout>
  </Settings>
</template>

<script>
  require('./styles/app.scss');
  import Vue from 'vue';
  import { mapState } from 'vuex';
  import { Component, Prop, Watch } from 'vue-property-decorator';
  import Settings from './Settings';
  import Layout from './Layout';
  import { Header, Content, Footer, Cats } from './views';

  // decorators
  import { Getter, StoreWatch } from './decorators';

  // inline component
  const RedComp = {
    functional: true,
    name: 'Red',
    render: h => <h3 style={{color: 'red'}}>Red</h3>,
  };

  const GreenComp = {
    functional: true,
    name: 'Green',
    render: h => <h3 style={{color: 'green'}}>Green</h3>,
  };

  const BlueComp = {
    functional: true,
    name: 'Blue',
    render: h => <h3 style={{color: 'blue'}}>Blue</h3>,
  };

  const AsyncBlueComp = () => ({
    component: import('./views/Blue'),
    loading: {
      render: h => <h3>Loading...</h3>,
    },
    timeout: 3000,
    error: {
      render: h => <h3>Error!!!</h3>,
    }
  });

  // decorators
  @Component({
    components: {
      Settings,
      Layout,
      Header,
      Content,
      Footer,
      Cats,
    }
  })
  export default class App extends Vue {
    names = ["mindy", "john", "kim", "joe", "ben"];
    limit = 5;
    comps = [RedComp, GreenComp, AsyncBlueComp];
    selectedComp = this.comps[0];
    content = `
      Hello, <span style="color:red;">World</span>
    `;

    /*@StoreWatch('cats')
    onPropertyChange(val) {
      console.log(this);
      console.log(val);
    }*/
    @StoreWatch('cats')
    onChildChange(val) {
      console.log(val);
      this.names = val;
    }

    created() {
      this.$store.watch['cats'] = function(nVal) {
        console.log(nVal);
      }
    }

    mounted() {
      this.$store.commit('addCats', ['meow', 'sam', 'max', 'milo'])
    }

  }
</script>
