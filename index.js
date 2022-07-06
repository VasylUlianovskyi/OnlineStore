import SideBar from './Components/SideBar/side-bar.js';
import Search from './Components/SearchBox/search-box.js';
import CardsList from './Components/Cards-list/cards-list.js';
import Pagination from './Components/Pagination/pagination.js';

const BACKEND_URL = 'https://online-store.bootcamp.place/api/'

export default class OnlineStorePage {
  constructor () {
    this.products = [];

    this.url = new URL('products', BACKEND_URL);


    this.totalElements = 100

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


    console.log('page', this.filters._page)

    const response = await fetch(this.url + this.filtersPanel);

    this.totalElements = Number(response.headers.get('X-Total-Count'));
    const totalPages = Math.ceil(this.totalElements / this.filters._limit);


    const products = await response.json();

      console.log('products', products);

      return { products, totalPages };
    }




  getTemplate () {
    return `
      <div class="os-container">
        <header class="os-header">
          <span class="os-logo-text">Online Store</span>
          <button class="cart os-btn-primary" data-element="cartBtn">
            <i class="bi bi-cart">CART</i>
          </button>
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


 
    this.components.sidebar = sidebar;
    this.components.search = search;
    this.components.cardList = cardList;
    this.components.pagination = pagination;



  }

  renderComponents () {

    const sidebarContainer = this.element.querySelector('[data-element="sidebar"]');

    const searchContainer = this.element.querySelector('[data-element="search"]');
    const cardsContainer = this.element.querySelector('[data-element="cardsList"]');
    const paginationContainer = this.element.querySelector('[data-element="pagination"]');


    sidebarContainer.append(this.components.sidebar.element);
    searchContainer.append(this.components.search.element);
    cardsContainer.append(this.components.cardList.element);
    paginationContainer.append(this.components.pagination.element);

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