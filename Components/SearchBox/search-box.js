import { debounce } from "../../functions/debouce.js";

export default class Search {
  constructor () {
    this.searchValue = ''
    this.render ();
    this.addEventListeners();
  }

  getTemplate() {
    return `
    <form>
    <div class="os-form-input use-icon">
      <input
        id="search-input"
        value="${this.searchValue}"
        type="text"
        data-element="search"
        placeholder="Search">
      <label class="bi bi-search input-icon" for="search-input"></label>
    </div>
    </form>
    `;
  }

  render(){
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;
  }


  addEventListeners () {
    const searchInput = this.element.querySelector('[data-element="search"]')

    searchInput.addEventListener('input', event => {
      this.searchValue = event.target.value.trim()

      this.dispatchSearchChangeEvent()
    })
  }

  dispatchSearchChangeEvent = debounce(() => {
    const customEvent = new CustomEvent('search-changed', {
      detail: this.searchValue
    })

    this.element.dispatchEvent(customEvent)
  }, 250);
}
