import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MealType } from '@prisma/client';

// Helper to determine meal type by current Chilean time
function getMealTypeByTime(): MealType {
    const now = new Date();
    const hours = now.getHours();

    if (hours >= 5 && hours < 11) return MealType.desayuno;
    if (hours >= 11 && hours < 17) return MealType.almuerzo;
    return MealType.cena;
}

export async function POST(request: Request) {
    try {
        const { qrCode, diningHallId, isEnhanced, userId } = await request.json();

        // 1. Find worker - try multiple strategies for robustness
        let worker = await prisma.worker.findUnique({
            where: { qrCode },
            include: { company: true }
        });

        if (!worker) {
            // Try by RUT directly
            worker = await prisma.worker.findUnique({
                where: { rut: qrCode },
                include: { company: true }
            });
        }

        if (!worker) {
            // Try normalized search (strip dots and dash)
            const normalizedInput = qrCode.replace(/[.-]/g, '').toUpperCase();

            // Search workers where normalized RUT might match
            worker = await prisma.worker.findFirst({
                where: {
                    OR: [
                        { rut: { contains: normalizedInput.substring(0, 4) } },
                        { qrCode: { contains: normalizedInput.substring(0, 4) } }
                    ]
                },
                include: { company: true }
            });

            // Final verification: ensure it's a real match after stripping punctuation
            if (worker) {
                const normalizedWorkerRut = worker.rut.replace(/[.-]/g, '').toUpperCase();
                const normalizedWorkerQr = worker.qrCode.replace(/[.-]/g, '').replace('FP-', '').toUpperCase();

                if (normalizedWorkerRut !== normalizedInput && normalizedWorkerQr !== normalizedInput) {
                    worker = null; // False positive
                }
            }
        }

        if (!worker) {
            return NextResponse.json({
                success: false,
                error: `Persona no encontrada (RUT: ${qrCode}). Verifique que esté registrada.`
            }, { status: 404 });
        }

        if (!worker.isActive || !worker.company.isActive) {
            return NextResponse.json({
                success: false,
                error: 'Persona o Empresa inactiva en el sistema'
            }, { status: 403 });
        }

        // 2. Determine meal type
        const mealType = getMealTypeByTime();

        // 3. Check if already registered for this meal today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const existing = await prisma.consumption.findFirst({
            where: {
                workerId: worker.id,
                mealType: mealType,
                registeredAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        if (existing) {
            return NextResponse.json({
                success: false,
                alreadyRegistered: true,
                error: `Ya registrado para ${mealType} hoy`,
                data: {
                    person: worker,
                    mealType
                }
            }, { status: 409 });
        }

        // 4. Calculate cost
        let costAtTime = 0;
        if (isEnhanced) {
            costAtTime = Number(worker.company.costEnhanced);
        } else {
            switch (mealType) {
                case 'desayuno':
                    costAtTime = Number(worker.company.costBreakfast);
                    break;
                case 'almuerzo':
                    costAtTime = Number(worker.company.costLunch);
                    break;
                case 'cena':
                    costAtTime = Number(worker.company.costDinner);
                    break;
                case 'colacion':
                    costAtTime = Number(worker.company.costSnack);
                    break;
            }
        }

        // 5. Verify userId or find a fallback (to avoid P2003 if session is stale)
        let finalUserId = userId;
        if (userId) {
            const userExists = await prisma.user.findUnique({
                where: { id: userId }
            });
            if (!userExists) finalUserId = null;
        }

        if (!finalUserId) {
            const fallbackUser = await prisma.user.findFirst({
                where: { isActive: true },
                orderBy: { role: 'asc' } // admin first usually
            });
            if (!fallbackUser) {
                return NextResponse.json({
                    success: false,
                    error: 'No hay usuarios activos en el sistema para registrar el consumo'
                }, { status: 500 });
            }
            finalUserId = fallbackUser.id;
        }

        // 6. Register consumption
        const consumption = await prisma.consumption.create({
            data: {
                workerId: worker.id,
                companyId: worker.companyId,
                diningHallId: diningHallId,
                userId: finalUserId, // Using the validated or fallback ID
                mealType: mealType,
                isEnhanced: isEnhanced || false,
                costAtTime: costAtTime
            },
            include: {
                worker: true,
                company: true,
                diningHall: true
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                success: true,
                person: worker,
                mealType,
                isEnhanced: consumption.isEnhanced,
                costAtTime: Number(consumption.costAtTime),
                alreadyRegistered: false
            }
        });

    } catch (error) {
        console.error('Error registering consumption:', error);
        return NextResponse.json(
            { success: false, error: 'Error al registrar consumo' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Filters
    const companyId = searchParams.get('companyId');
    const mealType = searchParams.get('mealType') as MealType | null;
    const workerName = searchParams.get('workerName');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    try {
        const where: any = {};

        if (companyId && companyId !== 'all') {
            where.companyId = companyId;
        }

        if (mealType && mealType !== ('all' as any)) {
            where.mealType = mealType;
        }

        if (workerName) {
            where.worker = {
                name: { contains: workerName, mode: 'insensitive' }
            };
        }

        if (startDate || endDate) {
            where.registeredAt = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                where.registeredAt.gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.registeredAt.lte = end;
            }
        }

        const [consumptions, total] = await Promise.all([
            prisma.consumption.findMany({
                where,
                skip,
                take: limit,
                orderBy: { registeredAt: 'desc' },
                include: {
                    worker: { select: { name: true, rut: true } },
                    company: { select: { name: true } },
                    diningHall: { select: { name: true } }
                }
            }),
            prisma.consumption.count({ where })
        ]);

        const formatted = consumptions.map((c: any) => ({
            id: c.id,
            personId: c.workerId,
            personName: c.worker.name,
            personRut: c.worker.rut,
            companyId: c.companyId,
            companyName: c.company.name,
            diningHallId: c.diningHallId,
            diningHallName: c.diningHall.name,
            mealType: c.mealType,
            isEnhanced: c.isEnhanced,
            costAtTime: Number(c.costAtTime),
            registeredAt: c.registeredAt,
        }));

        return NextResponse.json({
            success: true,
            data: {
                items: formatted,
                total,
                page,
                pageSize: limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching consumptions:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
