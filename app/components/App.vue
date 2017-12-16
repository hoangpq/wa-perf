<template>
  <Settings>
    <Layout slot-scope="props">
      <h1 slot="header">{{ props.header }}</h1>
    </Layout>
  </Settings>
</template>

<script>
  import Vue from 'vue';
  import {Component, Prop} from 'vue-property-decorator';
  import Settings from './Settings.vue';
  import Layout from './Layout.vue';
  // HOF
  /*export default Component({})(
    class App extends Vue {
      message = 'Hello from class';
    }
  )*/
  // traditional way
  /*export default {
    methods: {
      onClick() {
        this.message = 'Good bye';
      }
    }
  }*/
  // decorators
  @Component({
    components: {
      Settings,
      Layout,
    }
  })
  export default class App extends Vue {
    @Prop({ default: 'Hello from prop decorator' }) 
    message;

    onClick() {
      alert('Hello world from VueJS');
    }

  }
</script>
