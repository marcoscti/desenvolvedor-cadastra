import { PropCart } from "../../types/Cart"
import { Product } from "../../types/Product"
import { Utils } from "../../utils"

export class Cart {
  private minicart = document.querySelector(".minicart")
  private overlay = document.querySelector(".overlay")
  private minicartQuantity = document.querySelector(".minicartQuantity") as HTMLElement
  private divCart = document.querySelector("#minicart-content") as HTMLElement
  private utils: Utils
  constructor() {
    this.init()
    this.utils = new Utils()
  }

  private init() {
    this.updateMinicartQuantity()
    this.setupMinicartToggle()
    this.setupCloseEvent() 
  }

  addToCart(product: Product) {
    const cart = this.getCart()
    const existingProduct = cart.find((item: Product) => item.id === product.id)
  
    const productToAdd = { 
      ...product, 
      quantity: 1, 
      selectedSize: product.size[0] // assuming the first size as default adjust as needed
    }
  
    if (existingProduct) {
      existingProduct.quantity++
    } else {
      cart.push(productToAdd)
    }
  
    this.updateCart(cart)
  }

  private setupMinicartToggle() {
    const btnMinicart = document.querySelector("#btn-minicart")
    btnMinicart?.addEventListener("click", () => this.openCart())
  }

  openCart() {
    this.overlay?.classList.add('active')
    this.minicart?.classList.add('active')
    this.populateMinicart()
  }

  closeCart() {
    this.overlay?.classList.remove('active')
    this.minicart?.classList.remove('active')
  }

  private setupCloseEvent() {
    this.overlay?.addEventListener('click', () => this.closeCart())
    const btnCloseMinicart = document.querySelector("#btn-close-minicart")
    btnCloseMinicart?.addEventListener("click", () => this.closeCart())
  }

  private updateCart(cart: Product[]) {
    localStorage.setItem("cart", JSON.stringify(cart))
    this.updateMinicartQuantity()
    this.populateMinicart()
    this.updateTotals()
  }

  private updateMinicartQuantity() {
    const cart = this.getCart()
    this.minicartQuantity.textContent = cart.length.toString()
  }

  private populateMinicart() {
    if (!this.divCart) return

    this.divCart.innerHTML = ""
    const cart = this.getCart()

    cart.forEach((item: PropCart) => {
      const cartItem = this.createCartItemElement(item)
      this.divCart.appendChild(cartItem)
    })

    this.updateTotals()
  }

  private updateTotals() {
    const subtotal = this.getCart().reduce((acc, item) => acc + item.price * item.quantity, 0)
    const subtotalValue = document.querySelector(".value-subtotal") as HTMLElement
    const totalValue = document.querySelector(".value-total") as HTMLElement
    subtotalValue.innerHTML = this.utils.convertPrice(subtotal)
    totalValue.innerHTML = this.utils.convertPrice(subtotal)
  }


  private createCartItemElement(product: PropCart): HTMLElement {
    const item = document.createElement("li")
    item.classList.add("minicart-item")
    item.setAttribute("data-id", product.id)

    item.innerHTML = `
      <div class="image">
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="product-info">
        <h2 class="productName">${product.name}</h2>
        <p class="productColor"><strong>Cor:</strong> ${product.color} - <strong>Tamanho:</strong> ${product.selectedSize}</p>
        <div class="product-quantity">
          <button class="decreaseQuantity">-</button>
          <input class="quantity" value="${product.quantity}" type="text" min="1" max="100" pattern="\\d*" title="Apenas números são permitidos" />
          <button class="increaseQuantity">+</button>
        </div>
      </div>
      <div class="product-price">
        <p class="productPrice">${this.utils.convertPrice(product.price)}</p>
        <button class="removeItem"></button>
      </div>
    `

    this.setupCartItemEvents(item, product)
    return item
  }

  private setupCartItemEvents(item: HTMLElement, product: PropCart) {
    const removeButton = item.querySelector(".removeItem") as HTMLButtonElement
    removeButton.addEventListener("click", () => this.removeItem(product))

    const increaseButton = item.querySelector(".increaseQuantity") as HTMLButtonElement
    increaseButton.addEventListener("click", () => this.changeQuantity(product, product.quantity + 1))

    const decreaseButton = item.querySelector(".decreaseQuantity") as HTMLButtonElement
    decreaseButton.addEventListener("click", () => {
      if (product.quantity > 1) {
        this.changeQuantity(product, product.quantity - 1)
      }
    })
  }

  private changeQuantity(product: PropCart, quantity: number) {
    const cart = this.getCart()
    const cartProduct = cart.find((item) => item.id === product.id)

    if (cartProduct) {
      cartProduct.quantity = quantity
      this.updateCart(cart)
    }
  }

  private removeItem(product: PropCart) {
    let cart = this.getCart()
    cart = cart.filter((item) => item.id !== product.id)
    this.updateCart(cart)
  }

  private getCart(): PropCart[] {
    return JSON.parse(localStorage.getItem("cart") || "[]")
  }
}
