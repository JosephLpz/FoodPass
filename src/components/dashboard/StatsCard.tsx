import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    iconColor?: string;
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
    iconColor = 'text-emerald-600 bg-emerald-100',
}: StatsCardProps) {
    return (
        <Card className={cn('relative overflow-hidden', className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                    {title}
                </CardTitle>
                <div className={cn('p-2 rounded-lg', iconColor)}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                {(description || trend) && (
                    <div className="flex items-center gap-2 mt-1">
                        {trend && (
                            <span
                                className={cn(
                                    'text-xs font-medium',
                                    trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                                )}
                            >
                                {trend.isPositive ? '+' : ''}{trend.value}%
                            </span>
                        )}
                        {description && (
                            <span className="text-xs text-slate-500">{description}</span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
