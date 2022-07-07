import SideBar from './Components/SideBar/side-bar.js';
import Search from './Components/SearchBox/search-box.js';
import CardsList from './Components/Cards-list/cards-list.js';
import Pagination from './Components/Pagination/pagination.js';
import Cart from './Components/Cart/cart.js';


const BACKEND_URL = 'https://online-store.bootcamp.place/api/'

export default class OnlineStorePage {
  constructor () {
    this.products = [];
    this.url = new URL('products', BACKEND_URL);
    this.totalElements = 100
    this.cartProducts = [];
    this.components = {};
    this.filtersPanel = ''
    this.filters = {
      _page: 1,
      _limit: 9,
      _q: ''
    }

    this.initComponents();
    this.render();
    this.renderComponents();

    this.initEventListeners();

    this.update('_page', 1);
  }

  async loadData () {
    for (const key in this.filters) {
      if (this.filters[key]) {
        this.url.searchParams.set(key, this.filters[key])
      } else {
        this.url.searchParams.delete(key, this.filters[key])
      }
    }

    const response = await fetch(this.url + this.filtersPanel);

    this.totalElements = Number(response.headers.get('X-Total-Count'));
    const totalPages = Math.ceil(this.totalElements / this.filters._limit);

    const products = await response.json();

      return { products, totalPages };
    }


  getTemplate () {
    return `
      <div class="os-container">
      <header class="os-header">
      <span class="os-logo-text">Online Store</span>
      <button class="cart os-btn-primary" data-element="cartBtn">
        <i class="bi bi-cart">
          CART
          <span data-element="cartQuantity"></span>
        </i>
      </button>
      <div data element="modalContainer">
        <!-- CART -->
      </div>
    </header>
        <main class="os-products">
          <div data-element="sidebar">
            <!-- Side Bar Component -->
          </div>
          <section>
              <div data-element="search">
                <!-- Search -->
              </div>
              <div data-element="cardsList">
                <!-- Cards List component -->
              </div>
              <footer data-element="pagination" class="os-pagination">
                <!-- Pagination component -->
              </footer>
          </section>
        </main>

      </div>
    `;
  }

  initComponents () {
    const totalPages = Math.ceil(this.totalElements / this.filters._limit);


    const search = new Search();
    const sidebar = new SideBar();
    const cardList = new CardsList(this.products);
    const pagination = new Pagination({
      activePageIndex: 0,
      totalPages
    });
    const cart = new Cart()

    this.components.sidebar = sidebar;
    this.components.search = search;
    this.components.cardList = cardList;
    this.components.pagination = pagination;
    this.components.cart = cart;
  }

  renderComponents () {
    const sidebarContainer = this.element.querySelector('[data-element="sidebar"]');
    const searchContainer = this.element.querySelector('[data-element="search"]');
    const cardsContainer = this.element.querySelector('[data-element="cardsList"]');
    const paginationContainer = this.element.querySelector('[data-element="pagination"]');
    const cart = this.element.querySelector('[data-element="modalContainer"]')

    sidebarContainer.append(this.components.sidebar.element);
    searchContainer.append(this.components.search.element);
    cardsContainer.append(this.components.cardList.element);
    paginationContainer.append(this.components.pagination.element);
    this.element.appendChild(this.components.cart.element)
  }

  render () {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;
  }

  initEventListeners () {
    this.components.pagination.element.addEventListener('page-changed', event => {
      const pageIndex =  Number(event.detail);
      this.update('_page', pageIndex + 1);
    });

    this.components.search.element.addEventListener('search-changed', event => {
      const searchQuery = event.detail
      this.update('q', searchQuery)
    })

    this.components.sidebar.element.addEventListener('filters-changed', event => {
      const filtersArr = event.detail
      this.filtersPanel = filtersArr.length ? '&' + filtersArr.join('&') : ''
      this.update('q')
    })

    this.components.sidebar.element.addEventListener('filters-reset', event => {
      this.filtersPanel = ''
      this.filters.q = ''
      this.update('q')
    })

    const cartBtn = this.element.querySelector('[data-element="cartBtn"]')
    cartBtn.addEventListener('click', event => {
      this.components.cart.open()
    })

    this.components.cardList.element.addEventListener('add-to-cart', event => {
      this.addProductToCart(event.detail)
    })

    this.components.cart.element.addEventListener('decrement-cart-product', event => {
      this.decrementCartProduct(event.detail)
    })

    this.components.cart.element.addEventListener('increment-cart-product', event => {
      this.incrementCartProduct(event.detail)
    })
  }

  decrementCartProduct (id) {
    const cartItem = this.cartProducts.find((item) => item.id === id)
    if (cartItem.quantity > 1) {
      cartItem.quantity--
    } else {
      const idx = this.cartProducts.findIndex((item) => item.id === id)
      this.cartProducts.splice(idx, 1)
    }
    this.updateCartData()
  }

  incrementCartProduct (id) {
    const cartItem = this.cartProducts.find((item) => item.id === id)
    cartItem.quantity++
    this.updateCartData()
  }

  addProductToCart (product) {
    const cartItem = this.cartProducts.find((item) => item.id === product.id)
    if (cartItem) {
      cartItem.quantity += 1
    } else {
      product.quantity = 1
      this.cartProducts.push(product)
    }
    this.updateCartData()
  }

  updateCartData () {
    const totalQuantity = this.getTotalQuantity(this.cartProducts)
    this.element.querySelector('[data-element="cartQuantity"]').innerHTML = totalQuantity
    this.components.cart.update(this.cartProducts)
  }

  getTotalQuantity (products) {
    if (!products.length) return ''
    return products.reduce((acc, cur) => {
      return acc + cur.quantity
    }, 0)
  }

  async update (filterName, filterValue) {
    if (filterName && (typeof filterValue === 'number' || typeof filterValue === 'string')) {
      this.filters[filterName] = filterValue
    }

    if (filterName === 'q') {
      this.filters._page = 1
    }

    const { products, totalPages } = await this.loadData();

    if (filterName === '_page') {
      this.components.cardList.update(products);
    }

    if (filterName === 'q') {
      this.components.pagination.update(totalPages);
      this.components.cardList.update(products);
    }
  }
}
