<template>
  <div id="app">
    <header>
      <h1>{{ AfterClassName }}</h1>
      <input v-model="searchQuery" placeholder="Search lessons..." />
      <button @click="toggleCheckout" class="checkout-btn" :disabled="!isCartNotEmpty">
        {{ cartCount }}
        <span class="fas fa-cart-plus"></span> Checkout
      </button>
      <select v-model="sortAttribute">
        <option value="title">Subject</option>
        <option value="Location">Location</option>
        <option value="price">Price</option>
        <option value="stock">Stock</option>
      </select>

      <select v-model="sortOrder">
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </header>

    <main>
  <LessonComponent
    v-if="showSubject"
    :subjects="filteredAndSortedSubjects"
    :cart="cart"
    @addToCart="addToCart"
    :canAddToCart="canAddToCart"
    :getCartCount="getCartCount"
    @removeFromCart="removeFromCart"
    :sortAttribute="sortAttribute"
    :sortOrder="sortOrder" 
    @updateStock="updateStock"
  />
</main>

    <CheckoutComponent
      v-if="!showSubject" 
      :cart="cart"
      :orderFields="orderFields"
      :orderMethods="orderMethods"
      @placeOrder="placeOrder"
      @removeFromCart="removeFromCart"
      @updateCart="updateCart"
      :showSubject="showSubject" 
      :subjects="subjects"
    />
  </div>
</template>

<script>
import LessonComponent from './components/LessonComponent.vue';
import CheckoutComponent from './components/CheckoutComponent.vue';

export default {
  name: 'App',
  components: {
    LessonComponent,
    CheckoutComponent,
  },
  data() {
    return {
      searchQuery: '',
      AfterClassName: 'AFTER SCHOOL CLASSES',
      showSubject: true,
      sortAttribute: 'title',
      sortOrder: 'asc',
      orderFields: [
        { label: 'Name', key: 'Name', type: 'text', pattern: /^[a-zA-Z]+$/ },
        { label: 'Phone Number(10 Digits)', key: 'PhoneNumber', type: 'text', pattern: /^[0-9]{10}$/ },
      ],
      orderMethods: ['Cash on Delivery', 'Credit Card', 'PayPal'],
      subjects: [], 
      cart: [],
      baseUrl: 'http://localhost:3000/',
    };
  },
  created() {
    this.fetchLessons();
  },
  methods: {
    fetchLessons() {
      fetch('http://localhost:3000/lessons')
        .then(response => response.json())
        .then(data => {
          this.subjects = data.map(lesson => ({
            ...lesson,
            availableSpace: lesson.stock,
          }));
        })
        .catch(error => console.error('Error fetching lessons:', error));
    },
    addToCart(cartItem) {
      const existingCartItemIndex = this.cart.findIndex(item => item.id === cartItem.id);

      if (existingCartItemIndex !== -1) {
        this.cart[existingCartItemIndex].quantity += 1;
      } else {
        this.cart.push(cartItem);
      }

      // Reduce stock
      const subjectIndex = this.subjects.findIndex(item => item._id === cartItem.id.split('-')[0]);
      if (subjectIndex !== -1) {
        this.subjects[subjectIndex].stock -= 1;
      }
    },
    removeFromCart(lessonId) {
      const index = this.cart.findIndex(item => item.id === lessonId);

      if (index !== -1) {
        const item = this.cart[index];
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          this.cart.splice(index, 1);
        }
      }
    },
    placeOrder(order) {
      fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Order placed:', data);
          alert('Order Submitted!');
          this.cart = [];
          this.order = { Name: '', PhoneNumber: '' };
          location.reload();
        })
        .catch(error => console.error('Error placing order:', error));
    },
    updateCart(payload) {
      const { lessonId, quantity } = payload;
      const cartItem = this.cart.find(item => item.id === lessonId);
      if (cartItem) {
        cartItem.quantity = quantity;
      }
    },
    getCartCount(id) {
      const cartItem = this.cart.find(item => item.id === id);
      return cartItem ? cartItem.quantity : 0;
    },
    updateStock(itemId) {
      const subjectIndex = this.subjects.findIndex(subject => subject._id === itemId);
      if (subjectIndex !== -1) {
        this.subjects[subjectIndex].stock -= 1;
      }
    },
    toggleCheckout() {
      this.showSubject = !this.showSubject;
    }
  },
  computed: {
    cartCount() {
      return this.cart.reduce((acc, item) => acc + item.quantity, 0);
    },
    isCartNotEmpty() {
      return this.cart.length > 0;
    },
    filteredAndSortedSubjects() {
      const query = this.searchQuery.toLowerCase();
      const filteredSubjects = this.subjects.filter(subject => {
        return (
          subject.title.toLowerCase().includes(query) ||
          subject.Location.toLowerCase().includes(query)
        );
      });

      return filteredSubjects.sort((a, b) => {
        const order = this.sortOrder === 'asc' ? 1 : -1;

        if (this.sortAttribute === 'stock') {
          return (a.stock - this.getCartCount(a.id)) * order - (b.stock - this.getCartCount(b.id)) * order;
        } else {
          if (a[this.sortAttribute] < b[this.sortAttribute]) {
            return -1 * order;
          } else if (a[this.sortAttribute] > b[this.sortAttribute]) {
            return 1 * order;
          }
          return 0;
        }
      });
    },
  },
};
</script>

<style>

#app {
  text-align: center;
  padding: 20px;
}

header {
  margin-bottom: 20px;
}

header button.checkout-btn {
  margin-left: 10px;
}

main {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
</style>
