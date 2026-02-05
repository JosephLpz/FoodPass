'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createPerson, updatePerson, getCompanies } from '@/lib/api/services';
import { Person, Company } from '@/types';
import { toast } from 'sonner';
import { Loader2, ScanLine } from 'lucide-react';
import { useScanner } from '@/hooks';

interface PersonFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    person?: Person | null;
}

export function PersonFormModal({
    isOpen,
    onClose,
    onSuccess,
    person,
}: PersonFormModalProps) {
    const { setInterceptCallback } = useScanner();
    const [isLoading, setIsLoading] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        rut: '',
        email: '',
        department: '',
        companyId: '',
        isActive: true,
    });

    const isEdit = !!person;

    // QR Scan Interception Logic
    useEffect(() => {
        if (!isOpen || isEdit) {
            setInterceptCallback(null);
            return;
        }

        const handleScan = (text: string) => {
            if (!text) return false;
            console.log('Intercepted scan in PersonForm:', text);
            const rawText = text.trim();
            let rut = '';
            let name = '';
            let department = '';
            let email = '';

            // 1. Try JSON
            if (rawText.startsWith('{')) {
                try {
                    const data = JSON.parse(rawText);
                    rut = data.rut || data.RUN || data.id || '';
                    name = data.name || data.nombre || '';
                    department = data.department || data.depto || data.area || '';
                    email = data.email || data.correo || '';
                } catch (e) { /* not JSON */ }
            }

            // 2. Try Delimited (CSV, Pipe, Semicolon)
            if (!rut && (rawText.includes('|') || rawText.includes(';') || rawText.includes(','))) {
                const delimiter = rawText.includes('|') ? '|' : rawText.includes(';') ? ';' : ',';
                const parts = rawText.split(delimiter).map(p => p.trim());

                // Assume first part is RUT and second is Name (common Chilean habit)
                // or vice-versa. We check for '-' in RUT.
                if (parts[0].includes('-')) {
                    rut = parts[0];
                    name = parts[1] || '';
                    department = parts[2] || '';
                } else if (parts[1]?.includes('-')) {
                    rut = parts[1];
                    name = parts[0];
                    department = parts[2] || '';
                }
            }

            // 3. Handle Registro Civil URLs (Default fallback for single RUT)
            if (!rut) {
                const textToUse = rawText;
                if (textToUse.includes('registrocivil.cl') || textToUse.includes('document-validity')) {
                    try {
                        const urlMatch = textToUse.match(/[?&]RUN=([^&]+)/);
                        if (urlMatch && urlMatch[1]) {
                            rut = urlMatch[1];
                        } else if (textToUse.includes('?')) {
                            const url = new URL(textToUse);
                            rut = url.searchParams.get('RUN') || textToUse;
                        }
                    } catch (e) {
                        console.error('Error parsing scanner URL:', e);
                        rut = textToUse;
                    }
                } else {
                    rut = textToUse;
                }
            }

            // Standardize RUT (Capitalize 'K' and trim)
            if (rut) {
                rut = rut.toUpperCase().trim();
            }

            // Update form
            setFormData(prev => ({
                ...prev,
                rut: rut || prev.rut,
                name: name || prev.name,
                department: department || prev.department,
                email: email || prev.email
            }));

            toast.success('Campos autocompletados', {
                description: `RUT: ${rut}${name ? ` | Nombre: ${name}` : ''}`
            });

            return true; // Consume the scan
        };

        setInterceptCallback(handleScan);

        return () => setInterceptCallback(null);
    }, [isOpen, isEdit, setInterceptCallback]);

    useEffect(() => {
        async function loadCompanies() {
            const response = await getCompanies(1, 100);
            if (response.success && response.data) {
                setCompanies(response.data.items);
            }
        }
        if (isOpen) {
            loadCompanies();
        }
    }, [isOpen]);

    useEffect(() => {
        if (person) {
            setFormData({
                name: person.name,
                rut: person.rut,
                email: person.email || '',
                department: person.department || '',
                companyId: person.companyId,
                isActive: person.isActive,
            });
        } else {
            setFormData({
                name: '',
                rut: '',
                email: '',
                department: '',
                companyId: '',
                isActive: true,
            });
        }
    }, [person, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic RUT validation (could be more robust)
        if (!formData.rut.includes('-')) {
            toast.error('El RUT debe incluir guión (ej: 12345678-9)');
            return;
        }

        if (!formData.companyId) {
            toast.error('Debe seleccionar una empresa');
            return;
        }

        setIsLoading(true);
        try {
            // Normalize RUT: remove dots, keep dash, uppercase K
            const cleanRut = formData.rut.replace(/\./g, '').trim().toUpperCase();
            const normalizedData = {
                ...formData,
                rut: cleanRut,
                qrCode: `FP-${cleanRut}`
            };

            let response;
            if (isEdit && person) {
                response = await updatePerson(person.id, normalizedData);
            } else {
                response = await createPerson(normalizedData);
            }

            if (response.success) {
                toast.success(isEdit ? 'Persona actualizada' : 'Persona creada');
                onSuccess();
                onClose();
            } else {
                toast.error(response.error || 'Ocurrió un error');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle>
                                {isEdit ? 'Editar Persona' : 'Agregar Nueva Persona'}
                            </DialogTitle>
                            {!isEdit && (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 gap-1.5 flex py-0.5 px-2">
                                    <ScanLine className="h-3 w-3" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Scanner Activo</span>
                                </Badge>
                            )}
                        </div>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="Ej: Juan Pérez"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="rut">RUT</Label>
                            <Input
                                id="rut"
                                value={formData.rut}
                                onChange={(e) =>
                                    setFormData({ ...formData, rut: e.target.value })
                                }
                                placeholder="12.345.678-9"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                placeholder="juan@empresa.cl"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="company">Empresa</Label>
                            <Select
                                value={formData.companyId}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, companyId: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar empresa" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map((company) => (
                                        <SelectItem key={company.id} value={company.id}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="department">Departamento / Área</Label>
                            <Input
                                id="department"
                                value={formData.department}
                                onChange={(e) =>
                                    setFormData({ ...formData, department: e.target.value })
                                }
                                placeholder="Ej: Operaciones"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Estado</Label>
                            <Select
                                value={formData.isActive ? 'true' : 'false'}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, isActive: value === 'true' })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Activo</SelectItem>
                                    <SelectItem value="false">Inactivo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? 'Guardar Cambios' : 'Crear Persona'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
