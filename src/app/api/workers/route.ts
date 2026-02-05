import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const companyId = searchParams.get('companyId');

    try {
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { rut: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (companyId) {
            where.companyId = companyId;
        }

        const [items, total] = await Promise.all([
            prisma.worker.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { name: 'asc' },
                include: {
                    company: {
                        select: { name: true }
                    }
                }
            }),
            prisma.worker.count({ where }),
        ]);

        const formattedItems = items.map(worker => ({
            ...worker,
            companyName: worker.company.name,
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
        console.error('Error fetching workers:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const worker = await prisma.worker.create({
            data: {
                name: body.name,
                rut: body.rut,
                qrCode: body.qrCode || `FP-${body.rut}`,
                email: body.email,
                department: body.department,
                companyId: body.companyId,
                isActive: body.isActive ?? true,
            },
            include: {
                company: {
                    select: { name: true }
                }
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
        console.error('Error creating worker:', error);
        return NextResponse.json(
            { success: false, error: 'Error creating worker' },
            { status: 500 }
        );
    }
}
