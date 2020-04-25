<template>
  <section>
    <div class="featureditems">
      <div class="item" v-for="product in featuredProducts" :key="product.id">
        <!-- <img :src="`/products/${product.img}`" /> -->
        <h3>{{ product.name }}</h3>
        <h4>{{ product.price | dollar }}</h4>
        <button class="btn btn-primary" @click="cartAdd(product)">Add to Cart</button>
      </div>
    </div>
  </section>
</template>

<script>

export default {
  computed: {
    featuredProducts() {
      return this.$store.getters.featuredProducts;
    },
  },
  data() {
    return {
      id: '',
      count: 0,
      tempcart: [] // this object should be the same as the json store object, with an additional param, quantity
    };
  },
  methods: {
    cartAdd(product) {        
        product.quantity = 1;
        this.tempcart.push(product);
        this.$store.commit("addToCart", {...product});
    }
  }
};
</script>

<style lang="scss" scoped>
section {
  margin-top: 60px;
}

.featureditems {
  width: 100%;
  margin: 20px 0 70px;
  .item {
    box-shadow: 0 3px 10px 0px #eee;
    border-radius: 12px;
    padding: 24px;
    min-height: 150px;
    justify-self: center;
    align-self: center;
    text-align: center;
  }
}

h4 {
  color: #000000;
  font-weight: 700;
  margin: 10px 0;
}

h2 {
  color: #3533d6;
  text-align: center;
  overflow: hidden;
}
h2 span {
  display: inline-block;
  position: relative;
}
h2 span:after,
h2 span:before {
  content: " ";
  display: block;
  height: 1px;
  width: 1000px;
  background: #ffffff;
  position: absolute;
  top: 50%;
}
h2 span:before {
  left: -1010px;
}
h2 span:after {
  right: -1010px;
}

@media screen and (max-width: 699px) {
  .featureditems {
    width: 83vw;
    margin-left: 5vw;
    div {
      padding: 10px 20px;
      margin-bottom: 10px;
    }
  }

  img {
    width: initial;
  }
}

@media screen and (min-width: 700px) {
  .featureditems {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr;
    grid-column-gap: 20px;
    grid-row-gap: 0px;
    div {
      padding: 40px 50px;
    }
  }

  img {
    width: 100%;
  }
}
</style>