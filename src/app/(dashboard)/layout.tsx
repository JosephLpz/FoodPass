'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { Loader2 } from 'lucide-react';

// Page titles mapping
const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/registro': 'Registro de Consumo',
    '/registros': 'Registros del Día',
    '/personas': 'Personas',
    '/empresas': 'Empresas',
    '/comedores': 'Comedores',
    '/reportes': 'Reportes',
    '/usuarios': 'Usuarios',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <p className="text-sm text-slate-600">Cargando...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    const pageTitle = pageTitles[pathname] || 'FoodPass';

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile Navigation */}
            <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

            {/* Main content area */}
            <div className="lg:pl-64">
                <Header title={pageTitle} onMenuClick={() => setMobileNavOpen(true)} />

                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
