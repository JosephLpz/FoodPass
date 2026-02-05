'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardStats, getRecentConsumptions } from '@/lib/api/services';
import { formatMealType } from '@/lib/api/mock-data';
import { DashboardStats, Consumption } from '@/types';
import { useMealType } from '@/hooks';
import {
    Users,
    UtensilsCrossed,
    Coffee,
    Sun,
    Moon,
    Clock,
    TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentConsumptions, setRecentConsumptions] = useState<Consumption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currentMealLabel, currentTime } = useMealType();

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [statsRes, consumptionsRes] = await Promise.all([
                    getDashboardStats(),
                    getRecentConsumptions(5),
                ]);

                if (statsRes.success && statsRes.data) {
                    setStats(statsRes.data);
                }
                if (consumptionsRes.success && consumptionsRes.data) {
                    setRecentConsumptions(consumptionsRes.data);
                }
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    const formatTime = (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getMealIcon = (mealType: string) => {
        switch (mealType) {
            case 'desayuno':
                return <Coffee className="h-4 w-4 text-amber-500" />;
            case 'almuerzo':
                return <Sun className="h-4 w-4 text-yellow-500" />;
            case 'cena':
                return <Moon className="h-4 w-4 text-indigo-500" />;
            default:
                return <UtensilsCrossed className="h-4 w-4" />;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Stats skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Current meal type indicator */}
            <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-emerald-100">Comida actual</p>
                                <p className="text-xl font-bold">{currentMealLabel}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-emerald-100">
                                {currentTime.toLocaleDateString('es-CL', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                })}
                            </p>
                            <p className="text-2xl font-bold">{formatTime(currentTime)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Personas hoy"
                    value={stats?.totalPersonsToday || 0}
                    icon={Users}
                    trend={{
                        value: stats?.comparisonYesterday.persons || 0,
                        isPositive: (stats?.comparisonYesterday.persons || 0) > 0,
                    }}
                    description="vs ayer"
                />
                <StatsCard
                    title="Consumos totales"
                    value={stats?.totalConsumptions || 0}
                    icon={UtensilsCrossed}
                    trend={{
                        value: stats?.comparisonYesterday.consumptions || 0,
                        isPositive: (stats?.comparisonYesterday.consumptions || 0) > 0,
                    }}
                    description="vs ayer"
                    iconColor="text-blue-600 bg-blue-100"
                />
                <StatsCard
                    title="Desayunos"
                    value={stats?.breakfastCount || 0}
                    icon={Coffee}
                    description="hoy"
                    iconColor="text-amber-600 bg-amber-100"
                />
                <StatsCard
                    title="Almuerzos"
                    value={stats?.lunchCount || 0}
                    icon={Sun}
                    description="hoy"
                    iconColor="text-yellow-600 bg-yellow-100"
                />
            </div>

            {/* Meal breakdown and recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Meal breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            Distribución de comidas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: 'Desayuno', value: stats?.breakfastCount || 0, color: 'bg-amber-500', icon: Coffee },
                                { name: 'Almuerzo', value: stats?.lunchCount || 0, color: 'bg-yellow-500', icon: Sun },
                                { name: 'Cena', value: stats?.dinnerCount || 0, color: 'bg-indigo-500', icon: Moon },
                            ].map((meal) => {
                                const total = (stats?.breakfastCount || 0) + (stats?.lunchCount || 0) + (stats?.dinnerCount || 0);
                                const percentage = total > 0 ? (meal.value / total) * 100 : 0;

                                return (
                                    <div key={meal.name} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <meal.icon className="h-4 w-4 text-slate-500" />
                                                <span className="font-medium text-slate-700">{meal.name}</span>
                                            </div>
                                            <span className="text-slate-600">{meal.value} ({percentage.toFixed(0)}%)</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${meal.color} rounded-full transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-emerald-600" />
                            Actividad reciente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentConsumptions.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <UtensilsCrossed className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                <p>No hay consumos registrados hoy</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentConsumptions.map((consumption) => (
                                    <div
                                        key={consumption.id}
                                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                                    >
                                        <div className="p-2 bg-white rounded-full shadow-sm">
                                            {getMealIcon(consumption.mealType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 truncate">
                                                {consumption.personName}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {consumption.companyName}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="secondary" className="text-xs">
                                                {formatMealType(consumption.mealType)}
                                            </Badge>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {formatTime(consumption.registeredAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
