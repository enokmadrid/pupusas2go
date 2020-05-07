import axios from "axios"
import { v4 as uuidv4 } from 'uuid';
import query from "./../graphql/products.gql"

const url = 'https://api-us-west-2.graphcms.com/v2/ck9ewri0n0ao001zbcneq5dkk/master';
const productsQuery = query.loc.source.body;

export const state = () => ({
  cartUIStatus: "idle",
  storedata: [],
  cart: []
})

export const getters = {
  featuredProducts: state => state.storedata.products,
  cartCount: state => {
    if (!state.cart.length) return 0
    return state.cart.reduce((ac, next) => ac + next.quantity, 0)
  },
  cartTotal: state => {
    if (!state.cart.length) return 0
    return state.cart.reduce((ac, next) => ac + next.quantity * next.price, 0)
  }
}

export const mutations = {
  setProducts: (state, payload) => {
    state.storedata = payload;
  },
  updateCartUI: (state, payload) => {
    state.cartUIStatus = payload
  },
  clearCart: state => {
    //this clears the cart
    ;(state.cart = []), (state.cartUIStatus = "idle")
  },
  addToCart: (state, payload) => {
    let itemfound = state.cart.find(el => el.id === payload.id)
    itemfound
      ? (itemfound.quantity += payload.quantity)
      : state.cart.push(payload)
  },
  incrementQuantity: (state, payload) => {
    let itemfound = state.cart.find(el => el.id === payload.id)
    itemfound.quantity++
  },
  decrementQuantity: (state, payload) => {
    let itemfound = state.cart.find(el => el.id === payload.id)
    itemfound.quantity--
    if (itemfound.quantity < 0) {
      itemfound.quantity = 0;
    }
  }
}

export const actions = {
  increment({ commit }) {
    commit('incrementQuantity')
  },
  decrement({ commit }) {
    commit('decrementQuantity')
  },
  async nuxtServerInit({ commit }) {
    await axios.post(url, {
      query: productsQuery
    }).then(response => {
      const data = response.data.data;
      this.state.storedata = data;
      commit('setProducts', data);
    });
  },
  async postStripeFunction({ getters, commit }, payload) {
    commit("updateCartUI", "loading")

    try {
      await axios
        .post(
          "https://ecommerce-netlify.netlify.com/.netlify/functions/index",
          {
            stripeEmail: payload.stripeEmail,
            stripeAmt: Math.floor(getters.cartTotal * 100), //it expects the price in cents, as an integer
            stripeToken: "tok_visa", //testing token, later we would use payload.data.token
            stripeIdempotency: uuidv4() //we use this library to create a unique id
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        )
        .then(res => {
          if (res.status === 200) {
            commit("updateCartUI", "success")
            setTimeout(() => commit("clearCart"), 5000)
          } else {
            commit("updateCartUI", "failure")
            // allow them to try again
            setTimeout(() => commit("updateCartUI", "idle"), 5000)
          }

          console.log(JSON.stringify(res, null, 2))
        })
    } catch (err) {
      console.log(err)
      commit("updateCartUI", "failure")
    }
  }
}