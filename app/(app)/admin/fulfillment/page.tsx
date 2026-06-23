import { PrintShopsTable } from '@/components/admin/print-shops-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllPrintShops } from '@/lib/queries/print-shops';

export default async function AdminFulfillmentPage() {
    const printShops = await getAllPrintShops();

    return (
        <>
            <div>
                <h1 className="text-2xl font-semibold">Trykkeri</h1>
                <p className="text-sm text-muted-foreground">Administrer trykkeri brukere kan velge ved bestilling.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Trykkeri</CardTitle>
                    <CardDescription>Listen brukes i nedtrekksmenyen når brukere sender bestilling.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PrintShopsTable printShops={printShops} />
                </CardContent>
            </Card>
        </>
    );
}
