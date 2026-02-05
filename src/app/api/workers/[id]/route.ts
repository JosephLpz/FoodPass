import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const worker = await prisma.worker.findUnique({
            where: { id },
            include: {
                company: { select: { name: true } }
            }
        });

        if (!worker) {
            return NextResponse.json({ success: false, error: 'Persona no encontrada' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                ...worker,
                companyName: worker.company.name
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
        const worker = await prisma.worker.update({
            where: { id },
            data: {
                name: body.name,
                rut: body.rut,
                qrCode: body.qrCode,
                email: body.email,
                department: body.department,
                companyId: body.companyId,
                isActive: body.isActive,
            },
            include: {
                company: { select: { name: true } }
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                ...worker,
                companyName: worker.company.name
            }
        });
    } catch (error) {
        console.error('Error updating worker:', error);
        return NextResponse.json({ success: false, error: 'Error al actualizar persona' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Soft delete by deactivating
        await prisma.worker.update({
            where: { id },
            data: { isActive: false }
        });
        return NextResponse.json({ success: true, message: 'Persona desactivada correctamente' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Error al eliminar persona' }, { status: 500 });
    }
}
