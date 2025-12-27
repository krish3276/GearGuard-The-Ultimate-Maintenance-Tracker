import { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
  parseISO,
  getWeek,
} from 'date-fns';
import { Header } from '../components/layout';
import { Card, Button, Badge, Avatar, Modal, Input, Select, Textarea } from '../components/common';
import { maintenanceAPI, equipmentAPI, teamsAPI } from '../services/api';
import { cn, formatDate } from '../utils/helpers';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [requests, setRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

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
        return isSameDay(parseISO(r.scheduled_date), date);
      } catch {
        return false;
      }
    });
  };

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

  const getPriorityColor = (priority) => ({
    low: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    medium: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    high: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    critical: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  }[priority] || 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30');

  if (loading) {
    return (
      <div>
        <Header title="Maintenance Calendar" subtitle="Schedule preventive maintenance" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Maintenance Calendar" subtitle="Schedule preventive maintenance" />
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
    <div>
      <Header title="Maintenance Calendar" subtitle="Schedule preventive maintenance" />

      <div className="p-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-2 hover:bg-glass-hover rounded-lg">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-2 hover:bg-glass-hover rounded-lg">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
            <span className="ml-4 text-lg font-semibold text-white">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => {
            setFormData({ ...initialFormData, scheduledDate: format(new Date(), 'yyyy-MM-dd') });
            setShowCreateModal(true);
          }}>
            Schedule
          </Button>
        </div>

        {/* Week Grid - Kanban Style */}
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day, idx) => {
            const events = getEventsForDay(day);
            const today = isToday(day);
            return (
              <div key={idx} className={cn(
                'bg-dark-800/50 backdrop-blur-lg rounded-xl border min-h-[400px]',
                today ? 'border-primary-500/50' : 'border-dark-700/50'
              )}>
                {/* Day Header */}
                <div className={cn(
                  'p-3 border-b text-center',
                  today ? 'border-primary-500/30 bg-primary-500/10' : 'border-dark-700/50'
                )}>
                  <div className="text-xs font-medium text-gray-500 uppercase">{format(day, 'EEE')}</div>
                  <div className={cn(
                    'text-xl font-bold mt-1',
                    today ? 'text-primary-400' : 'text-white'
                  )}>{format(day, 'd')}</div>
                </div>

                {/* Events */}
                <div className="p-2 space-y-2">
                  {events.length === 0 ? (
                    <button
                      onClick={() => {
                        setFormData({ ...initialFormData, scheduledDate: format(day, 'yyyy-MM-dd') });
                        setShowCreateModal(true);
                      }}
                      className="w-full p-3 border-2 border-dashed border-dark-600/50 rounded-lg text-gray-600 hover:border-primary-500/50 hover:text-primary-400 transition-all text-xs"
                    >
                      + Add
                    </button>
                  ) : (
                    events.map(event => (
                      <div
                        key={event.id}
                        onClick={() => { setSelectedEvent(event); setShowEventModal(true); }}
                        className={cn(
                          'p-2.5 rounded-lg border cursor-pointer transition-all hover:scale-[1.02]',
                          getPriorityColor(event.priority)
                        )}
                      >
                        <div className="font-medium text-sm truncate">{event.subject}</div>
                        <div className="text-xs opacity-70 truncate mt-1">{event.equipment?.name}</div>
                        <div className="flex items-center gap-1 mt-2">
                          <Avatar name={event.assignedTechnician?.name || 'U'} size="xs" />
                          <span className="text-xs opacity-70 truncate">
                            {event.assignedTechnician?.name || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Modal */}
      <Modal isOpen={showEventModal} onClose={() => setShowEventModal(false)} title="Event Details" size="md">
        {selectedEvent && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{selectedEvent.subject}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-dark-900/50 rounded-xl">
                <p className="text-xs text-gray-500">Equipment</p>
                <p className="text-sm text-gray-200">{selectedEvent.equipment?.name || '-'}</p>
              </div>
              <div className="p-3 bg-dark-900/50 rounded-xl">
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm text-gray-200">{formatDate(selectedEvent.scheduled_date)}</p>
              </div>
              <div className="p-3 bg-dark-900/50 rounded-xl">
                <p className="text-xs text-gray-500">Priority</p>
                <Badge variant={selectedEvent.priority === 'critical' ? 'danger' : 'info'}>{selectedEvent.priority}</Badge>
              </div>
              <div className="p-3 bg-dark-900/50 rounded-xl">
                <p className="text-xs text-gray-500">Assigned</p>
                <p className="text-sm text-gray-200">{selectedEvent.assignedTechnician?.name || 'Unassigned'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setFormData(initialFormData); }}
        title="Schedule Maintenance"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleCreateMaintenance} disabled={saving}>{saving ? 'Saving...' : 'Schedule'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Subject" value={formData.subject} onChange={v => setFormData({ ...formData, subject: v })} required />
          <Select
            label="Equipment"
            value={formData.equipmentId}
            onChange={v => setFormData({ ...formData, equipmentId: v })}
            options={equipment.map(e => ({ value: e.id.toString(), label: e.name }))}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={formData.scheduledDate} onChange={v => setFormData({ ...formData, scheduledDate: v })} required />
            <Select
              label="Priority"
              value={formData.priority}
              onChange={v => setFormData({ ...formData, priority: v })}
              options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }]}
            />
          </div>
          <Textarea label="Description" value={formData.description} onChange={v => setFormData({ ...formData, description: v })} rows={2} />
        </div>
      </Modal>
    </div>
  );
};

export default Calendar;
