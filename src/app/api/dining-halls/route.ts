import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    try {
        const [items, total] = await Promise.all([
            prisma.diningHall.findMany({
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: { consumptions: true }
                    }
                }
            }),
            prisma.diningHall.count(),
        ]);

        const formattedItems = items.map(hall => ({
            ...hall,
            todayConsumptions: 0, // In a real app, this would be filtered by current date
            totalConsumptions: hall._count.consumptions,
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
        console.error('Error fetching dining halls:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const hall = await prisma.diningHall.create({
            data: {
                name: body.name,
                location: body.location,
                capacity: body.capacity,
                isActive: body.isActive ?? true,
            },
        });

        return NextResponse.json({ success: true, data: hall });
    } catch (error) {
        console.error('Error creating dining hall:', error);
        return NextResponse.json(
            { success: false, error: 'Error creating dining hall' },
            { status: 500 }
        );
    }
}
