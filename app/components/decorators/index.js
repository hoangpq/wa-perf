import { createDecorator } from 'vue-class-component';
import { mapState } from 'vuex';

export function Getter(getterType) {
  return createDecorator((options, key) => {
    if (!options.computed) options.computed = {}
    options.computed[key] = function () {
      return this.$store.getters[getterType]
    }
  })
}

export function StoreWatch(storeKey) {
  return createDecorator((options, funcName) => {
    if (typeof options.methods !== 'undefined') {
      options.computed = { ...options.computed, ...mapState(['cats']) };
      if (typeof options.watch !== 'object') {
        options.watch = Object.create(null);
      }
      options.watch[storeKey] = {
        handler: options.methods[funcName]
      }
    }
  })
}
