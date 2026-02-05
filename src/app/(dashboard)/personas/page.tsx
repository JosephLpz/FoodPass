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
import { getPersons, deletePerson } from '@/lib/api/services';
import { Person } from '@/types';
import { Search, Users, Building2, UserCheck, UserX, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { PersonFormModal } from '@/components/modals/PersonFormModal';
import { toast } from 'sonner';

export default function PersonasPage() {
    const [persons, setPersons] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [total, setTotal] = useState(0);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

    const loadPersons = async () => {
        setIsLoading(true);
        try {
            const response = await getPersons(1, 50, search || undefined);
            if (response.success && response.data) {
                setPersons(response.data.items);
                setTotal(response.data.total);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(loadPersons, 300);
        return () => clearTimeout(debounce);
    }, [search]);

    const handleAdd = () => {
        setSelectedPerson(null);
        setIsModalOpen(true);
    };

    const handleEdit = (person: Person) => {
        setSelectedPerson(person);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Está seguro de que desea desactivar esta persona?')) return;

        try {
            const response = await deletePerson(id);
            if (response.success) {
                toast.success('Persona desactivada');
                loadPersons();
            } else {
                toast.error(response.error || 'Error al desactivar');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    const activeCount = persons.filter((p) => p.isActive).length;
    const inactiveCount = persons.filter((p) => !p.isActive).length;

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{total}</p>
                                <p className="text-sm text-slate-500">Total personas</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <UserCheck className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
                                <p className="text-sm text-slate-500">Activas</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <UserX className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{inactiveCount}</p>
                                <p className="text-sm text-slate-500">Inactivas</p>
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
                            <Users className="h-5 w-5 text-emerald-600" />
                            Listado de Personas
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
                                <UserPlus className="h-4 w-4 mr-2" />
                                Agregar
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : persons.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500">No se encontraron personas</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>RUT</TableHead>
                                        <TableHead>Empresa</TableHead>
                                        <TableHead>Departamento</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {persons.map((person) => (
                                        <TableRow key={person.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-slate-900">{person.name}</p>
                                                    <p className="text-xs text-slate-500">{person.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{person.rut}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-slate-400" />
                                                    <span>{person.companyName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{person.department}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={person.isActive ? 'default' : 'secondary'}
                                                    className={
                                                        person.isActive
                                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                                            : 'bg-slate-100 text-slate-500'
                                                    }
                                                >
                                                    {person.isActive ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(person)}
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(person.id)}
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

            <PersonFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadPersons}
                person={selectedPerson}
            />
        </div>
    );
}
