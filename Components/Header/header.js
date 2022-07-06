export default class Header {
    constructor(){
      this.render();
    }
  
  
  
    getTemplate() {
      return `
      <header class="os-header">
        <span class="os-logo-text">Online Storerererer</span>
        <button class="cart os-btn-primary" data-element="cartBtn">
          <i class="bi bi-cart">
            CART
          </i>
        </button>
      </header>
      `;
    }
  
    render(){
      const wrapper = document.createElement('div');
  
      wrapper.innerHTML = this.getTemplate();
  
      this.element = wrapper.firstElementChild;
    }
  }
  