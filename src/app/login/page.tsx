'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Por favor complete todos los campos');
            return;
        }

        const result = await login(email, password);

        if (result.success) {
            toast.success('Bienvenido a FoodPass');
            router.push('/');
        } else {
            toast.error(result.error || 'Error al iniciar sesión');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

            <Card className="w-full max-w-md relative shadow-2xl border-slate-800/50 bg-white/95 backdrop-blur">
                <CardHeader className="text-center space-y-4 pb-8">
                    {/* Logo */}
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <UtensilsCrossed className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-slate-900">FoodPass</CardTitle>
                        <CardDescription className="text-slate-600 mt-1">
                            Sistema de Control de Consumo Alimentario
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@foodpass.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-11"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 pr-10"
                                    disabled={isLoading}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-11 w-11 text-slate-400 hover:text-slate-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                'Iniciar sesión'
                            )}
                        </Button>
                    </form>

                    {/* Demo credentials hint */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-500 font-medium mb-2">Credenciales de prueba:</p>
                        <p className="text-xs text-slate-600">
                            Email: <code className="bg-slate-200 px-1 py-0.5 rounded">admin@foodpass.com</code>
                        </p>
                        <p className="text-xs text-slate-600">
                            Contraseña: <code className="bg-slate-200 px-1 py-0.5 rounded">password123</code>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
