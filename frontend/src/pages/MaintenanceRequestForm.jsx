import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    ClipboardList,
    Calendar,
    Clock,
    User,
    Building2,
    Wrench,
    Users,
    FileText,
    AlertTriangle,
    Loader2,
    ChevronRight,
    Star,
} from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Button, Badge, Input, Select, Textarea, Modal } from '../components/common';
import { maintenanceAPI, equipmentAPI, teamsAPI, usersAPI } from '../services/api';
import { formatDate, cn } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const MaintenanceRequestForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEditMode = !!id;

    // Data states
    const [equipment, setEquipment] = useState([]);
    const [teams, setTeams] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        type: 'Corrective',
        priority: 'medium',
        equipmentId: '',
        maintenanceTeamId: '',
        assignedTechnicianId: '',
        scheduledDate: '',
        duration: '',
        company: '',
        instructions: '',
        worksheetNotes: '',
    });

    // Derived equipment info (auto-filled)
    const [equipmentInfo, setEquipmentInfo] = useState({
        category: '',
        team: '',
        technician: '',
    });

    // Current status
    const [currentStatus, setCurrentStatus] = useState('New');

    // UI states
    const [activeTab, setActiveTab] = useState('notes');
    const [showWorksheetModal, setShowWorksheetModal] = useState(false);

    const stages = [
        { id: 'New', label: 'New', color: 'from-indigo-500 to-purple-500', icon: FileText },
        { id: 'In Progress', label: 'In Progress', color: 'from-amber-500 to-orange-500', icon: Clock },
        { id: 'Repaired', label: 'Repaired', color: 'from-emerald-500 to-green-500', icon: Wrench },
        { id: 'Scrap', label: 'Scrap', color: 'from-rose-500 to-red-500', icon: AlertTriangle },
    ];

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [equipmentRes, teamsRes, techniciansRes] = await Promise.all([
                equipmentAPI.getAll(),
                teamsAPI.getAll(),
                usersAPI.getTechnicians().catch(() => ({ data: [] })),
            ]);

            setEquipment(equipmentRes.data?.data || equipmentRes.data || []);
            setTeams(teamsRes.data?.data || teamsRes.data || []);
            setTechnicians(techniciansRes.data?.data || techniciansRes.data || []);

            if (isEditMode) {
                const requestRes = await maintenanceAPI.getById(id);
                const request = requestRes.data?.data || requestRes.data;
                if (request) {
                    setFormData({
                        subject: request.subject || '',
                        description: request.description || '',
                        type: request.type || 'Corrective',
                        priority: request.priority || 'medium',
                        equipmentId: request.equipment_id?.toString() || '',
                        maintenanceTeamId: request.maintenance_team_id?.toString() || '',
                        assignedTechnicianId: request.assigned_technician_id?.toString() || '',
                        scheduledDate: request.scheduled_date?.split('T')[0] || '',
                        duration: request.duration?.toString() || '',
                        company: request.company || request.equipment?.company || '',
                        instructions: request.instructions || '',
                        worksheetNotes: request.worksheet_notes || '',
                    });
                    setCurrentStatus(request.status || 'New');

                    // Set equipment info if equipment exists
                    if (request.equipment) {
                        setEquipmentInfo({
                            category: request.equipment.category?.name || '',
                            team: request.equipment.maintenanceTeam?.name || '',
                            technician: request.equipment.technician?.name || '',
                        });
                    }
                }
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleEquipmentChange = (equipmentId) => {
        const equip = equipment.find((e) => e.id === parseInt(equipmentId));
        if (equip) {
            setFormData({
                ...formData,
                equipmentId,
                maintenanceTeamId: equip.maintenance_team_id?.toString() || formData.maintenanceTeamId,
                assignedTechnicianId: equip.technician_id?.toString() || formData.assignedTechnicianId,
                company: equip.company || formData.company,
            });
            setEquipmentInfo({
                category: equip.category?.name || '',
                team: equip.maintenanceTeam?.name || '',
                technician: equip.technician?.name || '',
            });
        } else {
            setFormData({ ...formData, equipmentId });
            setEquipmentInfo({ category: '', team: '', technician: '' });
        }
    };

    const getTechniciansForTeam = (teamId) => {
        const team = teams.find((t) => t.id === parseInt(teamId));
        return team?.members || team?.Users || technicians.filter(t => t.team_id === parseInt(teamId)) || technicians;
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);
            const payload = {
                subject: formData.subject,
                type: formData.type,
                equipment_id: parseInt(formData.equipmentId),
            };

            if (formData.description) payload.description = formData.description;
            if (formData.priority) payload.priority = formData.priority;
            if (formData.maintenanceTeamId) payload.maintenance_team_id = parseInt(formData.maintenanceTeamId);
            if (formData.assignedTechnicianId) payload.assigned_technician_id = parseInt(formData.assignedTechnicianId);
            if (formData.scheduledDate) payload.scheduled_date = formData.scheduledDate;
            if (formData.duration) payload.duration = parseFloat(formData.duration);
            if (formData.instructions) payload.instructions = formData.instructions;
            if (formData.worksheetNotes) payload.worksheet_notes = formData.worksheetNotes;

            if (isEditMode) {
                await maintenanceAPI.update(id, payload);
            } else {
                await maintenanceAPI.create(payload);
            }

            navigate('/maintenance');
        } catch (err) {
            console.error('Error saving request:', err);
            const message = err.response?.data?.message || 'Failed to save request';
            alert(message);
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!isEditMode) return;

        // Valid transitions based on backend rules
        const validTransitions = {
            'New': ['In Progress'],
            'In Progress': ['Repaired', 'Scrap'],
            'Repaired': [],
            'Scrap': []
        };

        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            return;
        }

        try {
            await maintenanceAPI.updateStatus(id, newStatus);
            setCurrentStatus(newStatus);

            // If marking as Scrap, the backend should handle marking equipment as unusable
            if (newStatus === 'Scrap') {
                // Optionally show a notification about equipment being marked as unusable
            }
        } catch (err) {
            console.error('Error updating status:', err);
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const getStageIndex = (status) => stages.findIndex(s => s.id === status);
    const currentStageIndex = getStageIndex(currentStatus);

    const canTransitionTo = (status) => {
        if (!isEditMode) return false;
        const validTransitions = {
            'New': ['In Progress'],
            'In Progress': ['Repaired', 'Scrap'],
            'Repaired': [],
            'Scrap': []
        };
        return validTransitions[currentStatus]?.includes(status);
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'text-gray-400',
            medium: 'text-amber-400',
            high: 'text-orange-400',
            critical: 'text-rose-400',
        };
        return colors[priority] || colors.medium;
    };

    if (loading) {
        return (
            <div>
                <Header title={isEditMode ? 'Edit Maintenance Request' : 'New Maintenance Request'} />
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Header title="Error" />
                <div className="p-6">
                    <Card className="text-center py-12">
                        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                        <p className="text-rose-400 mb-4">{error}</p>
                        <Button onClick={() => navigate('/maintenance')}>Back to Maintenance</Button>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header
                title={isEditMode ? formData.subject || 'Maintenance Request' : 'New Maintenance Request'}
                subtitle={isEditMode ? `Request #${id}` : 'Create a new maintenance request'}
            />

            <div className="p-4 md:p-6">
                {/* Back button and actions */}
                <div className="flex items-center justify-between mb-6">
                    <Link to="/maintenance" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Maintenance Requests
                    </Link>
                    <div className="flex items-center gap-3">
                        {/* Worksheet Smart Button */}
                        <Button
                            variant="secondary"
                            leftIcon={<ClipboardList className="w-4 h-4" />}
                            onClick={() => setShowWorksheetModal(true)}
                        >
                            Worksheet
                        </Button>
                        <Button
                            leftIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            onClick={handleSubmit}
                            disabled={saving || !formData.subject || !formData.equipmentId}
                        >
                            {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Request'}
                        </Button>
                    </div>
                </div>

                {/* Stage Indicator */}
                <Card className="mb-6">
                    <div className="flex items-center justify-between">
                        {stages.map((stage, index) => {
                            const StageIcon = stage.icon;
                            const isActive = stage.id === currentStatus;
                            const isPast = index < currentStageIndex;
                            const canClick = canTransitionTo(stage.id);

                            return (
                                <div key={stage.id} className="flex items-center flex-1">
                                    <button
                                        onClick={() => canClick && handleStatusChange(stage.id)}
                                        disabled={!canClick}
                                        className={cn(
                                            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full',
                                            isActive && `bg-gradient-to-r ${stage.color} shadow-glow-sm`,
                                            isPast && 'bg-dark-700/50',
                                            !isActive && !isPast && 'bg-dark-800/30',
                                            canClick && 'cursor-pointer hover:scale-105',
                                            !canClick && 'cursor-default'
                                        )}
                                    >
                                        <div className={cn(
                                            'w-10 h-10 rounded-full flex items-center justify-center',
                                            isActive ? 'bg-white/20' : isPast ? 'bg-dark-600' : 'bg-dark-700/50'
                                        )}>
                                            <StageIcon className={cn(
                                                'w-5 h-5',
                                                isActive ? 'text-white' : isPast ? 'text-gray-400' : 'text-gray-600'
                                            )} />
                                        </div>
                                        <div className="text-left">
                                            <p className={cn(
                                                'text-sm font-semibold',
                                                isActive ? 'text-white' : isPast ? 'text-gray-300' : 'text-gray-500'
                                            )}>
                                                {stage.label}
                                            </p>
                                            {isActive && (
                                                <p className="text-xs text-white/70">Current Stage</p>
                                            )}
                                        </div>
                                    </button>
                                    {index < stages.length - 1 && (
                                        <ChevronRight className={cn(
                                            'w-5 h-5 mx-2 flex-shrink-0',
                                            index < currentStageIndex ? 'text-gray-400' : 'text-gray-600'
                                        )} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Two-Column Form Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Left Column */}
                    <Card>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary-400" />
                            Request Details
                        </h3>
                        <div className="space-y-4">
                            <Input
                                label="Subject"
                                value={formData.subject}
                                onChange={(v) => setFormData({ ...formData, subject: v })}
                                placeholder="Brief description of the issue"
                                required
                            />

                            <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700/50">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Created By</p>
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-200">{user?.name || 'Current User'}</span>
                                </div>
                            </div>

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

                            {/* Auto-filled Equipment Info */}
                            {formData.equipmentId && (
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 bg-dark-900/30 rounded-xl border border-dark-700/30">
                                        <p className="text-xs text-gray-500 mb-1">Category</p>
                                        <p className="text-sm font-medium text-primary-400">{equipmentInfo.category || '-'}</p>
                                    </div>
                                    <div className="p-3 bg-dark-900/30 rounded-xl border border-dark-700/30">
                                        <p className="text-xs text-gray-500 mb-1">Team</p>
                                        <p className="text-sm font-medium text-cyan-400">{equipmentInfo.team || '-'}</p>
                                    </div>
                                    <div className="p-3 bg-dark-900/30 rounded-xl border border-dark-700/30">
                                        <p className="text-xs text-gray-500 mb-1">Technician</p>
                                        <p className="text-sm font-medium text-emerald-400">{equipmentInfo.technician || '-'}</p>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700/50">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Request Date</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-200">
                                        {formatDate(new Date().toISOString())}
                                    </span>
                                </div>
                            </div>

                            <Select
                                label="Maintenance Type"
                                value={formData.type}
                                onChange={(v) => setFormData({ ...formData, type: v })}
                                options={[
                                    { value: 'Corrective', label: 'Corrective' },
                                    { value: 'Preventive', label: 'Preventive' },
                                ]}
                                required
                            />

                            {formData.type === 'Preventive' && (
                                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                                    <p className="text-xs text-cyan-300 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Preventive requests automatically appear in the Calendar
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Right Column */}
                    <Card>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-cyan-400" />
                            Assignment & Schedule
                        </h3>
                        <div className="space-y-4">
                            <Select
                                label="Maintenance Team"
                                value={formData.maintenanceTeamId}
                                onChange={(v) => setFormData({ ...formData, maintenanceTeamId: v, assignedTechnicianId: '' })}
                                options={teams.map((t) => ({
                                    value: t.id.toString(),
                                    label: t.name,
                                }))}
                                placeholder="Select team"
                            />

                            <Select
                                label="Technician"
                                value={formData.assignedTechnicianId}
                                onChange={(v) => setFormData({ ...formData, assignedTechnicianId: v })}
                                options={getTechniciansForTeam(formData.maintenanceTeamId).map((t) => ({
                                    value: t.id.toString(),
                                    label: t.name,
                                }))}
                                placeholder="Select technician"
                                disabled={!formData.maintenanceTeamId && technicians.length === 0}
                            />

                            <Input
                                label="Scheduled Date"
                                type="date"
                                value={formData.scheduledDate}
                                onChange={(v) => setFormData({ ...formData, scheduledDate: v })}
                            />

                            <Input
                                label="Duration (hours)"
                                type="number"
                                value={formData.duration}
                                onChange={(v) => setFormData({ ...formData, duration: v })}
                                placeholder="Estimated hours"
                                min="0"
                                step="0.5"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">Priority</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['low', 'medium', 'high', 'critical'].map((priority) => (
                                        <button
                                            key={priority}
                                            onClick={() => setFormData({ ...formData, priority })}
                                            className={cn(
                                                'px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 capitalize',
                                                'border flex items-center justify-center gap-1',
                                                formData.priority === priority
                                                    ? priority === 'critical'
                                                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                                                        : priority === 'high'
                                                            ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                                                            : priority === 'medium'
                                                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                                                : 'bg-gray-500/20 border-gray-500/50 text-gray-300'
                                                    : 'bg-dark-800/50 border-dark-700/50 text-gray-500 hover:border-dark-600'
                                            )}
                                        >
                                            {priority === 'critical' && <Star className="w-3 h-3" />}
                                            {priority}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Input
                                label="Company"
                                value={formData.company}
                                onChange={(v) => setFormData({ ...formData, company: v })}
                                placeholder="Company name"
                            />
                        </div>
                    </Card>
                </div>

                {/* Tabs Section */}
                <Card>
                    {/* Tab Headers */}
                    <div className="flex items-center gap-1 mb-4 p-1 bg-dark-900/50 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                activeTab === 'notes'
                                    ? 'bg-primary-500/20 text-primary-300 shadow-glow-sm'
                                    : 'text-gray-500 hover:text-gray-300'
                            )}
                        >
                            Notes
                        </button>
                        <button
                            onClick={() => setActiveTab('instructions')}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                activeTab === 'instructions'
                                    ? 'bg-primary-500/20 text-primary-300 shadow-glow-sm'
                                    : 'text-gray-500 hover:text-gray-300'
                            )}
                        >
                            Instructions
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'notes' && (
                        <Textarea
                            label="Description & Notes"
                            value={formData.description}
                            onChange={(v) => setFormData({ ...formData, description: v })}
                            placeholder="Detailed description of the maintenance request, observations, and any relevant notes..."
                            rows={6}
                        />
                    )}

                    {activeTab === 'instructions' && (
                        <Textarea
                            label="Work Instructions"
                            value={formData.instructions}
                            onChange={(v) => setFormData({ ...formData, instructions: v })}
                            placeholder="Step-by-step instructions for performing the maintenance work..."
                            rows={6}
                        />
                    )}
                </Card>

                {/* Scrap Warning */}
                {currentStatus === 'Scrap' && (
                    <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-rose-300">Equipment Marked as Unusable</h4>
                                <p className="text-sm text-rose-400/80 mt-1">
                                    This request has been moved to Scrap status. The associated equipment has been marked as unusable
                                    and should be removed from active service.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Worksheet Modal */}
            <Modal
                isOpen={showWorksheetModal}
                onClose={() => setShowWorksheetModal(false)}
                title="Technician Worksheet"
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowWorksheetModal(false)}>
                            Close
                        </Button>
                        <Button onClick={() => setShowWorksheetModal(false)}>
                            Save Notes
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700/50">
                        <h4 className="text-sm font-medium text-gray-200 mb-2">Request Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Subject:</span>
                                <span className="ml-2 text-gray-200">{formData.subject || '-'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Equipment:</span>
                                <span className="ml-2 text-gray-200">
                                    {equipment.find(e => e.id === parseInt(formData.equipmentId))?.name || '-'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Type:</span>
                                <Badge variant={formData.type === 'Preventive' ? 'info' : 'warning'} size="sm">
                                    {formData.type}
                                </Badge>
                            </div>
                            <div>
                                <span className="text-gray-500">Priority:</span>
                                <span className={cn('ml-2 font-medium capitalize', getPriorityColor(formData.priority))}>
                                    {formData.priority}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Textarea
                        label="Technician Notes"
                        value={formData.worksheetNotes}
                        onChange={(v) => setFormData({ ...formData, worksheetNotes: v })}
                        placeholder="Record your observations, work performed, parts used, and any issues encountered..."
                        rows={8}
                    />

                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                        <p className="text-xs text-cyan-300">
                            💡 Tip: Document all work performed, parts replaced, and any follow-up actions needed.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MaintenanceRequestForm;
