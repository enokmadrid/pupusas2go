<template>
  <div>
    <section v-if="cartCount > 0">
      
      <button class="btn btn-danger float-right" @click="clearCart">Clear your cart</button>

      <table>
        <tr>
          <th>Product</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Total</th>
        </tr>
        <tr v-for="product in cart" :key="product.id">
          <td>
            <!-- <img :src="`/products/${item.img}`" :alt="item.name" class="productimg" /> -->
            <h3 class="productname">{{ product.name }}</h3>
          </td>
          <td>
            <strong>{{ product.price | dollar }}</strong>
          </td>
          <td>
            <button class="update-num" @click="minusQty(product)">-</button>
              <input type="number" v-model="product.quantity" disabled/>
            <button class="update-num" @click="plusQty(product)">+</button>
          </td>
          <td>
            <h4>{{ product.quantity * product.price | dollar }}</h4>
          </td>
        </tr>
      </table>

      <section class="payment">
        <app-card />
        <div class="total">
          <div class="caption">
            <p>
              <strong>Subtotal:</strong>
            </p>
            <p>Shipping:</p>
            <p class="golden">Total:</p>
          </div>
          <div class="num">
            <p>
              <strong>{{ cartTotal | dollar }}</strong>
            </p>
            <p>Free Shipping</p>
            <p class="golden">{{ cartTotal | dollar }}</p>
          </div>
        </div>
      </section>
    </section>

    <section v-else class="center">
      <p>Your cart is empty, fill it up!</p>
      <nuxt-link class="btn btn-primary" exact to="/">Continue Shopping</nuxt-link>
    </section>

  </div>
</template>

<script>
import AppCard from "~/components/AppCard.vue";
import { mapState, mapGetters } from "vuex";

export default {
  components: {
    AppCard
  },
  computed: {
    ...mapState(["cart"]),
    ...mapGetters(["cartCount", "cartTotal"])
  },
  data() {
    return {
      tempcart: []
    };
  },
  methods: {
    plusQty(product){
      this.$store.commit('incrementQuantity', product);
    },
    minusQty(product){
        this.$store.commit('decrementQuantity', product);
    },
    clearCart() {
      this.complete = false;
      this.$store.commit("clearCart");
    }
  }
};
</script>

<style lang="scss" scoped>
.productimg {
  float: left;
  margin-right: 15px;
  width: 100px;
}

.total {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 100px;
}

table {
  width: 100%;
  margin-top: 20px;
}

tr {
  text-align: center;
}

th {
  padding: 10px 0;
}

td,
th {
  border-bottom: 1px solid #ccc;
}

.golden {
  background: #f2eee2;
  font-weight: bold;
  padding: 10px;
}

.productname {
  padding-top: 36px;
  text-align: left;
}

h1 {
  margin-top: 40px;
}

.num {
  text-align: right;
}

.btn {
  margin-top: 20px;
  transition: 0.3s all ease;
}

@media screen and (min-width: 700px) {
  .payment {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-column-gap: 100px;
  }
}

@media screen and (max-width: 699px) {
  .payment {
    width: 94%;
    margin-left: 2%;
  }
}
</style>