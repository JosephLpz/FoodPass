// API Service layer - Connects to Next.js API Routes
import {
    ApiResponse,
    PaginatedResponse,
    User,
    Company,
    DiningHall,
    Person,
    Consumption,
    DashboardStats,
    ReportSummary,
    ReportFilters,
    QRValidationResult,
} from '@/types';

// Configure API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`API Error (${path}):`, error);
        return { success: false, error: 'Error de conexión con el servidor' };
    }
}

// ============ AUTH SERVICES ============

export async function login(
    email: string,
    password: string
): Promise<ApiResponse<User>> {
    return fetchApi<User>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export async function logout(): Promise<ApiResponse<null>> {
    return { success: true }; // Client-side logout handles cookie/storage removal
}

export async function getCurrentUser(): Promise<ApiResponse<User | null>> {
    // In a real app with cookies, this would check session
    return { success: true, data: null };
}

// ============ DASHBOARD SERVICES ============

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    // Mock for now or implement another endpoint
    return fetchApi<DashboardStats>('/stats'); // Need to implement /api/stats
}

export async function getRecentConsumptions(
    limit: number = 5
): Promise<ApiResponse<Consumption[]>> {
    const res = await fetchApi<{ items: Consumption[] }>(`/consumptions?limit=${limit}`);
    return {
        ...res,
        data: res.data?.items || []
    };
}

export async function getConsumptions(
    page: number = 1,
    pageSize: number = 50,
    filters?: {
        companyId?: string;
        mealType?: string;
        workerName?: string;
        startDate?: Date;
        endDate?: Date;
    }
): Promise<ApiResponse<PaginatedResponse<Consumption>>> {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
    });

    if (filters?.companyId && filters.companyId !== 'all') params.append('companyId', filters.companyId);
    if (filters?.mealType && filters.mealType !== 'all') params.append('mealType', filters.mealType);
    if (filters?.workerName) params.append('workerName', filters.workerName);
    if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());

    return fetchApi<PaginatedResponse<Consumption>>(`/consumptions?${params.toString()}`);
}

// ============ PERSONS (WORKERS) SERVICES ============

export async function getPersons(
    page: number = 1,
    pageSize: number = 10,
    search?: string
): Promise<ApiResponse<PaginatedResponse<Person>>> {
    const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
    });
    if (search) params.append('search', search);

    return fetchApi<PaginatedResponse<Person>>(`/workers?${params.toString()}`);
}

export async function getPersonById(id: string): Promise<ApiResponse<Person>> {
    return fetchApi<Person>(`/workers/${id}`);
}

export async function createPerson(
    personData: Omit<Person, 'id' | 'createdAt' | 'companyName'>
): Promise<ApiResponse<Person>> {
    return fetchApi<Person>('/workers', {
        method: 'POST',
        body: JSON.stringify(personData),
    });
}

export async function updatePerson(
    id: string,
    personData: Partial<Person>
): Promise<ApiResponse<Person>> {
    return fetchApi<Person>(`/workers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(personData),
    });
}

export async function deletePerson(id: string): Promise<ApiResponse<null>> {
    return fetchApi<null>(`/workers/${id}`, {
        method: 'DELETE',
    });
}

// ============ COMPANIES SERVICES ============

export async function getCompanies(
    page: number = 1,
    pageSize: number = 10,
    search?: string
): Promise<ApiResponse<PaginatedResponse<Company>>> {
    const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
    });
    if (search) params.append('search', search);

    return fetchApi<PaginatedResponse<Company>>(`/companies?${params.toString()}`);
}

export async function getCompanyById(id: string): Promise<ApiResponse<Company>> {
    return fetchApi<Company>(`/companies/${id}`);
}

export async function createCompany(
    companyData: Omit<Company, 'id' | 'createdAt' | 'totalPersons' | 'totalConsumptions'>
): Promise<ApiResponse<Company>> {
    return fetchApi<Company>('/companies', {
        method: 'POST',
        body: JSON.stringify(companyData),
    });
}

export async function updateCompany(
    id: string,
    companyData: Partial<Company>
): Promise<ApiResponse<Company>> {
    return fetchApi<Company>(`/companies/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(companyData),
    });
}

export async function deleteCompany(id: string): Promise<ApiResponse<null>> {
    return fetchApi<null>(`/companies/${id}`, {
        method: 'DELETE',
    });
}

// ============ DINING HALLS SERVICES ============

export async function getDiningHalls(
    page: number = 1,
    pageSize: number = 10
): Promise<ApiResponse<PaginatedResponse<DiningHall>>> {
    const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
    });
    return fetchApi<PaginatedResponse<DiningHall>>(`/dining-halls?${params.toString()}`);
}

export async function createDiningHall(
    hallData: Omit<DiningHall, 'id' | 'todayConsumptions' | 'totalConsumptions'>
): Promise<ApiResponse<DiningHall>> {
    return fetchApi<DiningHall>('/dining-halls', {
        method: 'POST',
        body: JSON.stringify(hallData),
    });
}

export async function updateDiningHall(
    id: string,
    hallData: Partial<DiningHall>
): Promise<ApiResponse<DiningHall>> {
    return fetchApi<DiningHall>(`/dining-halls/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(hallData),
    });
}

export async function deleteDiningHall(id: string): Promise<ApiResponse<null>> {
    return fetchApi<null>(`/dining-halls/${id}`, {
        method: 'DELETE',
    });
}

// ============ CONSUMPTION REGISTRATION ============

export async function validateAndRegisterQR(
    qrCode: string,
    isEnhanced: boolean = false,
    diningHallId: string = 'dh1',
    userId?: string
): Promise<ApiResponse<QRValidationResult>> {
    return fetchApi<QRValidationResult>('/consumptions', {
        method: 'POST',
        body: JSON.stringify({ qrCode, isEnhanced, diningHallId, userId }),
    });
}

// ============ REPORTS SERVICES ============

export async function getReportSummary(
    filters: ReportFilters
): Promise<ApiResponse<ReportSummary[]>> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
    if (filters.companyId) params.append('companyId', filters.companyId);
    if (filters.diningHallId) params.append('diningHallId', filters.diningHallId);
    if (filters.mealType) params.append('mealType', filters.mealType);

    return fetchApi<ReportSummary[]>(`/reports?${params.toString()}`);
}

export async function exportReport(
    filters: ReportFilters,
    format: 'csv' | 'excel' = 'csv'
): Promise<ApiResponse<{ downloadUrl: string }>> {
    // This would typically trigger a download or return a signed URL
    return {
        success: true,
        data: { downloadUrl: '#' },
        message: 'Reporte generado. En un sistema real, esto descargaría un archivo.'
    };
}

// ============ USERS SERVICES ============

export async function getUsers(
    page: number = 1,
    pageSize: number = 10
): Promise<ApiResponse<PaginatedResponse<User>>> {
    return fetchApi<PaginatedResponse<User>>(`/users?page=${page}&pageSize=${pageSize}`);
}

export async function createUser(
    userData: Omit<User, 'id' | 'createdAt'>
): Promise<ApiResponse<User>> {
    return fetchApi<User>('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
}

export async function updateUser(
    id: string,
    userData: Partial<User>
): Promise<ApiResponse<User>> {
    return fetchApi<User>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(userData),
    });
}

export async function deleteUser(id: string): Promise<ApiResponse<null>> {
    return fetchApi<null>(`/users/${id}`, {
        method: 'DELETE',
    });
}
