import { PrismaClient, UserRole, MealType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Seed Users
    await prisma.user.upsert({
        where: { email: 'admin@foodpass.com' },
        update: {},
        create: {
            email: 'admin@foodpass.com',
            name: 'Admin FoodPass',
            role: UserRole.admin,
            isActive: true,
        },
    });

    await prisma.user.upsert({
        where: { email: 'operador@foodpass.com' },
        update: {},
        create: {
            email: 'operador@foodpass.com',
            name: 'Operador Principal',
            role: UserRole.operador,
            isActive: true,
        },
    });

    // Seed Companies
    const companyA = await prisma.company.upsert({
        where: { rut: '76.123.456-7' },
        update: {},
        create: {
            name: 'Empresa Constructora A',
            rut: '76.123.456-7',
            contactEmail: 'contacto@constructora-a.cl',
            costBreakfast: 3500,
            costLunch: 4500,
            costDinner: 4000,
            costSnack: 2000,
            costEnhanced: 5500,
        },
    });

    const companyB = await prisma.company.upsert({
        where: { rut: '77.987.654-3' },
        update: {},
        create: {
            name: 'Minería del Norte B',
            rut: '77.987.654-3',
            contactEmail: 'rrhh@minerianorte.cl',
            costBreakfast: 4000,
            costLunch: 5200,
            costDinner: 4800,
            costSnack: 2500,
            costEnhanced: 6500,
        },
    });

    // Seed Dining Halls
    const hallA = await prisma.diningHall.create({
        data: {
            name: 'Comedor Principal Central',
            location: 'Planta 1, Sector Norte',
            capacity: 150,
        },
    });

    // Seed Workers
    await prisma.worker.upsert({
        where: { rut: '12.345.678-9' },
        update: {},
        create: {
            name: 'Juan Pérez',
            rut: '12.345.678-9',
            qrCode: 'FP-12345678-9',
            companyId: companyA.id,
            department: 'Construcción',
        },
    });

    console.log('Seed completed successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
