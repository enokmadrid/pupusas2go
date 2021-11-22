<template>
  <div class="container">
    <div>
      <logo />
      <h1 class="title">pupusas2go</h1>
      <app-featured-products />
    </div>
  </div>
</template>

<script>
import Logo from '~/components/Logo.vue';
import AppFeaturedProducts from "~/components/AppFeaturedProducts.vue";

export default {
  components: {
    Logo,
    AppFeaturedProducts
  }
}
</script>

<style>
  @import "assets/scss/_variables.scss";

  .container {
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .title {
    font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
      'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    display: block;
    font-weight: 300;
    font-size: 100px;
    color: #35495e;
    letter-spacing: 1px;
  }

  .subtitle {
    font-weight: 300;
    font-size: 42px;
    color: $brand-color;
    word-spacing: 5px;
    padding-bottom: 15px;
  }

  .links {
    padding-top: 15px;
  }
</style>
