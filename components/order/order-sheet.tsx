'use client';

import { CheckCircle2Icon } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/components/cart/cart-provider';
import { OrderSummary } from '@/components/order/order-summary';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { PrintShopRecord } from '@/lib/queries/print-shops';

type OrderSheetProps = {
    printShops: PrintShopRecord[];
};

export function OrderSheet({ printShops }: OrderSheetProps) {
    const { orderSheetOpen, setOrderSheetOpen } = useCart();
    const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
    const [resetKey, setResetKey] = useState(0);

    function handleOpenChange(open: boolean) {
        setOrderSheetOpen(open);

        if (!open) {
            setSubmittedOrderId(null);
            setResetKey((key) => key + 1);
        }
    }

    function handleSuccess(orderId: string) {
        setSubmittedOrderId(orderId);
    }

    function handleClose() {
        setOrderSheetOpen(false);
        setSubmittedOrderId(null);
    }

    const isSuccess = submittedOrderId !== null;

    return (
        <Sheet open={orderSheetOpen} onOpenChange={handleOpenChange}>
            <SheetContent className="flex w-full flex-col sm:max-w-md">
                {isSuccess ? (
                    <>
                        <SheetHeader>
                            <SheetTitle>Bestilling sendt</SheetTitle>
                            <SheetDescription>
                                Bestillingen er registrert og klar for videre behandling.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-6 text-center">
                            <CheckCircle2Icon className="size-12 text-green-600" />
                            <div className="space-y-1">
                                <p className="font-medium">Takk for bestillingen!</p>
                                <p className="text-sm text-muted-foreground">Referanse: {submittedOrderId}</p>
                            </div>
                        </div>
                        <div className="border-t p-6">
                            <Button className="w-full" onClick={handleClose}>
                                Lukk
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <SheetHeader>
                            <SheetTitle>Bestilling</SheetTitle>
                            <SheetDescription>Gjennomgå ordrelinjer og send inn bestillingen.</SheetDescription>
                        </SheetHeader>
                        <OrderSummary key={resetKey} printShops={printShops} onSuccess={handleSuccess} />
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
