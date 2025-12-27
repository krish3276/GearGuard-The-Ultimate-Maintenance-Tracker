import { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Loader2,
  AlertTriangle,
  Calendar as CalendarIcon,
  List,
  Grid3X3,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Timer,
  Filter,
  Trash2,
  X,
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  parseISO,
  isSameMonth,
  getDay,
  eachDayOfInterval,
} from 'date-fns';
import { Header } from '../components/layout';
import { Card, Button, Badge, Avatar, Modal, Input, Select, Textarea } from '../components/common';
import { maintenanceAPI, equipmentAPI, teamsAPI } from '../services/api';
import { cn, formatDate } from '../utils/helpers';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [requests, setRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');

  const initialFormData = {
    subject: '',
    description: '',
    equipmentId: '',
    maintenanceTeamId: '',
    scheduledDate: '',
    priority: 'medium',
  };

  const [formData, setFormData] = useState(initialFormData);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const monthStart = startOfWeek(start, { weekStartsOn: 0 });
    const monthEnd = endOfWeek(end, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentDate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, equipmentRes, teamsRes] = await Promise.all([
        maintenanceAPI.getAll(),
        equipmentAPI.getAll(),
        teamsAPI.getAll(),
      ]);
      setRequests((requestsRes.data?.data || requestsRes.data || []).filter(r => r.scheduled_date));
      setEquipment(equipmentRes.data?.data || equipmentRes.data || []);
      setTeams(teamsRes.data?.data || teamsRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDay = (date) => {
    return requests.filter(r => {
      try {
        const matches = isSameDay(parseISO(r.scheduled_date), date);
        if (!matches) return false;
        if (filterPriority === 'all') return true;
        return r.priority === filterPriority;
      } catch {
        return false;
      }
    });
  };

  const filteredRequests = useMemo(() => {
    if (filterPriority === 'all') return requests;
    return requests.filter(r => r.priority === filterPriority);
  }, [requests, filterPriority]);

  const stats = useMemo(() => {
    const total = filteredRequests.length;
    const critical = requests.filter(r => r.priority === 'critical').length;
    const high = requests.filter(r => r.priority === 'high').length;
    const thisWeek = requests.filter(r => {
      try {
        const date = parseISO(r.scheduled_date);
        return date >= weekStart && date <= addDays(weekStart, 6);
      } catch {
        return false;
      }
    }).length;
    return { total, critical, high, thisWeek };
  }, [requests, filteredRequests, weekStart]);

  const handleCreateMaintenance = async () => {
    if (!formData.subject || !formData.equipmentId || !formData.scheduledDate) {
      alert('Please fill required fields');
      return;
    }
    try {
      setSaving(true);
      await maintenanceAPI.create({
        subject: formData.subject,
        type: 'Preventive',
        equipment_id: parseInt(formData.equipmentId),
        scheduled_date: formData.scheduledDate,
        priority: formData.priority,
        ...(formData.description && { description: formData.description }),
        ...(formData.maintenanceTeamId && { maintenance_team_id: parseInt(formData.maintenanceTeamId) }),
      });
      await fetchData();
      setFormData(initialFormData);
      setShowCreateModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMaintenance = async (eventId) => {
    if (!confirm('Are you sure you want to delete this scheduled maintenance?')) return;
    try {
      setDeleting(true);
      await maintenanceAPI.delete(eventId);
      await fetchData();
      setShowEventModal(false);
      setSelectedEvent(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const getPriorityConfig = (priority) => ({
    low: {
      bg: 'bg-slate-500/20',
      text: 'text-slate-300',
      border: 'border-slate-500/30',
      dot: 'bg-slate-400',
      label: 'Low'
    },
    medium: {
      bg: 'bg-cyan-500/20',
      text: 'text-cyan-300',
      border: 'border-cyan-500/30',
      dot: 'bg-cyan-400',
      label: 'Medium'
    },
    high: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-300',
      border: 'border-amber-500/30',
      dot: 'bg-amber-400',
      label: 'High'
    },
    critical: {
      bg: 'bg-rose-500/20',
      text: 'text-rose-300',
      border: 'border-rose-500/30',
      dot: 'bg-rose-400',
      label: 'Critical'
    },
  }[priority] || { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30', dot: 'bg-cyan-400', label: 'Medium' });

  const handleNavigate = (direction) => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const openCreateForDay = (day) => {
    setFormData({ ...initialFormData, scheduledDate: format(day, 'yyyy-MM-dd') });
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div>
        <Header title="Maintenance Calendar" subtitle="Schedule and track preventive maintenance" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-3" />
            <p className="text-gray-400">Loading calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Maintenance Calendar" subtitle="Schedule and track preventive maintenance" />
        <div className="p-6">
          <Card className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <p className="text-rose-400 mb-4">{error}</p>
            <Button onClick={fetchData}>Retry</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Maintenance Calendar" subtitle="Schedule and track preventive maintenance" />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-800/60 backdrop-blur-xl rounded-2xl border border-dark-700/50 p-4 hover:border-primary-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary-500/20">
                <CalendarIcon className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-gray-400">Total Scheduled</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-800/60 backdrop-blur-xl rounded-2xl border border-dark-700/50 p-4 hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20">
                <Timer className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.thisWeek}</p>
                <p className="text-xs text-gray-400">This Week</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-800/60 backdrop-blur-xl rounded-2xl border border-dark-700/50 p-4 hover:border-rose-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20">
                <AlertCircle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.critical}</p>
                <p className="text-xs text-gray-400">Critical</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-800/60 backdrop-blur-xl rounded-2xl border border-dark-700/50 p-4 hover:border-cyan-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20">
                <Wrench className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.high}</p>
                <p className="text-xs text-gray-400">High Priority</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-dark-800/60 backdrop-blur-xl rounded-2xl border border-dark-700/50 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Navigation */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-dark-900/50 rounded-xl p-1">
                <button
                  onClick={() => handleNavigate('prev')}
                  className="p-2 hover:bg-dark-700/50 rounded-lg transition-colors"
                  title="Previous"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={() => handleNavigate('next')}
                  className="p-2 hover:bg-dark-700/50 rounded-lg transition-colors"
                  title="Next"
                >
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="!px-4"
              >
                Today
              </Button>

              <div className="hidden sm:block h-6 w-px bg-dark-600" />

              <h2 className="text-lg font-semibold text-white">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Priority Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="bg-dark-900/50 border border-dark-600/50 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <Button
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => openCreateForDay(new Date())}
              >
                Schedule
              </Button>
            </div>
          </div>
        </div>

        {/* Priority Legend */}
        <div className="flex items-center gap-6 px-1">
          <span className="text-xs text-gray-500 font-medium">Priority:</span>
          {['critical', 'high', 'medium', 'low'].map(priority => {
            const config = getPriorityConfig(priority);
            return (
              <div key={priority} className="flex items-center gap-2">
                <div className={cn('w-2.5 h-2.5 rounded-full', config.dot)} />
                <span className="text-xs text-gray-400">{config.label}</span>
              </div>
            );
          })}
        </div>

        {/* Calendar Grid - Month View */}
        <div className="bg-dark-800/40 backdrop-blur-xl rounded-2xl border border-dark-700/50 overflow-hidden">
          {/* Month Header */}
          <div className="grid grid-cols-7 border-b border-dark-700/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {day}
              </div>
            ))}
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7">
            {monthDays.map((day, idx) => {
              const events = getEventsForDay(day);
              const today = isToday(day);
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedDay(day);
                    if (events.length === 0) {
                      openCreateForDay(day);
                    }
                  }}
                  className={cn(
                    'min-h-[100px] p-2 border-b border-r border-dark-700/30 cursor-pointer transition-all hover:bg-dark-700/30',
                    !isCurrentMonth && 'opacity-40',
                    today && 'bg-primary-500/5'
                  )}
                >
                  <div className={cn(
                    'text-sm font-semibold mb-1',
                    today ? 'text-primary-400' : isCurrentMonth ? 'text-white' : 'text-gray-600'
                  )}>
                    {format(day, 'd')}
                  </div>

                  <div className="space-y-1">
                    {events.slice(0, 3).map(event => {
                      const priorityConfig = getPriorityConfig(event.priority);
                      return (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                          className={cn(
                            'px-2 py-1 rounded-md text-xs truncate cursor-pointer transition-all hover:scale-[1.02]',
                            priorityConfig.bg, priorityConfig.text
                          )}
                        >
                          {event.subject}
                        </div>
                      );
                    })}
                    {events.length > 3 && (
                      <div className="text-xs text-gray-500 px-2">
                        +{events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      <Modal isOpen={showEventModal} onClose={() => setShowEventModal(false)} title="Maintenance Details" size="md">
        {selectedEvent && (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className={cn(
                'p-3 rounded-xl',
                getPriorityConfig(selectedEvent.priority).bg
              )}>
                <Wrench className={cn('w-6 h-6', getPriorityConfig(selectedEvent.priority).text)} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{selectedEvent.subject}</h3>
                <p className="text-gray-400 text-sm mt-1">{selectedEvent.description || 'No description provided'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700/30">
                <p className="text-xs text-gray-500 mb-1">Equipment</p>
                <p className="text-sm font-medium text-gray-200">{selectedEvent.equipment?.name || 'Not specified'}</p>
              </div>
              <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700/30">
                <p className="text-xs text-gray-500 mb-1">Scheduled Date</p>
                <p className="text-sm font-medium text-gray-200">{formatDate(selectedEvent.scheduled_date)}</p>
              </div>
              <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700/30">
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <Badge
                  variant={selectedEvent.priority === 'critical' ? 'danger' : selectedEvent.priority === 'high' ? 'warning' : 'info'}
                  className="mt-1"
                >
                  {selectedEvent.priority?.charAt(0).toUpperCase() + selectedEvent.priority?.slice(1)}
                </Badge>
              </div>
              <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700/30">
                <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar name={selectedEvent.assignedTechnician?.name || 'U'} size="xs" />
                  <span className="text-sm font-medium text-gray-200">
                    {selectedEvent.assignedTechnician?.name || 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>

            {selectedEvent.maintenance_team && (
              <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700/30">
                <p className="text-xs text-gray-500 mb-1">Maintenance Team</p>
                <p className="text-sm font-medium text-gray-200">{selectedEvent.maintenance_team?.name || 'Not assigned'}</p>
              </div>
            )}

            {/* Delete Button */}
            <div className="pt-4 border-t border-dark-700/30">
              <Button
                variant="danger"
                className="w-full"
                onClick={() => handleDeleteMaintenance(selectedEvent.id)}
                disabled={deleting}
                leftIcon={deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              >
                {deleting ? 'Deleting...' : 'Delete Schedule'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Maintenance Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setFormData(initialFormData); }}
        title="Schedule New Maintenance"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreateMaintenance} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Scheduling...
                </>
              ) : (
                'Schedule Maintenance'
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <Input
            label="Subject"
            placeholder="Enter maintenance subject..."
            value={formData.subject}
            onChange={v => setFormData({ ...formData, subject: v })}
            required
          />

          <Select
            label="Equipment"
            placeholder="Select equipment..."
            value={formData.equipmentId}
            onChange={v => setFormData({ ...formData, equipmentId: v })}
            options={equipment.map(e => ({ value: e.id.toString(), label: e.name }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Scheduled Date"
              type="date"
              value={formData.scheduledDate}
              onChange={v => setFormData({ ...formData, scheduledDate: v })}
              required
            />
            <Select
              label="Priority"
              value={formData.priority}
              onChange={v => setFormData({ ...formData, priority: v })}
              options={[
                { value: 'low', label: '🟢 Low' },
                { value: 'medium', label: '🔵 Medium' },
                { value: 'high', label: '🟠 High' },
                { value: 'critical', label: '🔴 Critical' }
              ]}
            />
          </div>

          <Select
            label="Maintenance Team (Optional)"
            placeholder="Select team..."
            value={formData.maintenanceTeamId}
            onChange={v => setFormData({ ...formData, maintenanceTeamId: v })}
            options={teams.map(t => ({ value: t.id.toString(), label: t.name }))}
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Enter detailed description of the maintenance task..."
            value={formData.description}
            onChange={v => setFormData({ ...formData, description: v })}
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Calendar;
