<template>
  <div class="wrapper">
    <slot name="header">
      <div class="vue-header">Header</div>
    </slot>
    <slot name="content">
      <div class="vue-content">Content</div>
    </slot>
    <slot name="footer">
      <div class="vue-footer">Footer</div>
    </slot>
  </div>
</template>
