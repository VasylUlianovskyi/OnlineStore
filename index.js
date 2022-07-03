import Header from './Components/Header/header.js';
import SideBar from './Components/SideBar/side-bar.js';
import Search from './Components/SearchBox/search-box.js';
import CardsList from './Components/Cards-list/cards-list.js';
import Pagination from './Components/Pagination/pagination.js';

const BACKEND_URL = 'https://online-store.bootcamp.place/api/'

export default class OnlineStorePage {
  constructor () {
    this.pageSize = 9;
    this.products = [];

    this.url = new URL('products', BACKEND_URL);
    this.url.searchParams.set('_limit', this.pageSize);

    this.components = {};

    this.initComponents();
    this.render();
    this.renderComponents();

    this.initEventListeners();

    this.update(1);
  }

  async loadData (pageNumber) {
    this.url.searchParams.set('_page', pageNumber);

    const response = await fetch(this.url);
    const products = await response.json();

      console.log('products', products);

      return products;
    }




  getTemplate () {
    return `
      <div class="os-container">
      <div class="header"></div>
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
    const totalElements = 100;
    const totalPages = Math.ceil(totalElements / this.pageSize);

    const header = new Header();
    const search = new Search();
    const sidebar = new SideBar();
    const cardList = new CardsList(this.products.slice(0, this.pageSize));
    const pagination = new Pagination({
      activePageIndex: 0,
      totalPages
    });

    this.components.header = header;
    this.components.sidebar = sidebar;
    this.components.search = search;
    this.components.cardList = cardList;
    this.components.pagination = pagination;


  }

  renderComponents () {
    const headerContainer = this.element.querySelector('[class="header"]');
    const sidebarContainer = this.element.querySelector('[data-element="sidebar"]');

    const searchContainer = this.element.querySelector('[data-element="search"]');
    const cardsContainer = this.element.querySelector('[data-element="cardsList"]');
    const paginationContainer = this.element.querySelector('[data-element="pagination"]');


    headerContainer.append(this.components.header.element);
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
      const pageIndex = event.detail;

      this.update(pageIndex + 1);
    });

    this.components.search.element.addEventListener('search-changed', event => {
      const searchQuery = event.detail

      this.update('q', searchQuery)
    })
  }


  async update (pageNumber) {



    const data = await this.loadData(pageNumber);

    this.components.cardList.update(data);
  }

}

