<template>
    <div>
      <div v-if="!showSubject">
        <h2 v-if="cart.length > 0">Shopping Cart</h2>
        <div v-if="cart.length === 0">Your cart is empty.</div>
        <div class="checkout-items">
          <div v-for="(cartItem, index) in cart" :key="index" class="cart-item">
            <div>
              <figure>
                <img :src="getLessonImage(cartItem.id)" alt="Product Image">
              </figure>
              <h2>{{ getLessonTitle(cartItem.id) }}</h2>
              <p>Price: {{ getLessonPrice(cartItem.id) }} AED</p>
              <p>Quantity: {{ cartItem.quantity }} selected</p>
              <button @click="removeFromCart(cartItem.id)">Remove from Cart</button>
            </div>
          </div>
        </div>
  
        <div>
          <h2>Checkout</h2>
          <p v-for="field in orderFields" :key="field.label">
            <strong>{{ field.label }}:</strong>
            <input v-model="order[field.key]" :type="field.type" />
            <span v-if="field.key === 'Name' && order[field.key] && !isValidName(order[field.key])" style="color: red;">Please enter a valid name</span>
            <span v-if="field.key === 'PhoneNumber' && order[field.key] && !isValidPhoneNumber(order[field.key])" style="color: red;">Please enter a valid phone number</span>
          </p>
          <p>
            <input type="radio" v-for="method in orderMethods" :key="method" :id="method" :value="method"
              v-model="order.method">
            <label :for="method">{{ method }}</label>
          </p>
          <h2>Order Information</h2>
          <p v-for="field in orderFields" :key="field.label">{{ field.label }}: {{ order[field.key] }}</p>
          <button @click="placeOrder" :disabled="!isOrderValid">Place Order</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: ['cart', 'orderFields', 'orderMethods', 'showSubject', 'subjects'], 
    data() {
      return {
        order: {
          Name: '',
          PhoneNumber: '',
        },
      };
    },
    methods: {
      removeFromCart(lessonId) {
        this.$emit('removeFromCart', lessonId);
      },
      placeOrder() {
    const order = {
      name: this.order.Name,
      phoneNumber: this.order.PhoneNumber,
      lessons: this.cart.map(item => ({
        id: item.id,
        quantity: item.quantity
      })),
    };

    this.$emit('placeOrder', order);
  },

      isOrderValid() {
        return this.isValidName(this.order.Name) && this.isValidPhoneNumber(this.order.PhoneNumber);
      },
      isValidName(name) {
        const nameRegex = /^[A-Za-z\s]+$/;
        return nameRegex.test(name);
      },
      isValidPhoneNumber(phoneNumber) {
        const phoneNumberRegex = /^[0-9]{10}$/;
        return phoneNumberRegex.test(phoneNumber);
      },
      getLessonTitle(lessonId) {
        const cartItem = this.getCartItem(lessonId);
        return cartItem ? cartItem.title : '';
      },
      getLessonImage(lessonId) {
        const cartItem = this.getCartItem(lessonId);
        return cartItem ? cartItem.image : '';
      },
      getLessonPrice(lessonId) {
        const cartItem = this.getCartItem(lessonId);
        return cartItem ? cartItem.price : '';
      },
      getCartItem(lessonId) {
        return this.cart.find(item => item.id === lessonId);
      },
      addToCart(cartItem) {
        this.$emit('addToCart', cartItem);
      },
    },
  };
  </script>
  
  <style>
  
  .checkout-items {
    display: flex;
    flex-wrap: wrap;
  }
  
  .cart-item {
    width: calc(33.33% - 20px);
    margin: 10px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .cart-item figure {
    margin: 0;
    overflow: hidden;
  }
  
  .cart-item img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-bottom: 1px solid #ccc;
  }
  
  .cart-item h2 {
    margin: 10px 0;
  }
  </style>
  