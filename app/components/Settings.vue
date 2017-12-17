<template>
  <div>
    <slot :header="header" :footer="footer"></slot>
  </div>
</template>

<script>
import Vue from 'vue';
import {Component} from 'vue-property-decorator';
@Component({})
export default class Settings extends Vue {
  header = 'Awesome header';
  footer = 'Copyright by @hoangpq';
}
</script>
