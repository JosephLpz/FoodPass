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
import { getReportSummary, exportReport, getCompanies, getDiningHalls } from '@/lib/api/services';
import { ReportSummary, Company, DiningHall } from '@/types';
import { toast } from 'sonner';
import { FileText, Download, Filter, Calendar, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function ReportesPage() {
    const [reports, setReports] = useState<ReportSummary[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [diningHalls, setDiningHalls] = useState<DiningHall[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Filters
    const [startDate, setStartDate] = useState(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedCompany, setSelectedCompany] = useState<string>('all');
    const [selectedDiningHall, setSelectedDiningHall] = useState<string>('all');

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [reportsRes, companiesRes, diningHallsRes] = await Promise.all([
                    getReportSummary({
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                        companyId: selectedCompany !== 'all' ? selectedCompany : undefined,
                        diningHallId: selectedDiningHall !== 'all' ? selectedDiningHall : undefined,
                    }),
                    getCompanies(1, 100),
                    getDiningHalls(1, 100),
                ]);

                if (reportsRes.success && reportsRes.data) {
                    setReports(reportsRes.data);
                }
                if (companiesRes.success && companiesRes.data) {
                    setCompanies(companiesRes.data.items);
                }
                if (diningHallsRes.success && diningHallsRes.data) {
                    setDiningHalls(diningHallsRes.data.items);
                }
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [startDate, endDate, selectedCompany, selectedDiningHall]);

    const handleExport = async (format: 'csv' | 'excel') => {
        setIsExporting(true);
        try {
            const response = await exportReport(
                {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    companyId: selectedCompany !== 'all' ? selectedCompany : undefined,
                    diningHallId: selectedDiningHall !== 'all' ? selectedDiningHall : undefined,
                },
                format
            );

            if (response.success) {
                toast.success(`Reporte ${format.toUpperCase()} generado exitosamente`);
            } else {
                toast.error('Error al generar el reporte');
            }
        } finally {
            setIsExporting(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const totals = reports.reduce(
        (acc, r) => ({
            breakfast: acc.breakfast + r.breakfast,
            lunch: acc.lunch + r.lunch,
            dinner: acc.dinner + r.dinner,
            enhanced: acc.enhanced + r.enhanced,
            total: acc.total + r.total,
            cost: acc.cost + r.estimatedCost,
        }),
        { breakfast: 0, lunch: 0, dinner: 0, enhanced: 0, total: 0, cost: 0 }
    );

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Filter className="h-5 w-5 text-emerald-600" />
                        Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Fecha inicio</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">Fecha fin</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Empresa</Label>
                            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas las empresas" />
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
                            <Label>Comedor</Label>
                            <Select value={selectedDiningHall} onValueChange={setSelectedDiningHall}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los comedores" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los comedores</SelectItem>
                                    {diningHalls.map((dh) => (
                                        <SelectItem key={dh.id} value={dh.id}>
                                            {dh.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Report table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5 text-emerald-600" />
                            Resumen de Consumos
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExport('csv')}
                                disabled={isExporting || reports.length === 0}
                            >
                                {isExporting ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                )}
                                CSV
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExport('excel')}
                                disabled={isExporting || reports.length === 0}
                            >
                                {isExporting ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                )}
                                Excel
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500">No hay datos para el período seleccionado</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Empresa</TableHead>
                                        <TableHead>Comedor</TableHead>
                                        <TableHead className="text-right">Desayunos</TableHead>
                                        <TableHead className="text-right">Almuerzos</TableHead>
                                        <TableHead className="text-right">Cenas</TableHead>
                                        <TableHead className="text-right text-amber-600 font-bold">Mejoradas</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="text-right">Costo Est.</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reports.map((report, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-mono text-sm">{report.date}</TableCell>
                                            <TableCell>{report.company}</TableCell>
                                            <TableCell>{report.diningHall}</TableCell>
                                            <TableCell className="text-right">{report.breakfast}</TableCell>
                                            <TableCell className="text-right">{report.lunch}</TableCell>
                                            <TableCell className="text-right">{report.dinner}</TableCell>
                                            <TableCell className="text-right font-medium text-amber-600">
                                                {report.enhanced}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{report.total}</TableCell>
                                            <TableCell className="text-right font-medium text-emerald-600">
                                                {formatCurrency(report.estimatedCost)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link
                                                    href={`/registros?companyId=${selectedCompany !== 'all' ? selectedCompany : ''}&startDate=${report.date}&endDate=${report.date}`}
                                                >
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <Eye className="h-4 w-4 text-slate-500" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {/* Totals row */}
                                    <TableRow className="bg-slate-50 font-semibold">
                                        <TableCell colSpan={3}>TOTALES</TableCell>
                                        <TableCell className="text-right">{totals.breakfast}</TableCell>
                                        <TableCell className="text-right">{totals.lunch}</TableCell>
                                        <TableCell className="text-right">{totals.dinner}</TableCell>
                                        <TableCell className="text-right text-amber-600">{totals.enhanced}</TableCell>
                                        <TableCell className="text-right">{totals.total}</TableCell>
                                        <TableCell className="text-right text-emerald-600">
                                            {formatCurrency(totals.cost)}
                                        </TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
