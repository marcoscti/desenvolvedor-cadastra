import { Product } from "./Product";
export interface PropCart extends Product {
  quantity: number;
  selectedSize: string;
}