'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
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
import { createCompany, updateCompany } from '@/lib/api/services';
import { Company } from '@/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CompanyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    company?: Company | null;
}

export function CompanyFormModal({
    isOpen,
    onClose,
    onSuccess,
    company,
}: CompanyFormModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        rut: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        costBreakfast: 0,
        costLunch: 0,
        costDinner: 0,
        costSnack: 0,
        costEnhanced: 0,
        isActive: true,
    });

    const isEdit = !!company;

    useEffect(() => {
        if (company) {
            setFormData({
                name: company.name,
                rut: company.rut,
                contactEmail: company.contactEmail || '',
                contactPhone: company.contactPhone || '',
                address: company.address || '',
                costBreakfast: company.costBreakfast,
                costLunch: company.costLunch,
                costDinner: company.costDinner,
                costSnack: company.costSnack,
                costEnhanced: company.costEnhanced,
                isActive: company.isActive,
            });
        } else {
            setFormData({
                name: '',
                rut: '',
                contactEmail: '',
                contactPhone: '',
                address: '',
                costBreakfast: 0,
                costLunch: 0,
                costDinner: 0,
                costSnack: 0,
                costEnhanced: 0,
                isActive: true,
            });
        }
    }, [company, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        try {
            let response;
            if (isEdit && company) {
                response = await updateCompany(company.id, formData);
            } else {
                response = await createCompany(formData);
            }

            if (response.success) {
                toast.success(isEdit ? 'Empresa actualizada' : 'Empresa creada');
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
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEdit ? 'Editar Empresa' : 'Agregar Nueva Empresa'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre de la Empresa</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="Ej: Constructora ABC"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="rut">RUT Empresa</Label>
                            <Input
                                id="rut"
                                value={formData.rut}
                                onChange={(e) =>
                                    setFormData({ ...formData, rut: e.target.value })
                                }
                                placeholder="76.000.000-0"
                                required
                            />
                        </div>
                        <div className="grid gap-4 grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Correo Contacto</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={(e) =>
                                        setFormData({ ...formData, contactEmail: e.target.value })
                                    }
                                    placeholder="contacto@empresa.cl"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    value={formData.contactPhone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, contactPhone: e.target.value })
                                    }
                                    placeholder="+56 9..."
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({ ...formData, address: e.target.value })
                                }
                                placeholder="Calle... Ciudad..."
                            />
                        </div>

                        <div className="border-t pt-4 mt-2">
                            <h3 className="text-sm font-semibold mb-3 text-slate-700">Configuración de Precios (CLP)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="costB">Desayuno</Label>
                                    <Input
                                        id="costB"
                                        type="number"
                                        value={formData.costBreakfast}
                                        onChange={(e) =>
                                            setFormData({ ...formData, costBreakfast: Number(e.target.value) })
                                        }
                                        placeholder="0"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="costL">Almuerzo</Label>
                                    <Input
                                        id="costL"
                                        type="number"
                                        value={formData.costLunch}
                                        onChange={(e) =>
                                            setFormData({ ...formData, costLunch: Number(e.target.value) })
                                        }
                                        placeholder="0"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="costD">Cena</Label>
                                    <Input
                                        id="costD"
                                        type="number"
                                        value={formData.costDinner}
                                        onChange={(e) =>
                                            setFormData({ ...formData, costDinner: Number(e.target.value) })
                                        }
                                        placeholder="0"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="costS">Colación</Label>
                                    <Input
                                        id="costS"
                                        type="number"
                                        value={formData.costSnack}
                                        onChange={(e) =>
                                            setFormData({ ...formData, costSnack: Number(e.target.value) })
                                        }
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2 mt-4">
                                <Label htmlFor="costE" className="text-emerald-700">Colación Mejorada / Especial</Label>
                                <Input
                                    id="costE"
                                    type="number"
                                    value={formData.costEnhanced}
                                    onChange={(e) =>
                                        setFormData({ ...formData, costEnhanced: Number(e.target.value) })
                                    }
                                    placeholder="0"
                                    className="border-emerald-200 focus-visible:ring-emerald-500"
                                    required
                                />
                            </div>
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
                                    <SelectItem value="true">Activa</SelectItem>
                                    <SelectItem value="false">Inactiva</SelectItem>
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
                            {isEdit ? 'Guardar Cambios' : 'Crear Empresa'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
