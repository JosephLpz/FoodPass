'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDiningHalls, validateAndRegisterQR, getDashboardStats, getPersons } from '@/lib/api/services';
import { formatMealType } from '@/lib/api/mock-data';
import { useMealType, useScanner } from '@/hooks';
import { QRValidationResult, Person, MealType, DiningHall, DashboardStats } from '@/types';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ScanLine,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    User,
    Building2,
    Loader2,
    RefreshCw,
    Clock,
    Coffee,
    Sun,
    Moon,
    TrendingUp,
    Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type RegistrationStatus = 'idle' | 'scanning' | 'success' | 'error' | 'warning';

interface RegistrationResult {
    status: RegistrationStatus;
    person?: Person;
    mealType?: MealType;
    isEnhanced?: boolean;
    message?: string;
}

export default function RegistroPage() {
    const {
        currentDiningHallId,
        setDiningHallId,
        isEnhanced,
        setIsEnhanced,
        simulateScan,
        lastResult,
        isProcessing: isGlobalProcessing
    } = useScanner();

    const [halls, setHalls] = useState<DiningHall[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [testPersons, setTestPersons] = useState<Person[]>([]);
    const [qrCode, setQrCode] = useState('');
    const [manualMode, setManualMode] = useState(false);
    const [result, setResult] = useState<RegistrationResult>({ status: 'idle' });
    const { currentMealLabel, currentMealType, currentTime } = useMealType();

    const loadStats = useCallback(async () => {
        const res = await getDashboardStats();
        if (res.success && res.data) setStats(res.data);
    }, []);

    // Load initial data
    useEffect(() => {
        getDiningHalls(1, 100).then(res => {
            if (res.success && res.data) setHalls(res.data.items);
        });
        getPersons(1, 5).then(res => {
            if (res.success && res.data) setTestPersons(res.data.items);
        });
        loadStats();
    }, [loadStats]);

    // Sync local result state with global lastResult
    useEffect(() => {
        if (lastResult) {
            if (lastResult.success) {
                setResult({
                    status: 'success',
                    person: lastResult.person,
                    mealType: lastResult.mealType,
                    isEnhanced: lastResult.isEnhanced,
                    message: `${formatMealType(lastResult.mealType!)}${lastResult.isEnhanced ? ' MEJORADA' : ''} registrado correctamente`,
                });
                loadStats(); // Refresh stats after success
            } else if (lastResult.alreadyRegistered) {
                setResult({
                    status: 'warning',
                    person: lastResult.person,
                    mealType: lastResult.mealType,
                    message: lastResult.error || 'Ya registrado para esta comida',
                });
            } else {
                setResult({
                    status: 'error',
                    message: lastResult.error || 'Código QR no válido',
                });
            }
        }
    }, [lastResult]);

    // Auto-clear result after 5 seconds
    useEffect(() => {
        if (result.status !== 'idle' && result.status !== 'scanning') {
            const timer = setTimeout(() => {
                setResult({ status: 'idle' });
            }, 6000);

            return () => clearTimeout(timer);
        }
    }, [result.status]);

    const handleManualSubmit = () => {
        if (qrCode.trim()) {
            simulateScan(qrCode);
            setQrCode('');
        }
    };

    const handleReset = () => {
        setResult({ status: 'idle' });
        setQrCode('');
    };

    const getMealIcon = (mealType: MealType) => {
        switch (mealType) {
            case 'desayuno':
                return <Coffee className="h-6 w-6" />;
            case 'almuerzo':
                return <Sun className="h-6 w-6" />;
            case 'cena':
                return <Moon className="h-6 w-6" />;
            default:
                return <Clock className="h-6 w-6" />;
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Current meal indicator */}
            <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                {getMealIcon(currentMealType)}
                            </div>
                            <div>
                                <p className="text-sm text-emerald-100">Registrando</p>
                                <p className="text-2xl font-bold">{currentMealLabel}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 text-emerald-100">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">Hora actual</span>
                            </div>
                            <p className="text-2xl font-bold font-mono">{formatTime(currentTime)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Settings & Config */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <Settings className="h-5 w-5 text-slate-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-500 font-medium">Comedor Activo</p>
                                <Select
                                    value={currentDiningHallId || ''}
                                    onValueChange={setDiningHallId}
                                >
                                    <SelectTrigger className="h-8 border-none p-0 focus:ring-0 text-sm font-bold bg-transparent">
                                        <SelectValue placeholder="Seleccionar comedor..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {halls.map(hall => (
                                            <SelectItem key={hall.id} value={hall.id}>
                                                {hall.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                            <div className="flex items-center gap-2">
                                <Badge variant={isEnhanced ? "default" : "outline"} className={cn(isEnhanced && "bg-amber-500")}>
                                    {isEnhanced ? "Mejorada ACTIVA" : "Normal"}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEnhanced(!isEnhanced)}
                                    className="h-7 text-xs"
                                >
                                    Cambiar
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* QR Scanner / Simulation Input */}
            <Card className={cn(
                "border-2 border-dashed transition-colors duration-300",
                isGlobalProcessing ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200"
            )}>
                <CardContent className="p-8">
                    <div className="text-center mb-6">
                        <div className={cn(
                            "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-all duration-300",
                            isGlobalProcessing ? "bg-emerald-500 text-white scale-110" : "bg-emerald-100 text-emerald-600"
                        )}>
                            {isGlobalProcessing ? <Loader2 className="h-8 w-8 animate-spin" /> : <ScanLine className="h-8 w-8" />}
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-2">
                            Scanner Global Activo
                        </h2>
                        <p className="text-slate-500 text-sm">
                            El sistema está escuchando su lector USB omnidireccional.<br />
                            Simplemente escanee el código QR en cualquier momento.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 max-w-sm mx-auto">
                        {!manualMode ? (
                            <Button
                                variant="outline"
                                onClick={() => setManualMode(true)}
                                className="text-slate-500 border-slate-200"
                            >
                                Ingreso Manual / Simulación
                            </Button>
                        ) : (
                            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                                <p className="text-xs font-bold text-slate-600 uppercase">Simulación de Scan</p>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Pegue URL o RUT aquí..."
                                        value={qrCode}
                                        onChange={(e) => setQrCode(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                                        className="bg-white h-10"
                                    />
                                    <Button onClick={handleManualSubmit} disabled={isGlobalProcessing}>
                                        Test
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setManualMode(false)}>
                                        &times;
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Result Display */}
            {result.status !== 'idle' && result.status !== 'scanning' && (
                <Card
                    className={cn(
                        'border-2 transition-all duration-300',
                        result.status === 'success' && 'border-emerald-500 bg-emerald-50',
                        result.status === 'warning' && 'border-amber-500 bg-amber-50',
                        result.status === 'error' && 'border-red-500 bg-red-50'
                    )}
                >
                    <CardContent className="p-6">
                        {/* Status icon */}
                        <div className="flex items-center justify-center mb-4">
                            {result.status === 'success' && (
                                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                    <CheckCircle2 className="h-10 w-10 text-white" />
                                </div>
                            )}
                            {result.status === 'warning' && (
                                <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                    <AlertTriangle className="h-10 w-10 text-white" />
                                </div>
                            )}
                            {result.status === 'error' && (
                                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                    <XCircle className="h-10 w-10 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Message */}
                        <p
                            className={cn(
                                'text-lg font-semibold text-center mb-4',
                                result.status === 'success' && 'text-emerald-700',
                                result.status === 'warning' && 'text-amber-700',
                                result.status === 'error' && 'text-red-700'
                            )}
                        >
                            {result.message}
                        </p>

                        {/* Person info */}
                        {result.person && (
                            <div className="bg-white rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-full">
                                        <User className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Persona</p>
                                        <p className="font-semibold text-slate-900">{result.person.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-full">
                                        <Building2 className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Empresa</p>
                                        <p className="font-semibold text-slate-900">{result.person.companyName}</p>
                                    </div>
                                </div>

                                {result.mealType && (
                                    <div className="flex flex-col items-center gap-2 pt-2">
                                        <Badge
                                            className={cn(
                                                'text-sm px-4 py-1',
                                                result.mealType === 'desayuno' && 'bg-amber-100 text-amber-700',
                                                result.mealType === 'almuerzo' && 'bg-yellow-100 text-yellow-700',
                                                result.mealType === 'cena' && 'bg-indigo-100 text-indigo-700'
                                            )}
                                        >
                                            {getMealIcon(result.mealType)}
                                            <span className="ml-2">{formatMealType(result.mealType)}</span>
                                        </Badge>
                                        {result.isEnhanced && (
                                            <Badge className="bg-amber-500 text-white border-0">
                                                COLACIÓN MEJORADA
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reset button */}
                        <div className="mt-4 text-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Nuevo registro
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="text-center shadow-sm border-emerald-100 bg-emerald-50/20">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-center mb-2">
                            <Coffee className="h-5 w-5 text-amber-500" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{stats?.breakfastCount || 0}</p>
                        <p className="text-xs text-slate-500 font-medium">Desayunos</p>
                    </CardContent>
                </Card>
                <Card className="text-center shadow-sm border-yellow-100 bg-yellow-50/20">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-center mb-2">
                            <Sun className="h-5 w-5 text-yellow-600" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{stats?.lunchCount || 0}</p>
                        <p className="text-xs text-slate-500 font-medium">Almuerzos</p>
                    </CardContent>
                </Card>
                <Card className="text-center shadow-sm border-indigo-100 bg-indigo-50/20">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-center mb-2">
                            <Moon className="h-5 w-5 text-indigo-500" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{stats?.dinnerCount || 0}</p>
                        <p className="text-xs text-slate-500 font-medium">Cenas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Test QR codes info */}
            {testPersons.length > 0 && (
                <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Códigos de prueba (Basados en registros):</p>
                            <Badge variant="outline" className="text-[10px] h-4 bg-white">RECIENTES</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {testPersons.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => simulateScan(p.qrCode)}
                                    className="text-[10px] bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all font-mono px-2 py-1 rounded border shadow-sm"
                                    title={`Scanear a ${p.name}`}
                                >
                                    {p.qrCode}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
