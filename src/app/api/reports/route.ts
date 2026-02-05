import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const companyId = searchParams.get('companyId');
    const diningHallId = searchParams.get('diningHallId');

    try {
        const where: any = {};
        if (startDate || endDate) {
            where.registeredAt = {};
            if (startDate) where.registeredAt.gte = new Date(startDate);
            if (endDate) where.registeredAt.lte = new Date(endDate);
        }
        if (companyId) where.companyId = companyId;
        if (diningHallId) where.diningHallId = diningHallId;

        // Aggregate consumptions by date, company, diningHall, and mealType
        const consumptions = await prisma.consumption.findMany({
            where,
            include: {
                company: { select: { name: true } },
                diningHall: { select: { name: true } },
            },
            orderBy: { registeredAt: 'desc' }
        });

        const groupedData = consumptions.reduce((acc: any, curr: any) => {
            const dateKey = curr.registeredAt.toISOString().split('T')[0];
            const key = `${dateKey}-${curr.companyId}-${curr.diningHallId}`;

            if (!acc[key]) {
                acc[key] = {
                    date: dateKey,
                    company: curr.company.name,
                    diningHall: curr.diningHall.name,
                    breakfast: 0,
                    lunch: 0,
                    dinner: 0,
                    enhanced: 0,
                    total: 0,
                    estimatedCost: 0,
                };
            }

            acc[key].total += 1;
            acc[key].estimatedCost += Number(curr.costAtTime);
            if (curr.isEnhanced) acc[key].enhanced += 1;

            if (curr.mealType === 'desayuno') acc[key].breakfast += 1;
            else if (curr.mealType === 'almuerzo') acc[key].lunch += 1;
            else if (curr.mealType === 'cena') acc[key].dinner += 1;

            return acc;
        }, {});

        const result = Object.values(groupedData);

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Error generating report:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
