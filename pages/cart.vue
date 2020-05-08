<template>
  <div>
    <h1 class="center">Your Cart</h1>

    <section v-if="cartUIStatus === 'idle'">
      <app-cart-display />
    </section>

    <section v-else-if="cartUIStatus === 'loading'" class="loader">
      <app-loader />
    </section>

    <section v-else-if="cartUIStatus === 'success'" class="success">
      <h2>Success!</h2>
      <p>Thank you for your purchase. You'll be receiving your items in 4 business days.</p>
      <p>Forgot something?</p>
      <nuxt-link class="btn btn-primary" exact to="/">Back to Home</nuxt-link>
    </section>

    <section v-else-if="cartUIStatus === 'failure'">
      <p>Oops, something went wrong. Redirecting you to your cart to try again.</p>
      <nuxt-link class="btn btn-primary" exact to="/">Back to Home</nuxt-link>
      <button class="btn btn-danger" @click="clearCart">Please try again</button>
    </section>

  </div>
</template>

<script>
import AppLoader from "~/components/AppLoader.vue";
import AppCartDisplay from "~/components/AppCartDisplay.vue";
import { mapState, mapGetters } from "vuex";

export default {
  components: {
    AppCartDisplay,
    AppLoader
  },
  computed: {
    ...mapState(["cartUIStatus"])
  },
  methods: {
    clearCart() {
      this.$store.commit("clearCart");
    }
  }
};
</script>

<style lang="scss" scoped>
.loader {
  display: flex;
  justify-content: center;
}

.success {
  text-align: center;
}
</style>