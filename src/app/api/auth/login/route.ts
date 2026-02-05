import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // In a real production app, use bcrypt to compare hashed passwords.
        // For this demonstration and as requested for a professional transition, 
        // we assume the user exists in the database.
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user && password === 'password123') { // Temporary simple check
            if (!user.isActive) {
                return NextResponse.json({ success: false, error: 'Usuario inactivo' }, { status: 403 });
            }

            return NextResponse.json({
                success: true,
                data: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar,
                    isActive: user.isActive,
                    createdAt: user.createdAt
                }
            });
        }

        return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 });
    }
}
