import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    try {
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { rut: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const [items, total] = await Promise.all([
            prisma.company.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { name: 'asc' },
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
            }),
            prisma.company.count({ where }),
        ]);

        // Format to match frontend types
        const formattedItems = items.map((company: any) => ({
            ...company,
            costBreakfast: Number(company.costBreakfast),
            costLunch: Number(company.costLunch),
            costDinner: Number(company.costDinner),
            costSnack: Number(company.costSnack),
            costEnhanced: Number(company.costEnhanced),
            totalPersons: company._count.workers,
            totalConsumptions: company._count.consumptions,
        }));

        return NextResponse.json({
            success: true,
            data: {
                items: formattedItems,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (error) {
        console.error('Error fetching companies:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const company = await prisma.company.create({
            data: {
                name: body.name,
                rut: body.rut,
                contactEmail: body.contactEmail,
                contactPhone: body.contactPhone,
                address: body.address,
                costBreakfast: body.costBreakfast || 0,
                costLunch: body.costLunch || 0,
                costDinner: body.costDinner || 0,
                costSnack: body.costSnack || 0,
                costEnhanced: body.costEnhanced || 0,
                isActive: body.isActive ?? true,
            },
        });

        return NextResponse.json({ success: true, data: company });
    } catch (error) {
        console.error('Error creating company:', error);
        return NextResponse.json(
            { success: false, error: 'Error creating company' },
            { status: 500 }
        );
    }
}
