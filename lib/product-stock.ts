export type ProductSizeStock = {
    printShopId: string;
    stock: number;
};

export function getStockForShop(stocks: ProductSizeStock[], printShopId: string) {
    return stocks.find((entry) => entry.printShopId === printShopId)?.stock ?? 0;
}

export function getTotalStock(stocks: ProductSizeStock[]) {
    return stocks.reduce((sum, entry) => sum + entry.stock, 0);
}
