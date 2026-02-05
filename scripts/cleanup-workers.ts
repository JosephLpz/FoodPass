import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting data cleanup...');
    const workers = await prisma.worker.findMany();
    console.log(`Found ${workers.length} workers.`);

    for (const worker of workers) {
        const cleanRut = worker.rut.replace(/\./g, '').trim().toUpperCase();
        const cleanQr = worker.qrCode.replace(/\./g, '').replace('FP-', '').trim().toUpperCase();
        const newQr = `FP-${cleanRut}`;

        if (worker.rut !== cleanRut || worker.qrCode !== newQr) {
            console.log(`Updating worker ${worker.name}:`);
            console.log(`  RUT: ${worker.rut} -> ${cleanRut}`);
            console.log(`  QR:  ${worker.qrCode} -> ${newQr}`);

            await prisma.worker.update({
                where: { id: worker.id },
                data: {
                    rut: cleanRut,
                    qrCode: newQr
                }
            });
        }
    }
    console.log('Cleanup complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
