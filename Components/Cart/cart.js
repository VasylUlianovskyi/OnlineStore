export default class Cart {
  constructor () {
    this.totalPrice = 0
    this.render()
    this.initEventListeners()
    this.update()
  }

  getTemplate () {
    return `
      <div class="cart-container">
        <div class="os-cart__container" data-element="modalContainer">
          <header class="close-header">
            <p>Cart</p>
            <i class="bi bi-x-lg" data-element="closeBtn"></i>
          </header>
          <main class="os-cart__main">
            <ul class="cart-list" data-element="list">
              <!-- products -->
            </ul>
            <footer class="footer">
              <div class="cart-total">
                Total: <span data-element="total">${this.totalPrice}</span>
              </div>
              <button class="order-btn os-btn-primary" data-element="order">Order</button>
            </footer>
          </main>
        </div>
      </div>
    `
  }

  update (products = []) {
    const productItems = products.map(item => {
      const product = document.createElement('div')
      product.innerHTML = `
        <li class="item-row">
          <div class="item-preview">
            <img width="54" height="40" src="${item.images[0]}" alt="">
          </div>
          <div class="item-name">${item.title}</div>
          <div class="item-counter">
            <button class="count-btn" data-control="decrementQuantity" data-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button class="counter-btn" data-control="incrementQuantity" data-id="${item.id}">+</button>
          </div>
          <div class="product__price">${item.price}</div>
        </li>
      `
      return product.firstElementChild
    })

    const list = this.element.querySelector('[data-element="list"]')
    list.innerHTML = ''
    list.append(...productItems)

    this.totalPrice = this.getTotalPrice(products)
    this.element.querySelector('[data-element="total"]').innerHTML = this.totalPrice
  }

  getTotalPrice (products) {
    return products.reduce((acc, cur) => {
      const price = cur.price * cur.quantity
      return acc + price
    }, 0)
  }

  render () {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = this.getTemplate()
    this.element = wrapper.firstElementChild
  }

  initEventListeners () {
    const closeBtn = this.element.querySelector('[data-element="closeBtn"]')
    closeBtn.addEventListener('click', event => {
      this.close();
    })

    const modalContainer = this.element.querySelector('[data-element="modalContainer"]')
    modalContainer.addEventListener('click', event => {
      event.stopPropagation()
    })

    this.element.addEventListener('click', event => {
      this.close()
    })

    const list = this.element.querySelector('[data-element="list"]')
    list.addEventListener('click', event => {
      const { dataset } = event.target
      if (dataset.control) {
        if (dataset.control === 'decrementQuantity') this.dispatchDecrementEvent(dataset.id)
        if (dataset.control === 'incrementQuantity') this.dispatchIncrementEvent(dataset.id)
      }
    })
  }

  dispatchDecrementEvent (productId) {
    this.element.dispatchEvent(new CustomEvent('decrement-cart-product', {
      detail: productId
    }))
  }

  dispatchIncrementEvent (productId) {
    this.element.dispatchEvent(new CustomEvent('increment-cart-product', {
      detail: productId
    }))
  }

  open () {
    if (!this.element.classList.contains('cart-container--visible')) {
      this.element.classList.add('cart-container--visible')
    }
  }

  close () {
    if (this.element.classList.contains('cart-container--visible')) {
      this.element.classList.remove('cart-container--visible')
    }
  }
}
