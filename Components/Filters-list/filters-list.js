import toSnakeCase from "../../functions/toSnakeCase.js";

export default class Filters {
  constructor ({ name = 'Filter name', data = [] }) {
    this.filterName = name;
    this.filterData = data;



    this.render();
    this.renderFiltersItems();
    this.addEventListeners();

  }


getTemplate () {
  return `

    <form class="os-form-group divider">
      <h3 class="os-form-title">${this.filterName}</h3>
      <div data-element ="filterList">
        <! -- Filters -->
      </div>
    </form>

  `;
  }



  render () {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;
  }


  renderFiltersItems () {
    const filterItems = this.filterData.map(item => {
      const filterItem = document.createElement('div')
      filterItem.innerHTML = `
      <div class="os-filters-panel-item">
      <div class="os-form-checkbox">
        <input id="${this.filterName}=${toSnakeCase(item)}"
        type="checkbox"
        name="filter"
        value="${this.filterName}=${toSnakeCase(item)}">
        <label for="${this.filterName}=${toSnakeCase(item)}">${item}</label>
      </div>
    </div>
      `;

      return filterItem.firstElementChild;
    })

    const list = this.element.querySelector('[data-element="filterList"]')
    list.innerHTML = '';
    list.append(...filterItems);
  }

  addEventListeners () {
    this.element.addEventListener('submit', event => {
      event.preventDefault()
    })
    this.element.addEventListener('change', event => {
      this.dispatchFilterChangeEvent({
        filterName: this.filterName,
        filter: event.target.value,
        isActive: event.target.checked
      })
    })
  }

  dispatchFilterChangeEvent (payload) {
    const customEvent = new CustomEvent('filter-changed', {
      detail: payload
    })
    this.element.dispatchEvent(customEvent)
  }



}



