// Mock data for development - Prepared for future API integration

import {
    User,
    Company,
    DiningHall,
    Person,
    Consumption,
    MealType,
    DashboardStats,
    ReportSummary
} from '@/types';

// Helper to generate dates
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

// Mock Users
export const mockUsers: User[] = [
    {
        id: '1',
        email: 'admin@foodpass.com',
        name: 'Administrador Sistema',
        role: 'admin',
        avatar: undefined,
        createdAt: new Date('2024-01-01'),
        isActive: true,
    },
    {
        id: '2',
        email: 'operador@foodpass.com',
        name: 'Juan Operador',
        role: 'operador',
        avatar: undefined,
        createdAt: new Date('2024-02-15'),
        isActive: true,
    },
    {
        id: '3',
        email: 'supervisor@foodpass.com',
        name: 'María Supervisora',
        role: 'supervisor',
        avatar: undefined,
        createdAt: new Date('2024-03-01'),
        isActive: true,
    },
];

// Mock Companies
export const mockCompanies: Company[] = [
    {
        id: 'c1',
        name: 'PROCLEAN',
        rut: '76.543.210-K',
        contactEmail: 'rrhh@proclean.cl',
        contactPhone: '+56 2 2345 6789',
        address: 'Dirección Proclean',
        totalPersons: 45,
        totalConsumptions: 1250,
        costBreakfast: 3200,
        costLunch: 4200,
        costDinner: 3800,
        costSnack: 1500,
        costEnhanced: 5500,
        isActive: true,
        createdAt: new Date('2024-01-15'),
    },
    {
        id: 'c2',
        name: 'UNITED',
        rut: '77.123.456-7',
        contactEmail: 'bienestar@united.cl',
        contactPhone: '+56 2 9876 5432',
        address: 'Dirección United',
        totalPersons: 120,
        totalConsumptions: 3400,
        costBreakfast: 3500,
        costLunch: 4200,
        costDinner: 4000,
        costSnack: 2000,
        costEnhanced: 5800,
        isActive: true,
        createdAt: new Date('2024-01-20'),
    },
    {
        id: 'c3',
        name: 'SCHAWWER',
        rut: '78.654.321-0',
        contactEmail: 'personal@schawwer.cl',
        contactPhone: '+56 2 1234 5678',
        address: 'Dirección Schawwer',
        totalPersons: 65,
        totalConsumptions: 1800,
        costBreakfast: 3000,
        costLunch: 3800,
        costDinner: 3500,
        costSnack: 1800,
        costEnhanced: 5000,
        isActive: true,
        createdAt: new Date('2024-02-01'),
    },
    {
        id: 'c4',
        name: 'ATES',
        rut: '79.111.222-3',
        contactEmail: 'info@ates.cl',
        contactPhone: '+56 2 5555 4444',
        address: 'Dirección Ates',
        totalPersons: 80,
        totalConsumptions: 2200,
        costBreakfast: 3200,
        costLunch: 4000,
        costDinner: 3800,
        costSnack: 2000,
        costEnhanced: 5200,
        isActive: true,
        createdAt: new Date('2024-02-05'),
    },
    {
        id: 'c5',
        name: 'EQUANS TERMIKA',
        rut: '80.123.123-1',
        contactEmail: 'rrhh@equans.cl',
        contactPhone: '+56 2 3333 3333',
        address: 'Dirección Equans',
        totalPersons: 110,
        totalConsumptions: 3000,
        costPerMeal: 3700,
        isActive: true,
        createdAt: new Date('2024-02-10'),
    },
    {
        id: 'c6',
        name: 'EQUANS IMA',
        rut: '81.444.555-6',
        contactEmail: 'rrhh-ima@equans.cl',
        contactPhone: '+56 2 4444 4444',
        address: 'Dirección Equans IMA',
        totalPersons: 95,
        totalConsumptions: 2600,
        costPerMeal: 3700,
        isActive: true,
        createdAt: new Date('2024-02-15'),
    },
    {
        id: 'c7',
        name: 'SIGDO KOPPER',
        rut: '82.777.888-9',
        contactEmail: 'rrhh@sigdokopper.cl',
        contactPhone: '+56 2 7777 7777',
        address: 'Dirección Sigdo Kopper',
        totalPersons: 200,
        totalConsumptions: 5800,
        costBreakfast: 3800,
        costLunch: 4500,
        costDinner: 4200,
        costSnack: 2200,
        costEnhanced: 6000,
        isActive: true,
        createdAt: new Date('2024-03-01'),
    },
    {
        id: 'c8',
        name: 'CERRO ALTO',
        rut: '83.999.000-1',
        contactEmail: 'bienestar@cerroalto.cl',
        contactPhone: '+56 2 9999 9999',
        address: 'Dirección Cerro Alto',
        totalPersons: 150,
        totalConsumptions: 4100,
        costBreakfast: 3200,
        costLunch: 3900,
        costDinner: 3700,
        costSnack: 2000,
        costEnhanced: 5100,
        isActive: true,
        createdAt: new Date('2024-03-05'),
    },
    {
        id: 'c9',
        name: 'LOS ROSALES',
        rut: '84.111.000-2',
        contactEmail: 'rrhh@losrosales.cl',
        contactPhone: '+56 2 1111 2222',
        address: 'Dirección Los Rosales',
        totalPersons: 70,
        totalConsumptions: 1950,
        costBreakfast: 3000,
        costLunch: 3600,
        costDinner: 3400,
        costSnack: 1800,
        costEnhanced: 4800,
        isActive: true,
        createdAt: new Date('2024-03-10'),
    },
    {
        id: 'c10',
        name: 'ARRETEC',
        rut: '85.222.333-4',
        contactEmail: 'pp@arretec.cl',
        contactPhone: '+56 2 2222 3333',
        address: 'Dirección Arretec',
        totalPersons: 130,
        totalConsumptions: 3600,
        costBreakfast: 3300,
        costLunch: 4100,
        costDinner: 3900,
        costSnack: 2000,
        costEnhanced: 5400,
        isActive: true,
        createdAt: new Date('2024-03-15'),
    },
    {
        id: 'c11',
        name: 'OLGA TORO',
        rut: '86.555.666-7',
        contactEmail: 'rrhh@olgatoro.cl',
        contactPhone: '+56 2 5555 6666',
        address: 'Dirección Olga Toro',
        totalPersons: 50,
        totalConsumptions: 1100,
        costBreakfast: 2800,
        costLunch: 3400,
        costDinner: 3200,
        costSnack: 1500,
        costEnhanced: 4500,
        isActive: true,
        createdAt: new Date('2024-03-20'),
    },
];

