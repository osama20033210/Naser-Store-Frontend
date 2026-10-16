"use client";



import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { CartItem } from "@/lib/store-types";
import { addCartItem, parseCart } from "@/lib/cart";

const STORAGE_KEY="naser-orderly-cart";
const CartContext=createContext<{items:CartItem[];ready:boolean;count:number;add:(id:number,quantity?:number,limit?:number)=>boolean;setQuantity:(id:number,quantity:number)=>void;remove:(id:number)=>void;clear:()=>void}|null>(null);

export function CartProvider({children}:{children:ReactNode}){
  

 const [items,setItems]=useState<CartItem[]>([]),[ready,setReady]=useState(false);
 const currentItems = useRef<CartItem[]>([]);
 useEffect(()=>{
  try{
   const saved:unknown=JSON.parse(localStorage.getItem(STORAGE_KEY)??"[]");
   currentItems.current = parseCart(saved);
   setItems(currentItems.current);
  }catch{/* A blocked or corrupt browser cart must not prevent browsing. */}
  setReady(true);
 },[]);
 useEffect(()=>{if(ready){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(items))}catch{/* Browser storage is optional. */}}},[items,ready]);
 const value=useMemo(()=>({
  items,ready,count:items.reduce((total,item)=>total+item.quantity,0),
  add:(id:number,quantity=1,limit=100000)=>{
   if(!ready)return false;
   const result = addCartItem(currentItems.current, id, quantity, limit);
   if(result.added){currentItems.current=result.items;setItems(result.items)}
   return result.added;
  },
  setQuantity:(id:number,quantity:number)=>{if(Number.isInteger(quantity)&&quantity>=1&&quantity<=100000){currentItems.current=currentItems.current.map(item=>item.product_id===id?{...item,quantity}:item);setItems(currentItems.current)}},
  remove:(id:number)=>{currentItems.current=currentItems.current.filter(item=>item.product_id!==id);setItems(currentItems.current)},
  clear:()=>{currentItems.current=[];setItems([])},
 }),[items,ready]);
 return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart(){const context=useContext(CartContext);if(!context)throw new Error("CartProvider is missing");return context}
