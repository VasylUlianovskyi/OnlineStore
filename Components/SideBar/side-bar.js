import Filters from "../Filters-list/filters-list.js";
import DoubleSlider from "../DoubleSlider/double-slider.js";

const BACKEND_URL = 'https://online-store.bootcamp.place/api/';

export default class SideBar  {
  constructor () {
    this.components = {}
    this.categoriesFilterData = []
    this.brandsFilterData = []
    this.activeFilters = []

    this.categoriesUrl = new URL('categories', BACKEND_URL)
    this.brandsUrl = new URL('brands', BACKEND_URL)

    this.render()
    this.initFilters()
  }

  async initFilters () {
    await Promise.all([
      this.fetchCategoriesData(),
      this.fetchBrandsData()
    ])
    this.renderPriceFilter()
    this.renderCategoriesFilter()
    this.renderBrandsFilter()
    this.renderRatingFilter()
    this.initEventListeners()
  }

  getTemplate () {
    return `
    <aside class="os-filters-panel">
      <form class="os-filters-panel-content" data-element="filters">

        <! -- Filters -->
      </form>
      <button data-element="clearFilters"
      class="os-btn-primary clear-filters"
      type="button">CLEAR ALL FILTERS
      </button>
    </aside>
    `;
  }

  renderPriceFilter () {
    const payload = {
      filterName: 'price',
      min: 0,
      max: 85000
    }
    this.components.priceFilter = new DoubleSlider(payload)
    const container = this.element.querySelector('[data-element="filters"]')
    container.appendChild(this.components.priceFilter.element)
  }


  renderCategoriesFilter () {
    console.log('this.categoriesFilterData', this.categoriesFilterData)
    if (this.categoriesFilterData && this.categoriesFilterData.length) {
      this.components.categoryFilter = new Filters({ name: 'category', data: this.categoriesFilterData })
      const container = this.element.querySelector('[data-element="filters"]')
      container.appendChild(this.components.categoryFilter.element)
    }
  }

  renderBrandsFilter () {
    console.log('this.brandsFilterData', this.brandsFilterData)
    if (this.brandsFilterData && this.brandsFilterData.length) {
      this.components.brandsFilter = new Filters({ name: 'brand', data: this.brandsFilterData })
      const container = this.element.querySelector('[data-element="filters"]')
      container.appendChild(this.components.brandsFilter.element)
    }
  }

  renderRatingFilter () {
    const payload = {
      filterName: 'rating',
      min: 0,
      max: 5,
      precision: 2
    }
    this.components.ratingFilter = new DoubleSlider(payload)
    const container = this.element.querySelector('[data-element="filters"]')
    container.appendChild(this.components.ratingFilter.element)
  }

initEventListeners () {
    this.components.priceFilter.element.addEventListener('range-selected', event => {
      const { filterName, value } = event.detail
      const filterString = `${filterName}_gte=${value.from}&${filterName}_lte=${value.to}`
      this.setFilters({ isActive: true, filter: filterString, filterType: 'filterSlider', filterName })
    })

    this.components.categoryFilter.element.addEventListener('filter-changed', event => {
      const payload = event.detail
      payload.filterType = 'filtersList'
      this.setFilters(event.detail)
    })

    this.components.brandsFilter.element.addEventListener('filter-changed', event => {
      const payload = event.detail
      payload.filterType = 'filtersList'
      this.setFilters(payload)
    })

    this.components.ratingFilter.element.addEventListener('range-selected', event => {
      const { filterName, value } = event.detail
      const filterString = `${filterName}_gte=${value.from}&${filterName}_lte=${value.to}`
      this.setFilters({ isActive: true, filter: filterString, filterType: 'filterSlider', filterName })
    })

    const resetBtn = this.element.querySelector('[data-element="clearFilters"]')
    resetBtn.addEventListener('click', event => {
      this.resetFilters()
    })
  }


  setFilters (payload) {
    if (payload.filterType === 'filtersList') {
      if (payload.isActive) {
        this.activeFilters.push(payload.filter)
      } else {
        this.activeFilters = this.activeFilters.filter(item => item !== payload.filter)
      }
    } else if (payload.filterType === 'filterSlider') {
      const filterIdx = this.activeFilters.findIndex(item => item.includes(payload.filterName))
      if (filterIdx >= 0) {
        this.activeFilters.splice(filterIdx, 1)
        this.activeFilters.push(payload.filter)
      } else {
        this.activeFilters.push(payload.filter)
      }
    }
    this.dispatchFilterChangeEvent()
  }

  resetFilters () {
    this.components.categoryFilter.element.reset()
    this.components.brandsFilter.element.reset()
    this.components.priceFilter.reset()
    this.components.ratingFilter.reset()

    this.activeFilters = []
    this.dispatchFiltersResetEvent()
  }

  dispatchFiltersResetEvent () {
    const customEvent = new CustomEvent('filters-reset')
    this.element.dispatchEvent(customEvent)
  }

  dispatchFilterChangeEvent () {
    const customEvent = new CustomEvent('filters-changed', {
      detail: this.activeFilters
    })
    this.element.dispatchEvent(customEvent)
  }

  async fetchCategoriesData () {
    const response = await fetch(this.categoriesUrl);
    this.categoriesFilterData = await response.json();
  }

  async fetchBrandsData () {
    const response = await fetch(this.brandsUrl);
    this.brandsFilterData = await response.json();
  }

  render () {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = this.getTemplate()
    this.element = wrapper.firstElementChild
  }

}
