"use client";



import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem } from "@/lib/store-types";

const STORAGE_KEY="naser-orderly-cart";
const CartContext=createContext<{items:CartItem[];ready:boolean;count:number;add:(id:number,quantity?:number,limit?:number)=>boolean;setQuantity:(id:number,quantity:number)=>void;remove:(id:number)=>void;clear:()=>void}|null>(null);

export function CartProvider({children}:{children:ReactNode}){
  

 const [items,setItems]=useState<CartItem[]>([]),[ready,setReady]=useState(false);
 useEffect(()=>{
  try{
   const saved:unknown=JSON.parse(localStorage.getItem(STORAGE_KEY)??"[]");
   if(Array.isArray(saved)){
    const seen=new Set<number>();
    const valid=saved.filter((item):item is CartItem=>{
     if(!item||typeof item!=="object"||!Number.isSafeInteger(item.product_id)||item.product_id<1||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>100000||seen.has(item.product_id))return false;
     seen.add(item.product_id);return true;
    }).slice(0,100).map(({product_id,quantity})=>({product_id,quantity}));
    setItems(valid);
   }
  }catch{/* A blocked or corrupt browser cart must not prevent browsing. */}
  setReady(true);
 },[]);
 useEffect(()=>{if(ready){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(items))}catch{/* Browser storage is optional. */}}},[items,ready]);
 const value=useMemo(()=>({
  items,ready,count:items.reduce((total,item)=>total+item.quantity,0),
  add:(id:number,quantity=1,limit=100000)=>{
   const existing=items.find(item=>item.product_id===id);
   if(!ready||!Number.isInteger(quantity)||quantity<1||quantity+(existing?.quantity??0)>Math.min(limit,100000)||(!existing&&items.length>=100))return false;
   setItems(current=>{const found=current.find(item=>item.product_id===id);return found?current.map(item=>item.product_id===id?{...item,quantity:Math.min(item.quantity+quantity,limit,100000)}:item):[...current,{product_id:id,quantity}]});
   return true;
  },
  setQuantity:(id:number,quantity:number)=>{if(Number.isInteger(quantity)&&quantity>=1&&quantity<=100000)setItems(current=>current.map(item=>item.product_id===id?{...item,quantity}:item))},
  remove:(id:number)=>setItems(current=>current.filter(item=>item.product_id!==id)),
  clear:()=>setItems([]),
 }),[items,ready]);
 return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart(){const context=useContext(CartContext);if(!context)throw new Error("CartProvider is missing");return context}
