'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getCompanies, deleteCompany } from '@/lib/api/services';
import { Company } from '@/types';
import { Search, Building2, Users, UtensilsCrossed, DollarSign, Plus, Edit2, Trash2 } from 'lucide-react';
import { CompanyFormModal } from '@/components/modals/CompanyFormModal';
import { toast } from 'sonner';

export default function EmpresasPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    const loadCompanies = async () => {
        setIsLoading(true);
        try {
            const response = await getCompanies(1, 50, search || undefined);
            if (response.success && response.data) {
                setCompanies(response.data.items);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(loadCompanies, 300);
        return () => clearTimeout(debounce);
    }, [search]);

    const handleAdd = () => {
        setSelectedCompany(null);
        setIsModalOpen(true);
    };

    const handleEdit = (company: Company) => {
        setSelectedCompany(company);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Está seguro de que desea desactivar esta empresa?')) return;

        try {
            const response = await deleteCompany(id);
            if (response.success) {
                toast.success('Empresa desactivada');
                loadCompanies();
            } else {
                toast.error(response.error || 'Error al desactivar');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    const totalPersons = companies.reduce((sum, c) => sum + c.totalPersons, 0);
    const totalConsumptions = companies.reduce((sum, c) => sum + (c.totalConsumptions || 0), 0);

    // For now, estimating based on a weighted average or just lunch since we don't have total cost from backend yet
    const estimatedTotalRevenue = companies.reduce((sum, c) => sum + (c.totalConsumptions || 0) * (c.costLunch || 0), 0);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{companies.length}</p>
                                <p className="text-sm text-slate-500">Empresas</p>
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
                                <p className="text-2xl font-bold text-slate-900">{totalPersons}</p>
                                <p className="text-sm text-slate-500">Total personas</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <UtensilsCrossed className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{totalConsumptions.toLocaleString()}</p>
                                <p className="text-sm text-slate-500">Consumos totales</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-100 rounded-lg">
                                <DollarSign className="h-5 w-5 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900">{formatCurrency(estimatedTotalRevenue)}</p>
                                <p className="text-sm text-slate-500">Ingreso Est. (Base Almuerzo)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-emerald-600" />
                            Listado de Empresas
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Buscar por nombre, RUT..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : companies.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500">No se encontraron empresas</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Empresa</TableHead>
                                        <TableHead>RUT</TableHead>
                                        <TableHead className="text-right">Personas</TableHead>
                                        <TableHead className="text-right">Consumos</TableHead>
                                        <TableHead className="text-right">Costo/Comida</TableHead>
                                        <TableHead className="text-right">Costo Total</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {companies.map((company) => (
                                        <TableRow key={company.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-slate-900">{company.name}</p>
                                                    <p className="text-xs text-slate-500">{company.contactEmail}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{company.rut}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Users className="h-4 w-4 text-slate-400" />
                                                    {company.totalPersons}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {(company.totalConsumptions || 0).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right text-xs">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span>D: {formatCurrency(company.costBreakfast)}</span>
                                                    <span className="font-bold">A: {formatCurrency(company.costLunch)}</span>
                                                    <span>C: {formatCurrency(company.costDinner)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-emerald-600">
                                                {formatCurrency((company.totalConsumptions || 0) * (company.costLunch || 0))}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={company.isActive ? 'default' : 'secondary'}
                                                    className={
                                                        company.isActive
                                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                                            : 'bg-slate-100 text-slate-500'
                                                    }
                                                >
                                                    {company.isActive ? 'Activa' : 'Inactiva'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(company)}
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(company.id)}
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <CompanyFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadCompanies}
                company={selectedCompany}
            />
        </div>
    );
}
