import { ProductClass } from "../class/product"
import { Product } from "../types/Product"

export class Utils {
  constructor() {
    this.openFilter()
  }
  public convertPrice(price: number) {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }
  public openFilter() {
    const filter = document.querySelector('.filterMobile') as HTMLElement
    const close = document.querySelector('.closeMbile') as HTMLElement
    const clearMobile = document.querySelector('.clearMobile') as HTMLElement
    const closeMobile = document.querySelector('.closeMobile') as HTMLElement
    const ordenarMobile = document.querySelector('.ordenarMobile') as HTMLElement
    const ordenarClose = document.querySelector('.ordenarClose') as HTMLElement
    filter.addEventListener('click', () => {
      let filter = document.querySelector('.filter') as HTMLElement
      filter.style.display = 'block'
    })
    close.addEventListener('click', () => {
      let filter = document.querySelector('.filter') as HTMLElement
      filter.removeAttribute('style')
    })
    clearMobile.addEventListener('click', () => {
      let filter = document.querySelector('.filter') as HTMLElement
      filter.removeAttribute('style')
    })
    closeMobile.addEventListener('click', () => {
      let filter = document.querySelector('.filter') as HTMLElement
      filter.removeAttribute('style')
    })
    ordenarMobile.addEventListener('click', () => {
      let filter = document.querySelector('.ordenar') as HTMLElement
      filter.style.display = 'block'
    })
    ordenarClose.addEventListener('click', () => {
      let filter = document.querySelector('.ordenar') as HTMLElement
      filter.removeAttribute('style')
    })
  }
}