// Mock Dining Halls
export const mockDiningHalls: DiningHall[] = [
    {
        id: 'dh1',
        name: 'Comedor Central',
        location: 'Edificio A - Piso 1',
        capacity: 200,
        isActive: true,
        todayConsumptions: 145,
        totalConsumptions: 15600,
    },
    {
        id: 'dh2',
        name: 'Cafetería Norte',
        location: 'Edificio B - Piso 2',
        capacity: 80,
        isActive: true,
        todayConsumptions: 62,
        totalConsumptions: 8200,
    },
    {
        id: 'dh3',
        name: 'Casino Planta',
        location: 'Sector Industrial',
        capacity: 350,
        isActive: true,
        todayConsumptions: 280,
        totalConsumptions: 32000,
    },
    {
        id: 'dh4',
        name: 'Comedor Ejecutivo',
        location: 'Edificio Corporativo - Piso 10',
        capacity: 50,
        isActive: false,
        todayConsumptions: 0,
        totalConsumptions: 1200,
    },
];

// Mock Persons
export const mockPersons: Person[] = [
    {
        id: 'p1',
        qrCode: 'FP-TC-001-2024',
        name: 'Carlos González Muñoz',
        rut: '12.345.678-9',
        email: 'cgonzalez@techcorp.cl',
        companyId: 'c1',
        companyName: 'TechCorp Chile',
        department: 'Desarrollo',
        isActive: true,
        createdAt: new Date('2024-01-15'),
    },
    {
        id: 'p2',
        qrCode: 'FP-TC-002-2024',
        name: 'María Fernanda López',
        rut: '13.456.789-0',
        email: 'mlopez@techcorp.cl',
        companyId: 'c1',
        companyName: 'TechCorp Chile',
        department: 'Recursos Humanos',
        isActive: true,
        createdAt: new Date('2024-01-16'),
    },
    {
        id: 'p3',
        qrCode: 'FP-MA-001-2024',
        name: 'Roberto Sánchez Pérez',
        rut: '14.567.890-1',
        email: 'rsanchez@mineralosandes.cl',
        companyId: 'c2',
        companyName: 'Minera Los Andes',
        department: 'Operaciones',
        isActive: true,
        createdAt: new Date('2024-01-20'),
    },
    {
        id: 'p4',
        qrCode: 'FP-MA-002-2024',
        name: 'Ana Torres Vidal',
        rut: '15.678.901-2',
        email: 'atorres@mineralosandes.cl',
        companyId: 'c2',
        companyName: 'Minera Los Andes',
        department: 'Seguridad',
        isActive: true,
        createdAt: new Date('2024-01-21'),
    },
    {
        id: 'p5',
        qrCode: 'FP-CP-001-2024',
        name: 'Pedro Martínez Silva',
        rut: '16.789.012-3',
        email: 'pmartinez@pacifico.cl',
        companyId: 'c3',
        companyName: 'Constructora Pacífico',
        department: 'Proyectos',
        isActive: false,
        createdAt: new Date('2024-02-01'),
    },
    {
        id: 'p6',
        qrCode: 'FP-BC-001-2024',
        name: 'Lucía Fernández Castro',
        rut: '17.890.123-4',
        email: 'lfernandez@bcentral.cl',
        companyId: 'c4',
        companyName: 'Banco Central',
        department: 'Finanzas',
        isActive: true,
        createdAt: new Date('2024-02-10'),
    },
];

