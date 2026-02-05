import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const company = await prisma.company.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                rut: true,
                contactEmail: true,
                contactPhone: true,
                address: true,
                costBreakfast: true,
                costLunch: true,
                costDinner: true,
                costSnack: true,
                costEnhanced: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { workers: true, consumptions: true }
                }
            }
        });

        if (!company) {
            return NextResponse.json({ success: false, error: 'Empresa no encontrada' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                ...company,
                costBreakfast: Number(company.costBreakfast),
                costLunch: Number(company.costLunch),
                costDinner: Number(company.costDinner),
                costSnack: Number(company.costSnack),
                costEnhanced: Number(company.costEnhanced),
                totalPersons: company._count.workers,
                totalConsumptions: company._count.consumptions,
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
        const company = await prisma.company.update({
            where: { id },
            data: {
                name: body.name,
                rut: body.rut,
                contactEmail: body.contactEmail,
                contactPhone: body.contactPhone,
                address: body.address,
                costBreakfast: body.costBreakfast,
                costLunch: body.costLunch,
                costDinner: body.costDinner,
                costSnack: body.costSnack,
                costEnhanced: body.costEnhanced,
                isActive: body.isActive,
            }
        });

        return NextResponse.json({ success: true, data: company });
    } catch (error) {
        console.error('Error updating company:', error);
        return NextResponse.json({ success: false, error: 'Error al actualizar empresa' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.company.update({
            where: { id },
            data: { isActive: false }
        });
        return NextResponse.json({ success: true, message: 'Empresa desactivada correctamente' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Error al desactivar empresa' }, { status: 500 });
    }
}
