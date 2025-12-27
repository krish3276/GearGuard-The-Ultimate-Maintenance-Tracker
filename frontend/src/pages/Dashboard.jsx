import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Cog,
  Wrench,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Badge, Avatar } from '../components/common';
import { equipmentAPI, maintenanceAPI, teamsAPI } from '../services/api';
import { formatDate, formatStatus } from '../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEquipment: 0,
    operationalEquipment: 0,
    openRequests: 0,
    overdueRequests: 0,
    completedThisMonth: 0,
    activeTeams: 0,
  });

  const [recentRequests, setRecentRequests] = useState([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const openReqs = requests.filter(
          (r) => r.status === 'New' || r.status === 'In Progress'
        ).length;
        const overdueReqs = requests.filter((r) => r.isOverdue).length;
        const completed = requests.filter((r) => r.status === 'Repaired').length;

        setStats({
          totalEquipment: equipment.length,
          operationalEquipment: operational,
          openRequests: openReqs,
          overdueRequests: overdueReqs,
          completedThisMonth: completed,
          activeTeams: teams.length,
        });

        setRecentRequests(requests.slice(0, 5));
        setUpcomingMaintenance(
          requests
            .filter((r) => r.type === 'Preventive' && r.scheduled_date)
            .slice(0, 4)
        );
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

  const statCards = [
    {
      title: 'Total Equipment',
      value: stats.totalEquipment,
      subtitle: `${stats.operationalEquipment} operational`,
      icon: Cog,
      color: 'bg-blue-500',
      trend: '+2 this month',
    },
    {
      title: 'Open Requests',
      value: stats.openRequests,
      subtitle: `${stats.overdueRequests} overdue`,
      icon: Wrench,
      color: 'bg-amber-500',
      trend: 'Needs attention',
      alert: stats.overdueRequests > 0,
    },
    {
      title: 'Completed',
      value: stats.completedThisMonth,
      subtitle: 'This month',
      icon: CheckCircle,
      color: 'bg-green-500',
      trend: '+15% vs last month',
    },
    {
      title: 'Active Teams',
      value: stats.activeTeams,
      subtitle: 'Maintenance teams',
      icon: Users,
      color: 'bg-purple-500',
      trend: 'Fully staffed',
    },
  ];

  const getStatusBadge = (status) => {
    const statusKey = status?.toLowerCase().replace(' ', '_') || 'new';
    const variants = {
      new: 'info',
      in_progress: 'warning',
      repaired: 'success',
      scrap: 'danger',
    };
    return <Badge variant={variants[statusKey] || 'default'}>{status || 'New'}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      low: 'default',
      medium: 'info',
      high: 'warning',
      critical: 'danger',
    };
    return <Badge variant={variants[priority] || 'default'}>{priority}</Badge>;
  };

  if (loading) {
    return (
      <div>
        <Header title="Dashboard" subtitle="Welcome back! Here's what's happening today." />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
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
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Dashboard" subtitle="Welcome back! Here's what's happening today." />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {stat.alert ? (
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {stat.trend}
                  </span>
                ) : (
                  <span className="text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {stat.trend}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Maintenance Requests */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Maintenance Requests</h2>
                <Link
                  to="/maintenance"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Subject
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Equipment
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Priority
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Assigned
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {request.isOverdue && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {request.subject}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {request.equipment?.name || '-'}
                        </td>
                        <td className="py-3 px-4">{getPriorityBadge(request.priority || 'medium')}</td>
                        <td className="py-3 px-4">{getStatusBadge(request.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar name={request.assignedTechnician?.name || 'Unassigned'} size="xs" />
                            <span className="text-sm text-gray-600">
                              {request.assignedTechnician?.name || 'Unassigned'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {recentRequests.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-500">
                          No maintenance requests found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Upcoming Maintenance */}
          <div>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Maintenance</h2>
                <Link
                  to="/calendar"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  Calendar <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingMaintenance.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.subject}
                      </p>
                      <p className="text-xs text-gray-500">{item.equipment?.name || '-'}</p>
                      <p className="text-xs text-primary-600 mt-1">
                        {formatDate(item.scheduled_date)}
                      </p>
                    </div>
                  </div>
                ))}
                {upcomingMaintenance.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No upcoming maintenance scheduled
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/maintenance"
              className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors"
            >
              <div className="p-2 bg-primary-600 rounded-lg">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">New Request</p>
                <p className="text-xs text-gray-500">Create maintenance request</p>
              </div>
            </Link>
            <Link
              to="/equipment"
              className="flex items-center gap-3 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
            >
              <div className="p-2 bg-green-600 rounded-lg">
                <Cog className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Add Equipment</p>
                <p className="text-xs text-gray-500">Register new equipment</p>
              </div>
            </Link>
            <Link
              to="/teams"
              className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <div className="p-2 bg-purple-600 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Manage Teams</p>
                <p className="text-xs text-gray-500">View maintenance teams</p>
              </div>
            </Link>
            <Link
              to="/calendar"
              className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <div className="p-2 bg-amber-600 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Schedule</p>
                <p className="text-xs text-gray-500">View maintenance calendar</p>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
