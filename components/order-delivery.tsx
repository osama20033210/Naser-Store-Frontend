"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { Badge, Button, Card, Dialog } from "@/components/ui";
import { api } from "@/lib/api";
import { money } from "@/lib/format";
import type { Order } from "@/lib/types";

export function OrderDelivery({order}:{order:Order}){
 const auth=useAuth(),client=useQueryClient(),[confirm,setConfirm]=useState(false);
 const collect=useMutation({mutationFn:()=>api(`/orders/${order.id}/payment`,{method:"PATCH",body:JSON.stringify({payment_status:"paid"})}),onSuccess:async()=>{setConfirm(false);await client.invalidateQueries({queryKey:["orders"]});toast.success("Cash collection recorded")},onError:error=>toast.error(error.message)});
 return <>{order.shipping&&<Card><h2 className="font-bold">Delivery snapshot</h2><p className="mt-3 text-sm font-semibold">{order.shipping.name}</p><p className="mt-2 text-sm text-slate-500">{order.shipping.phone}</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-500">{order.shipping.address}</p><p className="mt-3 text-xs text-slate-400">Address saved when the order was placed.</p></Card>}{order.payment_method==="cash_on_delivery"&&<Card><h2 className="font-bold">Cash on delivery</h2><div className="mt-3"><Badge tone={order.payment_status==="paid"?"green":"amber"}>{order.payment_status==="paid"?"Collected":"Not collected"}</Badge></div><p className="mt-3 text-sm font-semibold">{money(order.total_minor)}</p>{order.status==="completed"&&order.payment_status==="unpaid"&&auth.can("orders.manage-payment")&&<Button className="mt-4" onClick={()=>setConfirm(true)}>Record cash collected</Button>}<p className="mt-3 text-xs text-slate-500">Completion does not automatically mark payment as collected.</p></Card>}<Dialog title="Confirm cash collection" open={confirm} onOpenChange={open=>{if(!collect.isPending)setConfirm(open)}}><p className="text-sm text-slate-500">Confirm that {money(order.total_minor)} has actually been collected for this completed order. This records collection; it does not charge an online payment.</p><div className="mt-5 flex justify-end gap-3"><Button variant="outline" disabled={collect.isPending} onClick={()=>setConfirm(false)}>Cancel</Button><Button disabled={collect.isPending} onClick={()=>collect.mutate()}>{collect.isPending?"Recording…":"Confirm collection"}</Button></div></Dialog></>;
}
