import { useState, useEffect } from 'react';
import { MealType } from '@/types';
import { getMealTypeByTime, formatMealType } from '@/lib/api/mock-data';

interface MealTypeInfo {
    type: MealType;
    label: string;
    timeRange: string;
    isActive: boolean;
}

/**
 * Hook to get current meal type based on time of day
 * Updates every minute to reflect changes
 */
export function useMealType() {
    const [currentMealType, setCurrentMealType] = useState<MealType>(getMealTypeByTime());
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Update every minute
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            setCurrentMealType(getMealTypeByTime(now));
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const getMealSchedule = (): MealTypeInfo[] => {
        const hour = currentTime.getHours();

        return [
            {
                type: 'desayuno' as MealType,
                label: 'Desayuno',
                timeRange: '05:00 - 09:00',
                isActive: hour >= 5 && hour < 9,
            },
            {
                type: 'almuerzo' as MealType,
                label: 'Almuerzo',
                timeRange: '12:00 - 16:00',
                isActive: hour >= 12 && hour < 16,
            },
            {
                type: 'cena' as MealType,
                label: 'Cena',
                timeRange: '17:00 - 00:00',
                isActive: hour >= 17 || hour < 5,
            },
        ];
    };

    return {
        currentMealType,
        currentMealLabel: formatMealType(currentMealType),
        currentTime,
        getMealSchedule,
    };
}
