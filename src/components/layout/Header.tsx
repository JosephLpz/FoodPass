'use client';

import { useAuth } from '@/hooks';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
    title: string;
    onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
    const { user, logout } = useAuth();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onMenuClick}
            >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
            </Button>

            {/* Title */}
            <h1 className="text-xl font-semibold text-slate-900 flex-1">{title}</h1>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                3
                            </Badge>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex flex-col items-start gap-1">
                            <span className="font-medium">Nuevo reporte disponible</span>
                            <span className="text-xs text-slate-500">Hace 5 minutos</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex flex-col items-start gap-1">
                            <span className="font-medium">15 registros pendientes</span>
                            <span className="text-xs text-slate-500">Hace 1 hora</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex flex-col items-start gap-1">
                            <span className="font-medium">Actualización del sistema</span>
                            <span className="text-xs text-slate-500">Hace 2 horas</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                    {user ? getInitials(user.name) : 'US'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">{user?.name}</p>
                                <p className="text-xs text-slate-500">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-red-600">
                            Cerrar sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
