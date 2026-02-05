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
import { createDiningHall, updateDiningHall } from '@/lib/api/services';
import { DiningHall } from '@/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface DiningHallFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    diningHall?: DiningHall | null;
}

export function DiningHallFormModal({
    isOpen,
    onClose,
    onSuccess,
    diningHall,
}: DiningHallFormModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        capacity: 0,
        isActive: true,
    });

    const isEdit = !!diningHall;

    useEffect(() => {
        if (diningHall) {
            setFormData({
                name: diningHall.name,
                location: diningHall.location || '',
                capacity: diningHall.capacity || 0,
                isActive: diningHall.isActive,
            });
        } else {
            setFormData({
                name: '',
                location: '',
                capacity: 0,
                isActive: true,
            });
        }
    }, [diningHall, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        try {
            let response;
            if (isEdit && diningHall) {
                response = await updateDiningHall(diningHall.id, formData);
            } else {
                response = await createDiningHall(formData);
            }

            if (response.success) {
                toast.success(isEdit ? 'Comedor actualizado' : 'Comedor creado');
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
                        <DialogTitle>
                            {isEdit ? 'Editar Comedor' : 'Agregar Nuevo Comedor'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre del Comedor</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="Ej: Comedor Central"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="location">Ubicación</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) =>
                                    setFormData({ ...formData, location: e.target.value })
                                }
                                placeholder="Ej: Planta 1, Sector Norte"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="capacity">Capacidad máxima</Label>
                            <Input
                                id="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={(e) =>
                                    setFormData({ ...formData, capacity: Number(e.target.value) })
                                }
                                placeholder="100"
                                required
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
                            {isEdit ? 'Guardar Cambios' : 'Crear Comedor'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
