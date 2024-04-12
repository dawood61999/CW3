<template>
    <div>
      <div v-if="showSubject">
        <div class="container">
          <div v-for="subject in filteredAndSortedSubjects" :key="subject.id">
            <figure>
              <img :src="baseUrl + subject.image" alt="Product Image">
            </figure>
            <h2>{{ subject.title }}</h2>
            <p v-html="subject.description"></p>
            <p>Location: {{ subject.Location }}</p>
            <p>Price: {{ subject.price }} AED</p>
            <p>Stock: {{ subject.stock }}</p>
            <button @click="addToCart(subject)" :disabled="!canAddToCart(subject)">
              Add to cart
            </button>
            <span v-if="subject.stock === 0">
              Space Unavailable
            </span>
            <span v-else-if="subject.stock < 5">
              Only {{ subject.stock }} Space Left!
            </span>
            <span v-else>
              Space Available
            </span>
            <div>
              <span v-for="n in subject.rating" :key="'star-' + n">★</span>
              <span v-for="n in 5 - subject.rating" :key="'empty-star-' + n">☆</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: ['subjects', 'cart', 'searchQuery', 'sortAttribute', 'sortOrder'], 
    data() {
      return {
        showSubject: true,
        baseUrl: 'http://localhost:3000/',
      };
    },
    methods: {
        addToCart(subject) {
    const cartItemCount = this.getCartCount(subject._id);
    const cartItem = {
        id: subject._id, 
        quantity: 1,
        title: subject.title,
        price: subject.price,
        image: this.baseUrl + subject.image
    };
    if (subject.stock > cartItemCount) {
        this.$emit('addToCart', cartItem);
    }
},

  
      canAddToCart(subject) {
        const cartItemCount = this.getCartCount(subject._id);
        return subject.stock > cartItemCount;
      },
  
      getCartCount(id) {
        const cartItem = this.cart.find(item => item.id === id);
        return cartItem ? cartItem.quantity : 0;
      },
    },
    computed: {
      filteredAndSortedSubjects() {
        const query = (this.searchQuery || '').toLowerCase();
        let filteredSubjects = this.subjects.filter(subject => {
          return (
            subject.title.toLowerCase().includes(query) ||
            subject.Location.toLowerCase().includes(query)
          );
        });
  
        if (this.sortAttribute === 'stock') {
          filteredSubjects.sort((a, b) => {
            const order = this.sortOrder === 'asc' ? 1 : -1;
            return (a.stock - this.getCartCount(a.id)) * order - (b.stock - this.getCartCount(b.id)) * order;
          });
        } else {
          filteredSubjects.sort((a, b) => {
            const order = this.sortOrder === 'asc' ? 1 : -1;
            const attrA = a[this.sortAttribute].toUpperCase();
            const attrB = b[this.sortAttribute].toUpperCase();
            if (attrA < attrB) {
              return -1 * order;
            } else if (attrA > attrB) {
              return 1 * order;
            }
            return 0;
          });
        }
  
        return filteredSubjects;
      },
    },
  };
  </script>
  
  <style>

  .container {
    display: flex;
    flex-wrap: wrap;
  }
  
  .container > div {
    width: calc(33.33% - 20px);
    margin: 10px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .container > div figure {
    margin: 0;
    overflow: hidden;
  }
  
  .container > div img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-bottom: 1px solid #ccc;
  }
  
  .container > div h2 {
    margin: 10px 0;
  }
  </style>
  