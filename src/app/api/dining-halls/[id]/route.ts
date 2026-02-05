import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const hall = await prisma.diningHall.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { consumptions: true }
                }
            }
        });

        if (!hall) {
            return NextResponse.json({ success: false, error: 'Comedor no encontrado' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                ...hall,
                todayConsumptions: 0,
                totalConsumptions: hall._count.consumptions
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const hall = await prisma.diningHall.update({
            where: { id },
            data: {
                name: body.name,
                location: body.location,
                capacity: body.capacity,
                isActive: body.isActive,
            }
        });

        return NextResponse.json({ success: true, data: hall });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Error al actualizar comedor' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.diningHall.update({
            where: { id },
            data: { isActive: false }
        });
        return NextResponse.json({ success: true, message: 'Comedor desactivado correctamente' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Error al desactivar comedor' }, { status: 500 });
    }
}
