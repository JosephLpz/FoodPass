'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getConsumptions, getCompanies } from '@/lib/api/services';
import { Consumption, Company } from '@/types';
import { toast } from 'sonner';
import { Search, Filter, Calendar, UtensilsCrossed, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function RegistrosPage() {
    const [consumptions, setConsumptions] = useState<Consumption[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 20;

    // Filters
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedCompany, setSelectedCompany] = useState<string>('all');
    const [selectedMealType, setSelectedMealType] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function loadInitialData() {
            const companiesRes = await getCompanies(1, 100);
            if (companiesRes.success && companiesRes.data) {
                setCompanies(companiesRes.data.items);
            }
        }
        loadInitialData();
    }, []);

    useEffect(() => {
        async function loadConsumptions() {
            setIsLoading(true);
            try {
                const response = await getConsumptions(page, pageSize, {
                    companyId: selectedCompany,
                    mealType: selectedMealType,
                    workerName: searchTerm,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                });

                if (response.success && response.data) {
                    setConsumptions(response.data.items);
                    setTotal(response.data.total);
                    setTotalPages(response.data.totalPages);
                } else {
                    toast.error('Error al cargar los registros');
                }
            } finally {
                setIsLoading(false);
            }
        }

        const timer = setTimeout(() => {
            loadConsumptions();
        }, 300); // Debounce search

        return () => clearTimeout(timer);
    }, [page, selectedCompany, selectedMealType, searchTerm, startDate, endDate]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getMealTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            desayuno: 'bg-blue-100 text-blue-800 border-blue-200',
            almuerzo: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            cena: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            colacion: 'bg-amber-100 text-amber-800 border-amber-200',
        };
        return (
            <Badge variant="outline" className={`${colors[type] || 'bg-slate-100'} capitalize`}>
                {type}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Filter className="h-5 w-5 text-emerald-600" />
                        Filtros de Búsqueda
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-2 lg:col-span-1">
                            <Label htmlFor="search">Trabajador</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="search"
                                    placeholder="Nombre..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Desde</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">Hasta</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Empresa</Label>
                            <Select
                                value={selectedCompany}
                                onValueChange={(v) => {
                                    setSelectedCompany(v);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las empresas</SelectItem>
                                    {companies.map((company) => (
                                        <SelectItem key={company.id} value={company.id}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Comida</Label>
                            <Select
                                value={selectedMealType}
                                onValueChange={(v) => {
                                    setSelectedMealType(v);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los tipos</SelectItem>
                                    <SelectItem value="desayuno">Desayuno</SelectItem>
                                    <SelectItem value="almuerzo">Almuerzo</SelectItem>
                                    <SelectItem value="cena">Cena</SelectItem>
                                    <SelectItem value="colacion">Colación</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Records table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <UtensilsCrossed className="h-5 w-5 text-emerald-600" />
                        Detalle de Consumos
                        <Badge variant="secondary" className="ml-2">
                            {total} registros
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : consumptions.length === 0 ? (
                        <div className="text-center py-12">
                            <UtensilsCrossed className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500">No se encontraron registros</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="overflow-x-auto border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="w-[180px]">Fecha / Hora</TableHead>
                                            <TableHead>Trabajador</TableHead>
                                            <TableHead>Empresa</TableHead>
                                            <TableHead>Servicio</TableHead>
                                            <TableHead>Comedor</TableHead>
                                            <TableHead className="text-right">Costo</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {consumptions.map((c) => (
                                            <TableRow key={c.id} className="hover:bg-slate-50/50">
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{format(new Date(c.registeredAt), 'dd/MM/yyyy')}</span>
                                                        <span className="text-xs text-slate-500">
                                                            {format(new Date(c.registeredAt), 'HH:mm:ss')}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-900">{c.personName}</span>
                                                        <span className="text-xs text-slate-500">{(c as any).personRut}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">{c.companyName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col items-start gap-1">
                                                        {getMealTypeBadge(c.mealType)}
                                                        {c.isEnhanced && (
                                                            <Badge variant="secondary" className="bg-amber-50 text-amber-700 text-[10px] h-4">
                                                                MEJORADO
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-600">
                                                    {c.diningHallName}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-emerald-600">
                                                    {formatCurrency(c.costAtTime)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">
                                    Mostrando {consumptions.length} de {total} registros
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Anterior
                                    </Button>
                                    <div className="text-sm font-medium px-4">
                                        Página {page} de {totalPages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        Siguiente
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
