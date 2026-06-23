import { ProductsTable } from '@/components/admin/products-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllProducts } from '@/lib/queries/products';

export default async function AdminProductsPage() {
    const products = await getAllProducts();

    return (
        <>
            <div>
                <h1 className="text-2xl font-semibold">Produkter</h1>
                <p className="text-sm text-muted-foreground">Administrer produkter, størrelser og lagerbeholdning.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Produktkatalog</CardTitle>
                    <CardDescription>Produkter som vises på forsiden når de er aktive.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductsTable products={products} />
                </CardContent>
            </Card>
        </>
    );
}
