'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { getDiningHalls, deleteDiningHall } from '@/lib/api/services';
import { DiningHall } from '@/types';
import { UtensilsCrossed, MapPin, Users, TrendingUp, Plus, Edit2, Trash2 } from 'lucide-react';
import { DiningHallFormModal } from '@/components/modals/DiningHallFormModal';
import { toast } from 'sonner';

export default function ComedoresPage() {
    const [diningHalls, setDiningHalls] = useState<DiningHall[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHall, setSelectedHall] = useState<DiningHall | null>(null);

    const loadDiningHalls = async () => {
        setIsLoading(true);
        try {
            const response = await getDiningHalls(1, 50);
            if (response.success && response.data) {
                setDiningHalls(response.data.items);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDiningHalls();
    }, []);

    const handleAdd = () => {
        setSelectedHall(null);
        setIsModalOpen(true);
    };

    const handleEdit = (hall: DiningHall) => {
        setSelectedHall(hall);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Está seguro de que desea desactivar este comedor?')) return;

        try {
            const response = await deleteDiningHall(id);
            if (response.success) {
                toast.success('Comedor desactivado');
                loadDiningHalls();
            } else {
                toast.error(response.error || 'Error al desactivar');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    const totalCapacity = diningHalls.reduce((sum, dh) => sum + dh.capacity, 0);
    const todayConsumptions = diningHalls.reduce((sum, dh) => sum + dh.todayConsumptions, 0);
    const totalConsumptions = diningHalls.reduce((sum, dh) => sum + dh.totalConsumptions, 0);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <UtensilsCrossed className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{diningHalls.length}</p>
                                <p className="text-sm text-slate-500">Comedores</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Users className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{totalCapacity}</p>
                                <p className="text-sm text-slate-500">Capacidad total</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{todayConsumptions}</p>
                                <p className="text-sm text-slate-500">Consumos hoy</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-100 rounded-lg">
                                <UtensilsCrossed className="h-5 w-5 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{totalConsumptions.toLocaleString()}</p>
                                <p className="text-sm text-slate-500">Consumos totales</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5 text-emerald-600" />
                    Listado de Comedores
                </h2>
                <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Comedor
                </Button>
            </div>

            {/* Dining halls grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoading ? (
                    [...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="py-6">
                                <Skeleton className="h-6 w-48 mb-3" />
                                <Skeleton className="h-4 w-32 mb-4" />
                                <Skeleton className="h-2 w-full mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </CardContent>
                        </Card>
                    ))
                ) : diningHalls.length === 0 ? (
                    <Card className="col-span-full">
                        <CardContent className="py-12 text-center">
                            <UtensilsCrossed className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500">No hay comedores registrados</p>
                        </CardContent>
                    </Card>
                ) : (
                    diningHalls.map((diningHall) => {
                        const occupancyPercent = diningHall.capacity > 0
                            ? (diningHall.todayConsumptions / diningHall.capacity) * 100
                            : 0;

                        return (
                            <Card key={diningHall.id} className="relative overflow-hidden group">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{diningHall.name}</CardTitle>
                                            <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                                                <MapPin className="h-4 w-4" />
                                                {diningHall.location}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge
                                                variant={diningHall.isActive ? 'default' : 'secondary'}
                                                className={
                                                    diningHall.isActive
                                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                                        : 'bg-slate-100 text-slate-500'
                                                }
                                            >
                                                {diningHall.isActive ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(diningHall)}
                                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(diningHall.id)}
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Capacity usage */}
                                        <div>
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-slate-600">Ocupación hoy</span>
                                                <span className="font-medium">
                                                    {diningHall.todayConsumptions} / {diningHall.capacity}
                                                </span>
                                            </div>
                                            <Progress value={Math.min(occupancyPercent, 100)} className="h-2" />
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                                <p className="text-2xl font-bold text-emerald-600">
                                                    {diningHall.todayConsumptions}
                                                </p>
                                                <p className="text-xs text-slate-500">Hoy</p>
                                            </div>
                                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                                <p className="text-2xl font-bold text-slate-700">
                                                    {diningHall.totalConsumptions.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-slate-500">Total histórico</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            <DiningHallFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadDiningHalls}
                diningHall={selectedHall}
            />
        </div>
    );
}
