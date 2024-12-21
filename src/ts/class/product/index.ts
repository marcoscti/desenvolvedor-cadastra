import { Product } from "../../types/Product"
import { Utils } from "../../utils/"
import { Cart } from "../cart"

export class ProductClass {
  private cart: Cart
  private utils: Utils
  private products: Product[] = []
  private selector: HTMLElement | null
  private items: HTMLElement | null
  private filter: HTMLElement | null

  constructor() {
    this.cart = new Cart()
    this.utils = new Utils()
    this.selector = document.querySelector('.itemDisabled')
    this.items = document.querySelector('.items')
    this.filter = document.querySelector('.filter')
    this.initialize()
  }

  private async initialize() {
    this.displayLoading(true)

    const products = await this.getProducts()
    if (products) {
      this.products = products
      this.createListProduct(products)
    }

    this.displayLoading(false)
    this.setupEventListeners()
  }

  private async getProducts(): Promise<Product[] | undefined> {
    try {
      const response = await fetch('http://localhost:5000/products')
      if (!response.ok) throw new Error("Failed to fetch products")
      const products: Product[] = await response.json()
      return products
    } catch (error) {
      console.error("Failed to load products:", error)
      alert("Erro ao carregar produtos. Tente novamente mais tarde.")
    }
  }

  private setupEventListeners() {
    if (this.selector && this.items) {
      this.selector.addEventListener('click', () => this.toggleItemsDisplay())
      this.items.addEventListener('click', (event) => this.handleItemSelection(event))
    }

    if (this.filter) {
      this.filter.addEventListener('change', () => this.applyFilters())
      this.setupSizeFilter()
    }
  }

  private toggleItemsDisplay() {
    if (this.items) this.items.classList.toggle('show')
  }

  private handleItemSelection(event: Event) {
    const target = event.target as HTMLElement
    if (target.classList.contains('item') && target.parentElement === this.items) {
      const criterion = target.getAttribute('data-order') as 'maiorpreco' | 'menorpreco' | 'recente'
      if (this.selector) this.selector.innerHTML = target.innerHTML
      this.toggleItemsDisplay()

      if (criterion) {
        const sortedProducts = this.sortProducts(this.products, criterion)
        this.createListProduct(sortedProducts)
      }
    }
  }

  private setupSizeFilter() {
    const sizeElements = document.querySelectorAll('.size[data-filter]')
    sizeElements.forEach(size => {
      size.addEventListener('click', () => {
        size.classList.toggle('selected')
        this.applyFilters()
      })
    })
  }

  private sortProducts(products: Product[], criterion: 'maiorpreco' | 'menorpreco' | 'recente'): Product[] {
    return products.sort((a, b) => {
      switch (criterion) {
        case 'maiorpreco':
          return b.price - a.price
        case 'menorpreco':
          return a.price - b.price
        case 'recente':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        default:
          console.warn("Critério de ordenação inválido:", criterion)
          return 0
      }
    })
  }

  private applyFilters() {
    
    const selectedColors = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-filter]:checked'))
      .map(input => input.getAttribute('data-filter')!)

    const selectedSizes = Array.from(document.querySelectorAll<HTMLElement>('.size[data-filter].selected'))
      .map(div => div.getAttribute('data-filter')!)

    const selectedPriceRanges = Array.from(document.querySelectorAll<HTMLInputElement>('.preco input[type="checkbox"][data-filter]:checked'))
      .map(input => input.getAttribute('data-filter')!)
    
    const priceRanges = selectedPriceRanges.map(range => {
      const [min, max] = range.split('-').map(Number)
      return max ? [min, max] : [min, Infinity]
    })
    
    this.filterProducts({
      color: selectedColors.length ? selectedColors : undefined,
      size: selectedSizes.length ? selectedSizes : undefined,
      price: priceRanges.length ? priceRanges : undefined,
    })
  }

  private filterProducts(filters: { color?: string[], size?: string[], price?: [number, number][] }) {
    const filteredProducts = this.products.filter(product => {
      const colorMatch = !filters.color || filters.color.includes(product.color)
      const sizeMatch = !filters.size || product.size.some(size => filters.size!.includes(size))
      const priceMatch = !filters.price || filters.price.filter(([min, max]) => product.price >= min && product.price <= max)
      return colorMatch && sizeMatch && priceMatch
    })
    this.createListProduct(filteredProducts)
  }

  private createListProduct(products: Product[]) {
    const listProducts = document.querySelector(".listProducts")
    if (!listProducts) return
    listProducts.innerHTML = ""
    if (products.length === 0) {
      const noProductsMessage = document.createElement("p")
      noProductsMessage.classList.add("no-products-message")
      noProductsMessage.textContent = "Nenhum produto encontrado com as opções selecionadas."
      listProducts.appendChild(noProductsMessage)
      return
    }

    const fragment = document.createDocumentFragment()
    products.forEach((product) => {
      const itemElement = this.createProductElement(product)
      fragment.appendChild(itemElement)
    })
    listProducts.appendChild(fragment)
  }

  private createProductElement(product: Product): HTMLElement {
    const productItem = document.createElement("li")
    productItem.classList.add("shelf-item")
    productItem.setAttribute("data-id", product.id)

    productItem.innerHTML = `
      <div class="image">
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="info">
        <h2 class="productName">${product.name} ${product.color}</h2>
        <div class="productSize">${this.generateSizeOptions(product)}</div>
        <p class="productPrice">${this.utils.convertPrice(product.price)}</p>
        <p class="productInstalments">até ${product.parcelamento[0]} x de ${this.utils.convertPrice(product.parcelamento[1])}</p>
      </div>
      <button class="addToCart">Comprar</button>
    `

    this.attachAddToCartEvent(productItem, product)
    return productItem
  }

  private generateSizeOptions(product: Product): string {
    return product.size.map(size => `
      <label>
        <input type="radio" name="${product.id}" value="${size}">
        ${size}
      </label>
    `).join("")
  }

  private attachAddToCartEvent(itemElement: HTMLElement, product: Product) {
    const button = itemElement.querySelector(".addToCart") as HTMLButtonElement
    button.addEventListener("click", () => this.handleAddToCart(itemElement, product))
  }

  private handleAddToCart(itemElement: HTMLElement, product: Product) {
    const selectedSize = itemElement.querySelector<HTMLInputElement>(`input[name="${product.id}"]:checked`)
    if (selectedSize) {
      const productWithSize = { ...product, selectedSize: selectedSize.value }
      this.cart.addToCart(productWithSize)
      this.cart.openCart()
    } else {
      alert("Por favor, selecione um tamanho antes de adicionar ao carrinho.")
    }
  }

  private displayLoading(show: boolean) {
    const loadingElement = document.querySelector('.loading')
    if (loadingElement) {
      loadingElement.style.display = show ? 'block' : 'none'
    }
  }
}
