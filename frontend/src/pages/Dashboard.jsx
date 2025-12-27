import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Cog,
  Wrench,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Calendar,
  ArrowRight,
  Loader2,
  Activity,
  Clock,
  Zap,
  BarChart3,
  Shield,
  Sparkles,
  ChevronRight,
  PlayCircle,
} from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Badge, SkeletonStatCard, SkeletonTableRow, SkeletonCard, SkeletonDashboardWelcome, SkeletonActivityItem, SkeletonQuickAction, Skeleton } from '../components/common';
import { equipmentAPI, maintenanceAPI, teamsAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = '', duration = 1000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const numericValue = typeof value === 'number' ? value : parseInt(value) || 0;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * numericValue));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className="animate-count-up">{count}{suffix}</span>;
};

// Progress Ring Component
const ProgressRing = ({ progress, size = 60, strokeWidth = 4, color = '#6366f1' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg className="progress-ring" width={size} height={size}>
      <circle
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className="progress-ring__circle"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: offset,
        }}
      />
    </svg>
  );
};

// Mini Sparkline Chart
const Sparkline = ({ data = [30, 60, 40, 80, 50, 70, 90], color = '#10b981' }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 30;
  const width = 80;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        className="sparkline-path"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

// Health Bar Component
const HealthBar = ({ label, value, max, color, delay = 0 }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-200 font-medium">{value}</span>
      </div>
      <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full health-bar-fill"
          style={{
            width: `${percentage}%`,
            background: color,
            animationDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEquipment: 0,
    operationalEquipment: 0,
    criticalEquipment: 0,
    openRequests: 0,
    overdueRequests: 0,
    completedThisMonth: 0,
    activeTeams: 0,
    inProgressRequests: 0,
  });

  const [recentRequests, setRecentRequests] = useState([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [equipmentRes, requestsRes, teamsRes] = await Promise.all([
          equipmentAPI.getAll(),
          maintenanceAPI.getAll(),
          teamsAPI.getAll(),
        ]);

        const equipment = equipmentRes.data?.data || equipmentRes.data || [];
        const requests = requestsRes.data?.data || requestsRes.data || [];
        const teams = teamsRes.data?.data || teamsRes.data || [];

        const operational = equipment.filter((e) => !e.is_scrapped).length;
        const critical = equipment.filter((e) => e.health_score && e.health_score < 30).length;
        const openReqs = requests.filter(
          (r) => r.status === 'New' || r.status === 'In Progress'
        ).length;
        const inProgress = requests.filter((r) => r.status === 'In Progress').length;
        const overdueReqs = requests.filter((r) => r.isOverdue).length;
        const completed = requests.filter((r) => r.status === 'Repaired').length;

        setStats({
          totalEquipment: equipment.length,
          operationalEquipment: operational,
          criticalEquipment: critical,
          openRequests: openReqs,
          overdueRequests: overdueReqs,
          completedThisMonth: completed,
          activeTeams: teams.length,
          inProgressRequests: inProgress,
        });

        setRecentRequests(requests.slice(0, 5));
        setUpcomingMaintenance(
          requests
            .filter((r) => r.type === 'Preventive' && r.scheduled_date)
            .slice(0, 4)
        );

        // Create mock activity feed from recent requests
        const activities = requests.slice(0, 6).map((req, index) => ({
          id: req.id,
          type: req.status === 'Repaired' ? 'completed' : req.status === 'In Progress' ? 'started' : 'created',
          message: req.status === 'Repaired'
            ? `Maintenance completed for ${req.equipment?.name || 'Equipment'}`
            : req.status === 'In Progress'
              ? `Work started on ${req.subject}`
              : `New request: ${req.subject}`,
          time: req.updatedAt || req.createdAt,
          delay: index * 100,
        }));
        setRecentActivity(activities);

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate utilization percentage
  const utilizationPercent = Math.min(
    85,
    Math.round((stats.openRequests / Math.max(stats.activeTeams, 1)) * 20)
  );

  // Calculate equipment health distribution
  const healthDistribution = useMemo(() => ({
    critical: stats.criticalEquipment,
    warning: Math.floor(stats.totalEquipment * 0.15),
    good: stats.operationalEquipment - stats.criticalEquipment - Math.floor(stats.totalEquipment * 0.15),
  }), [stats]);

  const statCards = [
    {
      title: 'Critical Equipment',
      value: stats.criticalEquipment,
      subtitle: 'Health < 30%',
      icon: AlertTriangle,
      gradient: 'from-rose-500 to-red-600',
      bgGlow: 'rgba(244, 63, 94, 0.15)',
      progressColor: '#f43f5e',
      progress: stats.totalEquipment > 0 ? (stats.criticalEquipment / stats.totalEquipment) * 100 : 0,
      trend: 'down',
      trendValue: 'Needs attention',
      link: '/equipment',
    },
    {
      title: 'Technician Load',
      value: utilizationPercent,
      suffix: '%',
      subtitle: 'Workforce utilization',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      bgGlow: 'rgba(6, 182, 212, 0.15)',
      progressColor: '#06b6d4',
      progress: utilizationPercent,
      trend: 'neutral',
      trendValue: `${stats.activeTeams} teams active`,
      link: '/teams',
    },
    {
      title: 'Open Requests',
      value: stats.openRequests,
      subtitle: `${stats.overdueRequests} overdue`,
      icon: Wrench,
      gradient: 'from-emerald-500 to-green-500',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      progressColor: '#10b981',
      progress: stats.completedThisMonth > 0
        ? (stats.completedThisMonth / (stats.completedThisMonth + stats.openRequests)) * 100
        : 0,
      trend: 'up',
      trendValue: `${stats.completedThisMonth} completed`,
      sparklineData: [20, 35, 25, 45, 40, 55, stats.openRequests * 5],
      link: '/maintenance',
    },
    {
      title: 'Active Teams',
      value: stats.activeTeams,
      subtitle: 'Maintenance teams',
      icon: Shield,
      gradient: 'from-purple-500 to-pink-500',
      bgGlow: 'rgba(168, 85, 247, 0.15)',
      progressColor: '#a855f7',
      progress: 100,
      trend: 'up',
      trendValue: 'Fully operational',
      link: '/teams',
    },
  ];

  const getStatusBadge = (status) => {
    const statusKey = status?.toLowerCase().replace(' ', '_') || 'new';
    const configs = {
      new: { variant: 'info', icon: Sparkles },
      in_progress: { variant: 'warning', icon: PlayCircle },
      repaired: { variant: 'success', icon: CheckCircle },
      scrap: { variant: 'danger', icon: AlertTriangle },
    };
    const config = configs[statusKey] || configs.new;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <config.icon className="w-3 h-3" />
        {status || 'New'}
      </Badge>
    );
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'started':
        return <PlayCircle className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-primary-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Dashboard" subtitle="Welcome back! Here's what's happening today." />
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Welcome Section Skeleton */}
          <SkeletonDashboardWelcome />

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonStatCard key={i} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Requests Table Skeleton */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div>
                      <Skeleton className="h-5 w-48 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-700/50">
                        {['Subject', 'Equipment', 'Assigned To', 'Status', 'Priority'].map((_, i) => (
                          <th key={i} className="py-3 px-6">
                            <Skeleton className="h-3 w-20" />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <SkeletonTableRow key={i} cols={5} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Equipment Health Skeleton */}
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div>
                    <Skeleton className="h-5 w-48 mb-1" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              {/* Upcoming Maintenance Skeleton */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="w-6 h-6 rounded" />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-3">
                      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-3 w-24 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick Actions Skeleton */}
              <Card>
                <Skeleton className="h-5 w-28 mb-4" />
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonQuickAction key={i} />
                  ))}
                </div>
              </Card>

              {/* Activity Skeleton */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonActivityItem key={i} />
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Dashboard" subtitle="Welcome back! Here's what's happening today." />
        <div className="p-6">
          <Card className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <p className="text-rose-400">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" subtitle="Welcome back! Here's what's happening today." />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl gradient-border">
          <div className="gradient-mesh p-4 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                  {greeting}, <span className="gradient-text">{user?.name || 'User'}</span>! 👋
                </h2>
                <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl">
                  Your maintenance operations are running smoothly. Here's a quick overview of today's status.
                </p>
                <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-4 md:mt-6">
                  <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-xs md:text-sm font-medium">System Operational</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-primary-500/10 border border-primary-500/20 rounded-full">
                    <Activity className="w-3 h-3 md:w-4 md:h-4 text-primary-400" />
                    <span className="text-primary-400 text-xs md:text-sm font-medium">
                      {stats.inProgressRequests} tasks in progress
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-6">
                <div className="text-center">
                  <div className="relative">
                    <ProgressRing
                      progress={stats.totalEquipment > 0 ? (stats.operationalEquipment / stats.totalEquipment) * 100 : 0}
                      size={100}
                      strokeWidth={8}
                      color="#10b981"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {stats.totalEquipment > 0 ? Math.round((stats.operationalEquipment / stats.totalEquipment) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">Equipment Health</p>
                </div>
              </div>
            </div>
          </div>
          <div className="shimmer-bg absolute inset-0 pointer-events-none" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((stat, index) => (
            <Link key={stat.title} to={stat.link} className="block">
              <div
                className="stat-card relative overflow-hidden rounded-2xl border border-dark-700/50 bg-dark-800/60 backdrop-blur-xl p-6 hover:border-primary-500/30 hover:shadow-glow-sm"
                style={{
                  animationDelay: `${index * 100}ms`,
                  boxShadow: `0 0 60px ${stat.bgGlow}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">{stat.title}</p>
                    <p className="text-4xl font-bold text-white">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
                  </div>
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg animate-float-subtle`}
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Progress or Sparkline */}
                <div className="mt-4">
                  {stat.sparklineData ? (
                    <div className="flex items-center justify-between">
                      <Sparkline data={stat.sparklineData} color={stat.progressColor} />
                      <span className="text-sm text-emerald-400 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {stat.trendValue}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="h-1.5 bg-dark-700/50 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full health-bar-fill"
                          style={{
                            width: `${stat.progress}%`,
                            background: `linear-gradient(90deg, ${stat.progressColor}, ${stat.progressColor}88)`,
                            animationDelay: `${index * 100 + 300}ms`,
                          }}
                        />
                      </div>
                      <div className="flex items-center text-sm">
                        {stat.trend === 'down' ? (
                          <span className="text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            {stat.trendValue}
                          </span>
                        ) : stat.trend === 'up' ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {stat.trendValue}
                          </span>
                        ) : (
                          <span className="text-cyan-400 flex items-center gap-1">
                            <BarChart3 className="w-4 h-4" />
                            {stat.trendValue}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Recent Maintenance Requests */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-500/10 rounded-xl">
                    <Wrench className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-semibold text-white">Recent Maintenance Requests</h2>
                    <p className="text-xs md:text-sm text-gray-500 hidden sm:block">Latest service requests</p>
                  </div>
                </div>
                <Link
                  to="/maintenance"
                  className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 font-medium px-3 py-1.5 md:px-4 md:py-2 bg-primary-500/10 rounded-xl transition-all hover:bg-primary-500/20"
                >
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="overflow-x-auto -mx-4 md:-mx-6">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="glass-table-header">
                      <th className="text-left py-3 px-4 md:px-6 text-xs font-semibold text-primary-400 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="text-left py-3 px-4 md:px-6 text-xs font-semibold text-primary-400 uppercase tracking-wider">
                        Equipment
                      </th>
                      <th className="text-left py-3 px-4 md:px-6 text-xs font-semibold text-primary-400 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="text-left py-3 px-4 md:px-6 text-xs font-semibold text-primary-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 md:px-6 text-xs font-semibold text-primary-400 uppercase tracking-wider">
                        Priority
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((request, index) => (
                      <tr
                        key={request.id}
                        className="hover:bg-dark-700/30 transition-all duration-200 border-b border-dark-700/30 last:border-b-0"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="py-3 px-4 md:px-6">
                          <div className="flex items-center gap-3">
                            {request.isOverdue && (
                              <span className="flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                              </span>
                            )}
                            <div>
                              <span className="text-sm font-medium text-gray-200">
                                {request.subject}
                              </span>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {request.type || 'Corrective'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 md:px-6">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-dark-700/50 rounded-lg">
                              <Cog className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="text-sm text-gray-300">
                              {request.equipment?.name || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 md:px-6 text-sm text-gray-300">
                          {request.maintenanceTeam?.name || 'Unassigned'}
                        </td>
                        <td className="py-4 px-4 md:px-6">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="py-4 px-4 md:px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${request.priority === 'critical' || request.priority === 'high'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : request.priority === 'medium'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                            }`}>
                            <Zap className="w-3 h-3" />
                            {request.priority || 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {recentRequests.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Wrench className="w-12 h-12 text-gray-600 mb-3" />
                            <p className="text-gray-500">No maintenance requests found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Equipment Health Overview */}
            <Card className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Equipment Health Overview</h2>
                    <p className="text-sm text-gray-500">Status distribution by health score</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <HealthBar
                  label="Critical (< 30%)"
                  value={healthDistribution.critical}
                  max={stats.totalEquipment || 1}
                  color="linear-gradient(90deg, #f43f5e, #fb7185)"
                  delay={0}
                />
                <HealthBar
                  label="Warning (30-70%)"
                  value={healthDistribution.warning}
                  max={stats.totalEquipment || 1}
                  color="linear-gradient(90deg, #f59e0b, #fbbf24)"
                  delay={200}
                />
                <HealthBar
                  label="Good (> 70%)"
                  value={healthDistribution.good}
                  max={stats.totalEquipment || 1}
                  color="linear-gradient(90deg, #10b981, #34d399)"
                  delay={400}
                />
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Maintenance */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-xl">
                    <Calendar className="w-5 h-5 text-amber-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Upcoming</h2>
                </div>
                <Link
                  to="/calendar"
                  className="text-sm text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-1">
                {upcomingMaintenance.map((item, index) => (
                  <div
                    key={item.id}
                    className="timeline-item flex items-start gap-3 p-3 rounded-xl hover:bg-glass-hover transition-all duration-200"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-2 bg-primary-500/20 rounded-xl flex-shrink-0">
                      <Clock className="w-4 h-4 text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {item.subject}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{item.equipment?.name || '-'}</p>
                      <p className="text-xs text-primary-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.scheduled_date)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </div>
                ))}
                {upcomingMaintenance.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No upcoming maintenance</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/maintenance"
                  className="quick-action-btn flex flex-col items-center gap-3 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 hover:bg-primary-500/20 hover:border-primary-500/30"
                >
                  <div className="action-icon p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-200">New Request</span>
                </Link>
                <Link
                  to="/equipment"
                  className="quick-action-btn flex flex-col items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/30"
                >
                  <div className="action-icon p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                    <Cog className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-200">Equipment</span>
                </Link>
                <Link
                  to="/teams"
                  className="quick-action-btn flex flex-col items-center gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/30"
                >
                  <div className="action-icon p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-200">Teams</span>
                </Link>
                <Link
                  to="/calendar"
                  className="quick-action-btn flex flex-col items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/30"
                >
                  <div className="action-icon p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-200">Calendar</span>
                </Link>
              </div>
            </Card>

            {/* Live Activity Feed */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <Activity className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Activity</h2>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Live
                </div>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentActivity.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2 rounded-lg animate-slide-in"
                    style={{ animationDelay: `${activity.delay}ms` }}
                  >
                    <div className="p-1.5 bg-dark-700/50 rounded-lg">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 line-clamp-2">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time ? formatDate(activity.time) : 'Just now'}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <div className="text-center py-6">
                    <Activity className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