// Mock Consumptions (today's data)
export const mockConsumptions: Consumption[] = [
    {
        id: 'con1',
        personId: 'p1',
        personName: 'Carlos González Muñoz',
        companyId: 'c1',
        companyName: 'PROCLEAN',
        diningHallId: 'dh1',
        diningHallName: 'Comedor Central',
        mealType: 'desayuno',
        isEnhanced: false,
        registeredAt: new Date(today.setHours(8, 15, 0)),
        registeredBy: 'operador@foodpass.com',
    },
    {
        id: 'con2',
        personId: 'p2',
        personName: 'María Fernanda López',
        companyId: 'c1',
        companyName: 'PROCLEAN',
        diningHallId: 'dh1',
        diningHallName: 'Comedor Central',
        mealType: 'desayuno',
        isEnhanced: false,
        registeredAt: new Date(today.setHours(8, 30, 0)),
        registeredBy: 'operador@foodpass.com',
    },
    {
        id: 'con3',
        personId: 'p3',
        personName: 'Roberto Sánchez Pérez',
        companyId: 'c2',
        companyName: 'UNITED',
        diningHallId: 'dh3',
        diningHallName: 'Casino Planta',
        mealType: 'almuerzo',
        isEnhanced: true,
        registeredAt: new Date(today.setHours(12, 45, 0)),
        registeredBy: 'operador@foodpass.com',
    },
    {
        id: 'con4',
        personId: 'p1',
        personName: 'Carlos González Muñoz',
        companyId: 'c1',
        companyName: 'PROCLEAN',
        diningHallId: 'dh1',
        diningHallName: 'Comedor Central',
        mealType: 'almuerzo',
        isEnhanced: false,
        registeredAt: new Date(today.setHours(13, 0, 0)),
        registeredBy: 'operador@foodpass.com',
    },
    {
        id: 'con5',
        personId: 'p4',
        personName: 'Ana Torres Vidal',
        companyId: 'c2',
        companyName: 'UNITED',
        diningHallId: 'dh3',
        diningHallName: 'Casino Planta',
        mealType: 'cena',
        isEnhanced: false,
        registeredAt: new Date(today.setHours(19, 30, 0)),
        registeredBy: 'operador@foodpass.com',
    },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
    totalPersonsToday: 487,
    totalConsumptions: 652,
    breakfastCount: 185,
    lunchCount: 342,
    dinnerCount: 125,
    comparisonYesterday: {
        persons: 12, // +12% vs yesterday
        consumptions: 8, // +8% vs yesterday
    },
};

// Mock Report Summary
export const mockReportSummary: ReportSummary[] = [
    {
        date: '2024-12-27',
        company: 'PROCLEAN',
        diningHall: 'Comedor Central',
        breakfast: 45,
        lunch: 120,
        dinner: 35,
        enhanced: 15,
        total: 215,
        estimatedCost: 700000,
    },
    {
        date: '2024-12-27',
        company: 'UNITED',
        diningHall: 'Casino Planta',
        breakfast: 80,
        lunch: 180,
        dinner: 60,
        enhanced: 25,
        total: 345,
        estimatedCost: 1344000,
    },
    {
        date: '2024-12-26',
        company: 'PROCLEAN',
        diningHall: 'Comedor Central',
        breakfast: 42,
        lunch: 115,
        dinner: 30,
        enhanced: 10,
        total: 197,
        estimatedCost: 654500,
    },
    {
        date: '2024-12-26',
        company: 'SCHAWWER',
        diningHall: 'Cafetería Norte',
        breakfast: 25,
        lunch: 55,
        dinner: 15,
        enhanced: 5,
        total: 100,
        estimatedCost: 361000,
    },
];

// Helper to get meal type by time
export function getMealTypeByTime(date: Date = new Date()): MealType {
    const hour = date.getHours();

    // DESAYUNO (5:00 A LAS 9:00)
    if (hour >= 5 && hour < 9) {
        return 'desayuno';
    }
    // ALMUERZO (12:00 A LAS 16:00)
    else if (hour >= 12 && hour < 16) {
        return 'almuerzo';
    }
    // CENA (17:00 A LAS 00:00)
    else {
        return 'cena';
    }
}

// Helper to format meal type in Spanish
export function formatMealType(mealType: MealType): string {
    const labels: Record<MealType, string> = {
        desayuno: 'Desayuno',
        almuerzo: 'Almuerzo',
        cena: 'Cena',
    };
    return labels[mealType];
}

// Find person by QR code
export function findPersonByQR(qrCode: string): Person | undefined {
    return mockPersons.find(
        (p) => p.qrCode.toLowerCase() === qrCode.toLowerCase()
    );
}
