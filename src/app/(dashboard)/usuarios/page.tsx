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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { getUsers, createUser, deleteUser } from '@/lib/api/services';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';
import { UserCog, Plus, Trash2, Loader2, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function UsuariosPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'operador' as UserRole,
    });

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        setIsLoading(true);
        try {
            const response = await getUsers(1, 50);
            if (response.success && response.data) {
                setUsers(response.data.items);
            }
        } finally {
            setIsLoading(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            toast.error('Complete todos los campos');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await createUser({
                ...formData,
                isActive: true,
            });

            if (response.success) {
                toast.success('Usuario creado exitosamente');
                setIsDialogOpen(false);
                setFormData({ name: '', email: '', role: 'operador' });
                loadUsers();
            } else {
                toast.error(response.error || 'Error al crear usuario');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Está seguro de eliminar este usuario?')) return;

        try {
            const response = await deleteUser(id);
            if (response.success) {
                toast.success('Usuario eliminado');
                loadUsers();
            } else {
                toast.error(response.error || 'Error al eliminar usuario');
            }
        } catch {
            toast.error('Error al eliminar usuario');
        }
    };

    const getRoleBadge = (role: UserRole) => {
        const config = {
            admin: { label: 'Administrador', icon: ShieldAlert, className: 'bg-red-100 text-red-700' },
            supervisor: { label: 'Supervisor', icon: ShieldCheck, className: 'bg-amber-100 text-amber-700' },
            operador: { label: 'Operador', icon: Shield, className: 'bg-blue-100 text-blue-700' },
        };

        const { label, icon: Icon, className } = config[role];

        return (
            <Badge variant="secondary" className={className}>
                <Icon className="h-3 w-3 mr-1" />
                {label}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header with add button */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <UserCog className="h-5 w-5 text-emerald-600" />
                            Gestión de Usuarios
                        </CardTitle>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                                    <Plus className="h-4 w-4" />
                                    Nuevo Usuario
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                                    <DialogDescription>
                                        Complete los datos para crear un nuevo usuario del sistema.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nombre completo</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, name: e.target.value })
                                                }
                                                placeholder="Juan Pérez"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Correo electrónico</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, email: e.target.value })
                                                }
                                                placeholder="usuario@foodpass.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Rol</Label>
                                            <Select
                                                value={formData.role}
                                                onValueChange={(value: UserRole) =>
                                                    setFormData({ ...formData, role: value })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="operador">Operador</SelectItem>
                                                    <SelectItem value="supervisor">Supervisor</SelectItem>
                                                    <SelectItem value="admin">Administrador</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsDialogOpen(false)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Creando...
                                                </>
                                            ) : (
                                                'Crear Usuario'
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <UserCog className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500">No hay usuarios registrados</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Rol</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Creado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-emerald-700">
                                                            {user.name
                                                                .split(' ')
                                                                .map((n) => n[0])
                                                                .join('')
                                                                .slice(0, 2)
                                                                .toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium">{user.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600">{user.email}</TableCell>
                                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={user.isActive ? 'default' : 'secondary'}
                                                    className={
                                                        user.isActive
                                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                                            : 'bg-slate-100 text-slate-500'
                                                    }
                                                >
                                                    {user.isActive ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">
                                                {new Date(user.createdAt).toLocaleDateString('es-CL')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
