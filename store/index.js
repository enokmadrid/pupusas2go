import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import products from './../graphql/products.gql'
import newOrder from './../graphql/newOrder.gql'

const graphcmsEndpoint = 'https://api-us-west-2.graphcms.com/v2/ck9ewri0n0ao001zbcneq5dkk/master';
const netlifyFunction = 'https://pupusas2go.netlify.app/.netlify/functions/index';
const productsQuery = products.loc.source.body;
const orderQuery = newOrder.loc.source.body;

// const stripeData = {
//   stripeEmail: payload.stripeEmail,
//   stripeName: payload.stripeName,
//   stripePhone: payload.stripePhone,
//   stripeAddress: payload.stripeAddress,
//   stripeAmt: Math.floor(getters.cartTotal * 100), //it expects the price in cents, as an integer
//   stripeToken: "tok_visa", //testing token, later we would use payload.data.token
//   stripeIdempotency: uuidv4() //we use this library to create a unique id
// };
const stripeHeaders = {
  headers: {
    "Content-Type": "application/json",
  }
};

export const state = () => ({
  cartUIStatus: "idle",
  storedata: [],
  cart: [],
  customer: {}
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
  setCustomer: (state, payload) => {
    state.customer = payload;
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
  emptyCart({ commit }) {
    commit('clearCart')
  },
  async nuxtServerInit({ commit }) {
    await axios.post(graphcmsEndpoint, {
      query: productsQuery
    }).then(res => {
      const data = res.data.data;
      this.state.storedata = data;
      commit('setProducts', data);
    });
  },

  async postStripeFunction({ getters, commit }, payload) {
    commit("updateCartUI", "loading")
    let customer, order, orderItems = [];
    
    function turnCartItemsToOrderItems(cartItems) {
      cartItems.forEach(i => {
        orderItems.push({ 
          name: i.name,  
          quantity: i.quantity 
        })
      });
      return orderItems;
    }

    const createNewOrderQuery = {
      query: orderQuery,
      variables: {
        data: {
          customerName: payload.stripeName,
          phone: payload.stripePhone,
          line1: payload.stripeAddress.line1,
          line2: payload.stripeAddress.line2,
          postalCode: String(payload.stripeAddress.postal_code),
          items: {
            create: turnCartItemsToOrderItems(this.state.cart)
          }
        }
      }
    }
    
    console.log(createNewOrderQuery)


    try {
      //TODO: CREATE CUSTOMER on GRAPHCMS
      // CHECK IF USER EXISTS, otherwise create it

      const stripeData = {
        stripeEmail: payload.stripeEmail,
        stripeName: payload.stripeName,
        stripePhone: payload.stripePhone,
        stripeAddress: payload.stripeAddress,
        stripeAmt: Math.floor(getters.cartTotal * 100), //it expects the price in cents, as an integer
        stripeToken: "tok_visa", //testing token, later we would use payload.data.token
        stripeIdempotency: uuidv4() //we use this library to create a unique id
      };

      
      //TODO: USE CUSTOMER INFO to to CHARGE STRIPE
      await axios.post(netlifyFunction, stripeData, stripeHeaders)
      .then(res => {
          if (res.status === 200) {
            commit("updateCartUI", "success")
            setTimeout(() => commit("clearCart"), 5000)
          } else {
            commit("updateCartUI", "failure")
            setTimeout(() => commit("updateCartUI", "idle"), 5000) // allow them to try again
          }
          console.log(JSON.stringify(res, null, 2));
        }).catch(err => console.log(err));


      //TODO: CREATE THE ORDER
      await axios.post( graphcmsEndpoint, createNewOrderQuery )
      .then(response => {
        console.log(response.request.response)
        order = JSON.parse(response.request.response).data.createOrder;

        var newCustomer = {
          name: order.customerName,
          order: order.id
        };
        commit('setCustomer', newCustomer);
      }).catch(err => console.log(err));
  
      console.log(order);
      console.log(order.customerName);
      console.log(order.items);
      console.log(order.postalCode);

    } catch (err) {
      console.log(err)
      commit("updateCartUI", "failure")
    }
  }
}