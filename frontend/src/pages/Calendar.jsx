import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Wrench,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { Header } from '../components/layout';
import { Card, Button, Badge, Avatar, Modal, Input, Select, Textarea } from '../components/common';
import { mockMaintenanceRequests, mockEquipment, mockTeams } from '../data/mockData';
import { cn, formatDate } from '../utils/helpers';

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [requests, setRequests] = useState(
    mockMaintenanceRequests.filter((r) => r.type === 'preventive' && r.scheduledDate)
  );

  const initialFormData = {
    subject: '',
    description: '',
    equipmentId: '',
    maintenanceTeamId: '',
    assignedTechnicianId: '',
    scheduledDate: '',
    priority: 'medium',
  };

  const [formData, setFormData] = useState(initialFormData);

  // Calendar grid calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = useMemo(() => {
    const days = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const getEventsForDay = (date) => {
    return requests.filter((r) => {
      const eventDate = parseISO(r.scheduledDate);
      return isSameDay(eventDate, date);
    });
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const events = getEventsForDay(date);
    if (events.length > 0) {
      setShowDayModal(true);
    } else {
      // Open create modal with date pre-filled
      setFormData({
        ...formData,
        scheduledDate: format(date, 'yyyy-MM-dd'),
      });
      setShowCreateModal(true);
    }
  };

  const handleEquipmentChange = (equipmentId) => {
    const equipment = mockEquipment.find((e) => e.id === parseInt(equipmentId));
    if (equipment) {
      setFormData({
        ...formData,
        equipmentId,
        maintenanceTeamId: equipment.maintenanceTeamId?.toString() || '',
      });
    } else {
      setFormData({ ...formData, equipmentId, maintenanceTeamId: '' });
    }
  };

  const getTechniciansForTeam = (teamId) => {
    const team = mockTeams.find((t) => t.id === parseInt(teamId));
    return team?.technicians || [];
  };

  const handleCreateMaintenance = () => {
    // Validate required fields
    if (!formData.subject || !formData.equipmentId || !formData.scheduledDate) {
      alert('Please fill in all required fields');
      return;
    }

    const equipment = mockEquipment.find((e) => e.id === parseInt(formData.equipmentId));
    const team = mockTeams.find((t) => t.id === parseInt(formData.maintenanceTeamId));
    const technician = getTechniciansForTeam(formData.maintenanceTeamId).find(
      (t) => t.id === parseInt(formData.assignedTechnicianId)
    );

    const newRequest = {
      id: Date.now(), // Generate unique ID
      subject: formData.subject,
      description: formData.description,
      type: 'preventive',
      status: 'new',
      priority: formData.priority || 'medium',
      equipmentId: parseInt(formData.equipmentId),
      equipmentName: equipment?.name || '',
      maintenanceTeamId: parseInt(formData.maintenanceTeamId) || null,
      maintenanceTeam: team?.name || '',
      assignedTechnicianId: parseInt(formData.assignedTechnicianId) || null,
      assignedTechnician: technician?.name || 'Unassigned',
      createdDate: format(new Date(), 'yyyy-MM-dd'),
      scheduledDate: formData.scheduledDate,
      completedDate: null,
      duration: null,
      isOverdue: false,
    };

    setRequests((prev) => [...prev, newRequest]);
    setFormData(initialFormData);
    setShowCreateModal(false);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Group events by priority for coloring
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-200 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div>
      <Header
        title="Maintenance Calendar"
        subtitle="Schedule and view preventive maintenance"
      />

      <div className="p-6">
        <Card>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <Button variant="secondary" size="sm" onClick={handleToday}>
                Today
              </Button>
            </div>
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setFormData({
                  ...formData,
                  scheduledDate: format(new Date(), 'yyyy-MM-dd'),
                });
                setShowCreateModal(true);
              }}
            >
              Schedule Maintenance
            </Button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-sm font-semibold text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const events = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    'min-h-[120px] p-2 border-b border-r border-gray-100 cursor-pointer',
                    'hover:bg-gray-50 transition-colors',
                    !isCurrentMonth && 'bg-gray-50',
                    today && 'bg-primary-50'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium mb-1',
                      today
                        ? 'bg-primary-600 text-white'
                        : isCurrentMonth
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    )}
                  >
                    {format(day, 'd')}
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {events.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          'text-xs px-2 py-1 rounded truncate',
                          getPriorityColor(event.priority)
                        )}
                        title={event.subject}
                      >
                        {event.subject}
                      </div>
                    ))}
                    {events.length > 3 && (
                      <div className="text-xs text-gray-500 pl-2">
                        +{events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-6">
            <span className="text-sm text-gray-500">Priority:</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gray-200" />
                <span className="text-xs text-gray-600">Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-200" />
                <span className="text-xs text-gray-600">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-200" />
                <span className="text-xs text-gray-600">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-200" />
                <span className="text-xs text-gray-600">Critical</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Upcoming Maintenance Sidebar */}
        <div className="mt-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upcoming Preventive Maintenance
            </h3>
            <div className="space-y-4">
              {requests
                .filter((r) => new Date(r.scheduledDate) >= new Date())
                .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
                .slice(0, 5)
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <CalendarIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{event.subject}</p>
                      <p className="text-sm text-gray-500">{event.equipmentName}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-primary-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(event.scheduledDate)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Avatar name={event.assignedTechnician} size="xs" />
                          <span className="text-xs text-gray-500">
                            {event.assignedTechnician}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        event.priority === 'critical'
                          ? 'danger'
                          : event.priority === 'high'
                          ? 'warning'
                          : 'default'
                      }
                      size="sm"
                    >
                      {event.priority}
                    </Badge>
                  </div>
                ))}
              {requests.filter((r) => new Date(r.scheduledDate) >= new Date()).length ===
                0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No upcoming maintenance scheduled
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Day Events Modal */}
      <Modal
        isOpen={showDayModal}
        onClose={() => setShowDayModal(false)}
        title={selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}
        size="md"
      >
        {selectedDate && (
          <div className="space-y-4">
            {getEventsForDay(selectedDate).map((event) => (
              <div
                key={event.id}
                className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{event.subject}</h4>
                    <p className="text-sm text-gray-500">{event.equipmentName}</p>
                  </div>
                  <Badge
                    variant={
                      event.priority === 'critical'
                        ? 'danger'
                        : event.priority === 'high'
                        ? 'warning'
                        : 'info'
                    }
                  >
                    {event.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Avatar name={event.assignedTechnician} size="xs" />
                    <span className="text-sm text-gray-600">{event.assignedTechnician}</span>
                  </div>
                  <span className="text-sm text-gray-500">{event.maintenanceTeam}</span>
                </div>
              </div>
            ))}
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setShowDayModal(false);
                setFormData({
                  ...formData,
                  scheduledDate: format(selectedDate, 'yyyy-MM-dd'),
                });
                setShowCreateModal(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Maintenance
            </Button>
          </div>
        )}
      </Modal>

      {/* Create Maintenance Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData(initialFormData);
        }}
        title="Schedule Preventive Maintenance"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setShowCreateModal(false);
              setFormData(initialFormData);
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateMaintenance}>
              Schedule
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Subject"
            value={formData.subject}
            onChange={(v) => setFormData({ ...formData, subject: v })}
            placeholder="e.g., Quarterly inspection"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(v) => setFormData({ ...formData, description: v })}
            placeholder="Maintenance details..."
            rows={3}
          />

          <Select
            label="Equipment"
            value={formData.equipmentId}
            onChange={handleEquipmentChange}
            options={mockEquipment.map((e) => ({
              value: e.id.toString(),
              label: `${e.name} (${e.serialNumber})`,
            }))}
            placeholder="Select equipment"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Maintenance Team"
              value={formData.maintenanceTeamId}
              onChange={(v) =>
                setFormData({ ...formData, maintenanceTeamId: v, assignedTechnicianId: '' })
              }
              options={mockTeams.map((t) => ({
                value: t.id.toString(),
                label: t.name,
              }))}
              placeholder="Select team"
            />
            <Select
              label="Assigned Technician"
              value={formData.assignedTechnicianId}
              onChange={(v) => setFormData({ ...formData, assignedTechnicianId: v })}
              options={getTechniciansForTeam(formData.maintenanceTeamId).map((t) => ({
                value: t.id.toString(),
                label: t.name,
              }))}
              placeholder="Select technician"
              disabled={!formData.maintenanceTeamId}
            />
          </div>

          <Input
            label="Scheduled Date"
            type="date"
            value={formData.scheduledDate}
            onChange={(v) => setFormData({ ...formData, scheduledDate: v })}
            required
          />

          <Select
            label="Priority"
            value={formData.priority}
            onChange={(v) => setFormData({ ...formData, priority: v })}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' },
            ]}
            placeholder="Select priority"
          />
        </div>
      </Modal>
    </div>
  );
};

export default Calendar;
