import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MealType } from '@prisma/client';

export async function GET() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalWorkers,
            totalConsumptions,
            breakfastCount,
            lunchCount,
            dinnerCount,
            yesterdayConsumptions
        ] = await Promise.all([
            prisma.worker.count({ where: { isActive: true } }),
            prisma.consumption.count({
                where: { registeredAt: { gte: today } }
            }),
            prisma.consumption.count({
                where: {
                    registeredAt: { gte: today },
                    mealType: MealType.desayuno
                }
            }),
            prisma.consumption.count({
                where: {
                    registeredAt: { gte: today },
                    mealType: MealType.almuerzo
                }
            }),
            prisma.consumption.count({
                where: {
                    registeredAt: { gte: today },
                    mealType: MealType.cena
                }
            }),
            prisma.consumption.count({
                where: {
                    registeredAt: {
                        gte: new Date(today.getTime() - 86400000),
                        lt: today
                    }
                }
            })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totalPersonsToday: totalWorkers,
                totalConsumptions,
                breakfastCount,
                lunchCount,
                dinnerCount,
                comparisonYesterday: {
                    persons: totalWorkers, // Simplified
                    consumptions: yesterdayConsumptions
                }
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
