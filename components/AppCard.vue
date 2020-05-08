<template>
  <div id="app">
    <div v-if="cartUIStatus === 'idle'" class="payment">
      <h3>Please enter your payment details:</h3>
      <label for="name">Full Name</label>
      <input id="name" type="text" v-model="stripeName" placeholder="First and Last name" required/>

      <label for="email">Email</label>
      <input id="email" type="email" v-model="stripeEmail" placeholder="name@example.com" required/>

      <label for="phone">Phone Number</label>
      <input id="phone" type="number" v-model="stripePhone" placeholder="" required/>

      <label for="address">Delivery Address</label>
      <input id="address" type="text" v-model="line1" placeholder="" required/>

      <label for="address2">Address Line 2</label>
      <input id="address2" type="text" v-model="line2" placeholder="" required/>

      <label for="city">City</label>
      <input id="city" type="text" v-model="city" disabled/>

      <label for="state">State</label>
      <input id="state" type="text" v-model="state" disabled/>

      <label for="zip">Zip code</label>
      <input id="zip" type="number" v-model="postal_code" required/>

      <label for="card">Credit Card</label>
      <small>
        Test using this credit card:
        <span class="cc-number">4242 4242 4242 4242</span>, and enter any 5 digits for the zip code
      </small>
      <card
        class="stripe-card"
        id="card"
        :class="{ complete }"
        stripe="pk_test_6RILOHLJYZ7rEpNLnMZrd6gi003pX4ZUA2"
        :options="stripeOptions"
        @change="complete = $event.complete"
      />
      <button
        class="pay-with-stripe btn btn-primary"
        @click="pay"
        :disabled="!complete || !(stripeEmail && stripeName && stripePhone && line1 && city && state && postal_code)"
      >Pay with credit card</button>
    </div>

    <div v-else class="statussubmit">
      <div v-if="cartUIStatus === 'failure'">
        <h3>Oh No!</h3>
        <p>Something went wrong!</p>
        <button @click="clearCart">Please try again</button>
      </div>

      <div v-else-if="cartUIStatus === 'loading'" class="loadcontain">
        <h4>Please hold, we're filling up your cart with goodies</h4>
        <p>Placeholder loader</p>
      </div>

      <div v-else-if="cartUIStatus === 'success'" class="loadcontain">
        <h4>Success!</h4>
      </div>
    </div>
  </div>
</template>
 
<script>
import { Card, createToken } from "vue-stripe-elements-plus";

import { mapState } from "vuex";

export default {
  components: { Card },
  computed: {
    ...mapState(["cartUIStatus"])
  },
  data() {
    return {
      complete: false,
      stripeOptions: {
        // you can configure that cc element. I liked the default, but you can
        // see https://stripe.com/docs/stripe.js#element-options for details
      },
      stripeEmail: '',
      stripeName: '',
      stripePhone: '',
      line1: '',
      line2: '',
      city: 'Las Vegas',
      country: 'US',
      postal_code: '',
      state: 'Nevada'
    }
  },
  methods: {
    pay() {
      createToken().then(data => {
        const stripeData = { 
          data, 
          stripeEmail: this.stripeEmail, 
          stripeName: this.stripeName,
          stripePhone: this.stripePhone,
          stripeAddress: {
              line1: this.line1,
              line2: this.line2,
              city: this.city,
              country: this.country,
              postal_code: this.postal_code,
              state: this.state
          }
        };
        this.$store.dispatch("postStripeFunction", stripeData);
      })
    }
  }
};
</script> 
 
<style lang="scss" scoped>
input,
.btn {
  width: 100%;
  &:disabled {
    cursor: not-allowed;
  }
}

.btn, label {
  margin-top: 20px;
}

input {
  height: 36px;
}

.payment {
  margin-top: 20px;
}

.stripe-card {
  margin-top: 10px;
  width: 100%;
  border: 1px solid #ccc;
  padding: 5px 10px;
}

.stripe-card.complete {
  border: 2px solid green;
}
</style> 