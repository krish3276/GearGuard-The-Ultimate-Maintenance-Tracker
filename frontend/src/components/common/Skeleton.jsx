import { cn } from '../../utils/helpers';

// Base Skeleton component with shimmer animation
const Skeleton = ({ className, ...props }) => (
    <div
        className={cn(
            'animate-pulse bg-dark-700/50 rounded-lg',
            className
        )}
        {...props}
    />
);

// Text skeleton - for single or multiple lines
const SkeletonText = ({ lines = 1, className }) => (
    <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                className={cn(
                    'h-4',
                    i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
                )}
            />
        ))}
    </div>
);

// Avatar skeleton
const SkeletonAvatar = ({ size = 'md', className }) => {
    const sizes = {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return (
        <Skeleton className={cn('rounded-full', sizes[size], className)} />
    );
};

// Stat card skeleton for dashboard
const SkeletonStatCard = ({ className }) => (
    <div
        className={cn(
            'relative overflow-hidden rounded-2xl border border-dark-700/50 bg-dark-800/60 backdrop-blur-xl p-6',
            className
        )}
    >
        <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-20 mb-2" />
                <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="w-12 h-12 rounded-2xl" />
        </div>
        <div className="mt-4">
            <Skeleton className="h-1.5 w-full rounded-full mb-2" />
            <Skeleton className="h-4 w-28" />
        </div>
    </div>
);

// Table row skeleton
const SkeletonTableRow = ({ cols = 5, className }) => (
    <tr className={cn('border-b border-dark-700/30', className)}>
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-6 py-4">
                <Skeleton className={cn('h-4', i === 0 ? 'w-32' : 'w-20')} />
            </td>
        ))}
    </tr>
);

// Card skeleton
const SkeletonCard = ({ className, hasHeader = true, hasFooter = false }) => (
    <div
        className={cn(
            'bg-dark-800/60 backdrop-blur-xl rounded-2xl border border-dark-700/50 p-6',
            className
        )}
    >
        {hasHeader && (
            <div className="flex items-start justify-between mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="w-5 h-5 rounded" />
            </div>
        )}
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        {hasFooter && (
            <div className="flex items-center justify-between pt-4 border-t border-dark-700/50">
                <div className="flex -space-x-2">
                    <SkeletonAvatar size="sm" />
                    <SkeletonAvatar size="sm" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
            </div>
        )}
    </div>
);

// Kanban card skeleton
const SkeletonKanbanCard = ({ className }) => (
    <div
        className={cn(
            'bg-dark-800/60 backdrop-blur-sm rounded-xl p-4 border border-dark-700/50',
            className
        )}
    >
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2 mb-3" />
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <SkeletonAvatar size="xs" />
        </div>
    </div>
);

// Kanban column skeleton
const SkeletonKanbanColumn = ({ cardCount = 3, className }) => (
    <div
        className={cn(
            'bg-dark-800/40 backdrop-blur-lg rounded-2xl p-4 min-h-[500px] w-80 flex-shrink-0 border border-dark-700/30',
            className
        )}
    >
        <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-6 rounded-full" />
        </div>
        <div className="space-y-3">
            {Array.from({ length: cardCount }).map((_, i) => (
                <SkeletonKanbanCard key={i} />
            ))}
        </div>
    </div>
);

// Detail page skeleton
const SkeletonDetailPage = ({ className }) => (
    <div className={cn('p-6 space-y-6', className)}>
        <div className="flex items-center justify-between">
            <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <SkeletonCard hasHeader={false} />
                <SkeletonCard hasHeader={false} />
            </div>
            <div className="space-y-6">
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    </div>
);

// Form skeleton
const SkeletonForm = ({ fields = 6, cols = 2, className }) => (
    <div className={cn('space-y-4', className)}>
        <div className={`grid grid-cols-1 sm:grid-cols-${cols} gap-4`}>
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                </div>
            ))}
        </div>
    </div>
);

// Calendar skeleton
const SkeletonCalendar = ({ className }) => (
    <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-2">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={`header-${i}`} className="h-10 rounded-lg" />
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={`cell-${i}`} className="h-24 rounded-lg" />
            ))}
        </div>
    </div>
);

// Profile skeleton
const SkeletonProfile = ({ className }) => (
    <div className={cn('space-y-6', className)}>
        <div className="flex items-center gap-4">
            <SkeletonAvatar size="xl" />
            <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
        <SkeletonForm fields={4} />
    </div>
);

// Dashboard welcome skeleton
const SkeletonDashboardWelcome = ({ className }) => (
    <div
        className={cn(
            'relative overflow-hidden rounded-3xl bg-dark-800/60 border border-dark-700/50 p-8',
            className
        )}
    >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
                <Skeleton className="h-8 w-64 mb-3" />
                <Skeleton className="h-5 w-96 mb-6" />
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-40 rounded-full" />
                    <Skeleton className="h-10 w-48 rounded-full" />
                </div>
            </div>
            <div className="hidden lg:block">
                <Skeleton className="w-24 h-24 rounded-full" />
            </div>
        </div>
    </div>
);

// Activity item skeleton
const SkeletonActivityItem = ({ className }) => (
    <div className={cn('flex items-start gap-3 p-2', className)}>
        <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
        <div className="flex-1">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-3 w-20" />
        </div>
    </div>
);

// Quick action skeleton
const SkeletonQuickAction = ({ className }) => (
    <Skeleton className={cn('h-28 rounded-xl', className)} />
);

export {
    Skeleton,
    SkeletonText,
    SkeletonAvatar,
    SkeletonStatCard,
    SkeletonTableRow,
    SkeletonCard,
    SkeletonKanbanCard,
    SkeletonKanbanColumn,
    SkeletonDetailPage,
    SkeletonForm,
    SkeletonCalendar,
    SkeletonProfile,
    SkeletonDashboardWelcome,
    SkeletonActivityItem,
    SkeletonQuickAction,
};

export default Skeleton;
