'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    ScanLine,
    Users,
    Building2,
    UtensilsCrossed,
    FileText,
    UserCog,
    LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Registro QR', href: '/registro', icon: ScanLine },
    { name: 'Registros', href: '/registros', icon: UtensilsCrossed },
    { name: 'Personas', href: '/personas', icon: Users },
    { name: 'Empresas', href: '/empresas', icon: Building2 },
    { name: 'Comedores', href: '/comedores', icon: UtensilsCrossed },
    { name: 'Reportes', href: '/reportes', icon: FileText },
    { name: 'Usuarios', href: '/usuarios', icon: UserCog },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    return (
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-900 text-white">
            {/* Logo */}
            <div className="flex items-center h-16 px-6 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <UtensilsCrossed className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">FoodPass</span>
                </div>
            </div>

            <ScrollArea className="flex-1 py-4">
                <nav className="px-3 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-emerald-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </ScrollArea>

            <Separator className="bg-slate-800" />

            {/* User section */}
            <div className="p-4">
                {user && (
                    <div className="flex flex-col gap-3">
                        <div className="px-2">
                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                            onClick={logout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar sesión
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
