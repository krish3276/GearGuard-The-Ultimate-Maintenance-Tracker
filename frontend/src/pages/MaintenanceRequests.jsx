import { useState, useEffect } from 'react';
import {
  Plus,
  LayoutGrid,
  List,
  Filter,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  X,
  GripVertical,
  Loader2,
} from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Button, Badge, Avatar, Modal, Input, Select, Textarea, SearchInput } from '../components/common';
import { maintenanceAPI, equipmentAPI, teamsAPI, usersAPI } from '../services/api';
import { statusColors, priorityColors } from '../data/constants';
import { formatDate, formatStatus, cn } from '../utils/helpers';

const MaintenanceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [teams, setTeams] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [viewMode, setViewMode] = useState('kanban');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedCard, setDraggedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    type: 'corrective',
    priority: 'medium',
    equipmentId: '',
    maintenanceTeamId: '',
    assignedTechnicianId: '',
    scheduledDate: '',
  });

  const columns = [
    { id: 'New', title: 'New', color: 'bg-indigo-500' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-amber-500' },
    { id: 'Repaired', title: 'Repaired', color: 'bg-green-500' },
    { id: 'Scrap', title: 'Scrap', color: 'bg-red-500' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, equipmentRes, teamsRes, techniciansRes] = await Promise.all([
        maintenanceAPI.getAll(),
        equipmentAPI.getAll(),
        teamsAPI.getAll(),
        usersAPI.getTechnicians().catch(() => ({ data: [] })),
      ]);

      setRequests(requestsRes.data?.data || requestsRes.data || []);
      setEquipment(equipmentRes.data?.data || equipmentRes.data || []);
      setTeams(teamsRes.data?.data || teamsRes.data || []);
      setTechnicians(techniciansRes.data?.data || techniciansRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getColumnRequests = (status) => {
    return requests.filter((r) => {
      const matchesStatus = r.status === status;
      const matchesSearch =
        !searchTerm ||
        r.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.equipmentName || r.Equipment?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  };

  const handleDragStart = (e, request) => {
    setDraggedCard(request);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedCard(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedCard && draggedCard.status !== newStatus) {
      try {
        await maintenanceAPI.updateStatus(draggedCard.id, newStatus);
        setRequests((prev) =>
          prev.map((r) =>
            r.id === draggedCard.id ? { ...r, status: newStatus } : r
          )
        );
      } catch (err) {
        console.error('Error updating status:', err);
      }
    }
  };

  const handleEquipmentChange = (equipmentId) => {
    const equip = equipment.find((e) => e.id === parseInt(equipmentId));
    if (equip) {
      setFormData({
        ...formData,
        equipmentId,
        maintenanceTeamId: equip.maintenance_team_id?.toString() || '',
      });
    } else {
      setFormData({ ...formData, equipmentId, maintenanceTeamId: '' });
    }
  };

  const getTechniciansForTeam = (teamId) => {
    const team = teams.find((t) => t.id === parseInt(teamId));
    return team?.members || team?.Users || technicians.filter(t => t.team_id === parseInt(teamId)) || [];
  };

  const handleCreateRequest = async () => {
    try {
      setSaving(true);
      const payload = {
        subject: formData.subject,
        type: formData.type === 'corrective' ? 'Corrective' : 'Preventive',
        equipment_id: parseInt(formData.equipmentId),
      };

      // Only include optional fields if they have values
      if (formData.description) payload.description = formData.description;
      if (formData.priority) payload.priority = formData.priority;
      if (formData.maintenanceTeamId) payload.maintenance_team_id = parseInt(formData.maintenanceTeamId);
      if (formData.assignedTechnicianId) payload.assigned_technician_id = parseInt(formData.assignedTechnicianId);
      if (formData.scheduledDate) payload.scheduled_date = formData.scheduledDate;

      await maintenanceAPI.create(payload);
      await fetchData();
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Error creating request:', err);
      const message = err.response?.data?.message || 'Failed to create request';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      description: '',
      type: 'corrective',
      priority: 'medium',
      equipmentId: '',
      maintenanceTeamId: '',
      assignedTechnicianId: '',
      scheduledDate: '',
    });
  };

  const handleCardClick = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await maintenanceAPI.updateStatus(requestId, newStatus);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
              ...r,
              status: newStatus,
              completedDate:
                newStatus === 'repaired' ? new Date().toISOString().split('T')[0] : r.completedDate,
            }
            : r
        )
      );
      if (selectedRequest?.id === requestId) {
        setSelectedRequest((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error updating status:', err);
      const message = err.response?.data?.message || 'Failed to update status';
      alert(message);
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = priorityColors[priority] || priorityColors.medium;
    return (
      <Badge className={cn(colors.bg, colors.text)} size="sm">
        {priority}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const statusKey = status?.toLowerCase().replace(' ', '_') || 'new';
    const colors = statusColors[statusKey] || statusColors.new;
    return (
      <Badge className={cn(colors.bg, colors.text)}>
        {status || 'New'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div>
        <Header title="Maintenance Requests" subtitle="Track and manage all maintenance work orders" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Maintenance Requests" subtitle="Track and manage all maintenance work orders" />
        <div className="p-6">
          <Card className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchData}>Retry</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Maintenance Requests"
        subtitle="Track and manage all maintenance work orders"
      />

      <div className="p-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Search requests..."
              className="w-64"
            />
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'kanban'
                    ? 'bg-white shadow-sm text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
            New Request
          </Button>
        </div>

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="flex gap-6 overflow-x-auto pb-6">
            {columns.map((column) => (
              <div
                key={column.id}
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full', column.color)} />
                    <h3 className="font-semibold text-gray-900">{column.title}</h3>
                    <Badge variant="default" size="sm">
                      {getColumnRequests(column.id).length}
                    </Badge>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {getColumnRequests(column.id).map((request) => (
                    <div
                      key={request.id}
                      className={cn(
                        'kanban-card',
                        request.isOverdue && 'border-l-4 border-l-red-500'
                      )}
                      draggable
                      onDragStart={(e) => handleDragStart(e, request)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleCardClick(request)}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {request.subject}
                        </h4>
                        {request.isOverdue && (
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                      </div>

                      {/* Equipment */}
                      <p className="text-xs text-gray-500 mb-3">{request.equipment?.name || '-'}</p>

                      {/* Meta */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={request.type === 'preventive' ? 'info' : 'warning'}
                            size="sm"
                          >
                            {request.type}
                          </Badge>
                          {getPriorityBadge(request.priority)}
                        </div>
                        <Avatar name={request.assignedTechnician?.name || request.maintenanceTeam?.name || 'Unassigned'} size="xs" />
                      </div>

                      {/* Scheduled Date */}
                      {request.scheduledDate && (
                        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(request.scheduled_date)}
                        </div>
                      )}
                    </div>
                  ))}

                  {getColumnRequests(column.id).length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No requests
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="table-header">Subject</th>
                    <th className="table-header">Equipment</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Priority</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Assigned</th>
                    <th className="table-header">Scheduled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests
                    .filter(
                      (r) =>
                        !searchTerm ||
                        r.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (r.equipment?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((request) => (
                      <tr
                        key={request.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleCardClick(request)}
                      >
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            {request.isOverdue && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="font-medium">{request.subject}</span>
                          </div>
                        </td>
                        <td className="table-cell text-gray-600">{request.equipment?.name || '-'}</td>
                        <td className="table-cell">
                          <Badge
                            variant={request.type === 'Preventive' ? 'info' : 'warning'}
                            size="sm"
                          >
                            {request.type}
                          </Badge>
                        </td>
                        <td className="table-cell">{getPriorityBadge(request.priority || 'medium')}</td>
                        <td className="table-cell">{getStatusBadge(request.status)}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <Avatar name={request.assignedTechnician?.name || 'Unassigned'} size="xs" />
                            <span className="text-sm">{request.assignedTechnician?.name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="table-cell text-gray-600">
                          {request.scheduled_date ? formatDate(request.scheduled_date) : '-'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {requests.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No maintenance requests found
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Create Request Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create Maintenance Request"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreateRequest} disabled={saving}>
              {saving ? 'Creating...' : 'Create Request'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Request Type"
              value={formData.type}
              onChange={(v) => setFormData({ ...formData, type: v })}
              options={[
                { value: 'corrective', label: 'Corrective' },
                { value: 'preventive', label: 'Preventive' },
              ]}
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
              required
            />
          </div>

          <Input
            label="Subject"
            value={formData.subject}
            onChange={(v) => setFormData({ ...formData, subject: v })}
            placeholder="Brief description of the issue"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(v) => setFormData({ ...formData, description: v })}
            placeholder="Detailed description of the maintenance request..."
            rows={3}
          />

          <Select
            label="Equipment"
            value={formData.equipmentId}
            onChange={handleEquipmentChange}
            options={equipment.map((e) => ({
              value: e.id.toString(),
              label: `${e.name} (${e.serial_number || 'No S/N'})`,
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
              options={teams.map((t) => ({
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

          {formData.type === 'preventive' && (
            <Input
              label="Scheduled Date"
              type="date"
              value={formData.scheduledDate}
              onChange={(v) => setFormData({ ...formData, scheduledDate: v })}
            />
          )}
        </div>
      </Modal>

      {/* Request Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Request Details"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedRequest.subject}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedRequest.equipment?.name || '-'}
                </p>
              </div>
              {getStatusBadge(selectedRequest.status)}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Type</p>
                <Badge
                  variant={selectedRequest.type === 'Preventive' ? 'info' : 'warning'}
                >
                  {selectedRequest.type}
                </Badge>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                {getPriorityBadge(selectedRequest.priority || 'medium')}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Assigned Team</p>
                <p className="text-sm font-medium">{selectedRequest.maintenanceTeam?.name || '-'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Assigned Technician</p>
                <div className="flex items-center gap-2">
                  <Avatar name={selectedRequest.assignedTechnician?.name || 'Unassigned'} size="xs" />
                  <span className="text-sm font-medium">
                    {selectedRequest.assignedTechnician?.name || 'Unassigned'}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Created Date</p>
                <p className="text-sm font-medium">
                  {formatDate(selectedRequest.created_at)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Scheduled Date</p>
                <p className="text-sm font-medium">
                  {selectedRequest.scheduled_date
                    ? formatDate(selectedRequest.scheduled_date)
                    : '-'}
                </p>
              </div>
            </div>

            {/* Description */}
            {selectedRequest.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{selectedRequest.description}</p>
              </div>
            )}

            {/* Status Update */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Update Status</h4>
              <div className="flex flex-wrap gap-2">
                {columns.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => handleUpdateStatus(selectedRequest.id, col.id)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      selectedRequest.status === col.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {col.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration (for completed) */}
            {selectedRequest.status === 'repaired' && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Work Duration</h4>
                <Input
                  type="number"
                  placeholder="Hours spent"
                  value={selectedRequest.duration || ''}
                  onChange={() => { }}
                  className="w-32"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MaintenanceRequests;
