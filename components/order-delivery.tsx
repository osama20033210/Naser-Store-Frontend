"use client";
import { useLocale } from "@/components/locale-provider";


import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { Badge, Button, Card, Dialog } from "@/components/ui";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";

export function OrderDelivery({order}:{order:Order}){
  const { t, errorText, money } = useLocale();

 const auth=useAuth(),client=useQueryClient(),[confirm,setConfirm]=useState(false);
 const collect=useMutation({mutationFn:()=>api(`/orders/${order.id}/payment`,{method:"PATCH",body:JSON.stringify({payment_status:"paid"})}),onSuccess:async()=>{setConfirm(false);await client.invalidateQueries({queryKey:["orders"]});toast.success(t("Cash collection recorded"))},onError:error=>toast.error(errorText(error.message))});
 return <>{order.shipping&&<Card><h2 className="font-bold">{t("Delivery snapshot")}</h2><p className="mt-3 text-sm font-semibold">{order.shipping.name}</p><p className="mt-2 text-sm text-slate-500">{order.shipping.phone}</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-500">{order.shipping.address}</p><p className="mt-3 text-xs text-slate-400">{t("Address saved when the order was placed.")}</p></Card>}{order.payment_method==="cash_on_delivery"&&<Card><h2 className="font-bold">{t("Cash on delivery")}</h2><div className="mt-3"><Badge tone={order.payment_status==="paid"?"green":"amber"}>{order.payment_status==="paid"?t("Collected"):t("Not collected")}</Badge></div><p className="mt-3 text-sm font-semibold">{money(order.total_minor)}</p>{order.status==="completed"&&order.payment_status==="unpaid"&&auth.can("orders.manage-payment")&&<Button className="mt-4" onClick={()=>setConfirm(true)}>{t("Record cash collected")}</Button>}<p className="mt-3 text-xs text-slate-500">{t("Completion does not automatically mark payment as collected.")}</p></Card>}<Dialog title={t("Confirm cash collection")} open={confirm} onOpenChange={open=>{if(!collect.isPending)setConfirm(open)}}><p className="text-sm text-slate-500">{t("Confirm that")} {money(order.total_minor)} {t("has actually been collected for this completed order. This records collection; it does not charge an online payment.")}</p><div className="mt-5 flex justify-end gap-3"><Button variant="outline" disabled={collect.isPending} onClick={()=>setConfirm(false)}>{t("Cancel")}</Button><Button disabled={collect.isPending} onClick={()=>collect.mutate()}>{collect.isPending?t("Recording…"):t("Confirm collection")}</Button></div></Dialog></>;
}
