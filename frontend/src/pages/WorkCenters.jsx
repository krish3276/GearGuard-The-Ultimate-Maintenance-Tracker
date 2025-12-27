import { useState, useEffect } from 'react';
import { Plus, Factory, Loader2, AlertTriangle, Trash2, Edit2 } from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Button, Badge, Modal, Input, SkeletonTableRow, Skeleton } from '../components/common';
import { workCentersAPI } from '../services/api';

const WorkCenters = () => {
    const [workCenters, setWorkCenters] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedWorkCenter, setSelectedWorkCenter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        tag: '',
        alternative_workcenters: '',
        cost_per_hour: '',
        capacity: '',
        time_efficiency: '',
        oee_target: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await workCentersAPI.getAll();
            setWorkCenters(res.data?.data || res.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching work centers:', err);
            setError('Failed to load work centers');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (workCenter = null) => {
        if (workCenter) {
            setSelectedWorkCenter(workCenter);
            setFormData({
                name: workCenter.name || '',
                code: workCenter.code || '',
                tag: workCenter.tag || '',
                alternative_workcenters: workCenter.alternative_workcenters || '',
                cost_per_hour: workCenter.cost_per_hour?.toString() || '',
                capacity: workCenter.capacity?.toString() || '',
                time_efficiency: workCenter.time_efficiency?.toString() || '',
                oee_target: workCenter.oee_target?.toString() || '',
            });
        } else {
            setSelectedWorkCenter(null);
            setFormData({
                name: '',
                code: '',
                tag: '',
                alternative_workcenters: '',
                cost_per_hour: '',
                capacity: '100',
                time_efficiency: '100',
                oee_target: '85',
            });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            alert('Work center name is required');
            return;
        }
        try {
            setSaving(true);
            const payload = {
                name: formData.name,
                code: formData.code || null,
                tag: formData.tag || null,
                alternative_workcenters: formData.alternative_workcenters || null,
                cost_per_hour: formData.cost_per_hour ? parseFloat(formData.cost_per_hour) : null,
                capacity: formData.capacity ? parseFloat(formData.capacity) : 100,
                time_efficiency: formData.time_efficiency ? parseFloat(formData.time_efficiency) : 100,
                oee_target: formData.oee_target ? parseFloat(formData.oee_target) : 85,
            };
            if (selectedWorkCenter) {
                await workCentersAPI.update(selectedWorkCenter.id, payload);
            } else {
                await workCentersAPI.create(payload);
            }
            await fetchData();
            setShowModal(false);
        } catch (err) {
            console.error('Error saving work center:', err);
            alert(err.response?.data?.message || 'Failed to save work center');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (workCenterId) => {
        if (!confirm('Are you sure you want to delete this work center?')) return;
        try {
            setDeleting(true);
            await workCentersAPI.delete(workCenterId);
            await fetchData();
        } catch (err) {
            console.error('Error deleting work center:', err);
            alert(err.response?.data?.message || 'Failed to delete work center');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div>
                <Header title="Work Centers" subtitle="Manage manufacturing work centers" />
                <div className="p-6">
                    <div className="flex justify-end mb-6">
                        <Skeleton className="h-10 w-36 rounded-xl" />
                    </div>
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-dark-700/50">
                                        {['Work Center', 'Code', 'Tag', 'Alternative', 'Cost/Hour', 'Capacity', 'Efficiency', 'OEE', 'Actions'].map((_, i) => (
                                            <th key={i} className="table-header">
                                                <Skeleton className="h-3 w-16" />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-700/30">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <SkeletonTableRow key={i} cols={9} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Header title="Work Centers" subtitle="Manage manufacturing work centers" />
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
            <Header title="Work Centers" subtitle="Manage manufacturing work centers" />

            <div className="p-6">
                <div className="flex justify-end mb-6">
                    <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => handleOpenModal()}>
                        New Work Center
                    </Button>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-700/50">
                                    <th className="table-header">Work Center</th>
                                    <th className="table-header">Code</th>
                                    <th className="table-header">Tag</th>
                                    <th className="table-header">Alternative Workcenters</th>
                                    <th className="table-header text-right">Cost per Hour</th>
                                    <th className="table-header text-right">Capacity</th>
                                    <th className="table-header text-right">Time Efficiency</th>
                                    <th className="table-header text-right">OEE Target</th>
                                    <th className="table-header text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-700/30">
                                {workCenters.map((wc) => (
                                    <tr key={wc.id} className="hover:bg-glass-white transition-colors">
                                        <td className="table-cell">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-cyan-500/20">
                                                    <Factory className="w-4 h-4 text-cyan-400" />
                                                </div>
                                                <span className="font-medium text-gray-200">{wc.name}</span>
                                            </div>
                                        </td>
                                        <td className="table-cell text-gray-400">{wc.code || '-'}</td>
                                        <td className="table-cell text-gray-400">{wc.tag || '-'}</td>
                                        <td className="table-cell text-gray-400">{wc.alternative_workcenters || '-'}</td>
                                        <td className="table-cell text-right text-gray-400">
                                            {wc.cost_per_hour ? `$${parseFloat(wc.cost_per_hour).toFixed(2)}` : '-'}
                                        </td>
                                        <td className="table-cell text-right text-gray-400">
                                            {wc.capacity ? parseFloat(wc.capacity).toFixed(2) : '-'}
                                        </td>
                                        <td className="table-cell text-right text-gray-400">
                                            {wc.time_efficiency ? `${parseFloat(wc.time_efficiency).toFixed(0)}%` : '-'}
                                        </td>
                                        <td className="table-cell text-right text-gray-400">
                                            {wc.oee_target ? `${parseFloat(wc.oee_target).toFixed(0)}%` : '-'}
                                        </td>
                                        <td className="table-cell text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(wc)}
                                                    className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(wc.id)}
                                                    disabled={deleting}
                                                    className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {workCenters.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No work centers found. Create your first work center.
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedWorkCenter ? 'Edit Work Center' : 'New Work Center'}
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : selectedWorkCenter ? 'Save Changes' : 'Create Work Center'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Work Center Name"
                            value={formData.name}
                            onChange={(v) => setFormData({ ...formData, name: v })}
                            placeholder="e.g., Assembly 1"
                            required
                        />
                        <Input
                            label="Code"
                            value={formData.code}
                            onChange={(v) => setFormData({ ...formData, code: v })}
                            placeholder="e.g., ASM-01"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Tag"
                            value={formData.tag}
                            onChange={(v) => setFormData({ ...formData, tag: v })}
                            placeholder="e.g., Production"
                        />
                        <Input
                            label="Alternative Workcenters"
                            value={formData.alternative_workcenters}
                            onChange={(v) => setFormData({ ...formData, alternative_workcenters: v })}
                            placeholder="e.g., Assembly 2, Drill 1"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Cost per Hour ($)"
                            type="number"
                            value={formData.cost_per_hour}
                            onChange={(v) => setFormData({ ...formData, cost_per_hour: v })}
                            placeholder="1.00"
                        />
                        <Input
                            label="Capacity"
                            type="number"
                            value={formData.capacity}
                            onChange={(v) => setFormData({ ...formData, capacity: v })}
                            placeholder="100.00"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Time Efficiency (%)"
                            type="number"
                            value={formData.time_efficiency}
                            onChange={(v) => setFormData({ ...formData, time_efficiency: v })}
                            placeholder="100"
                        />
                        <Input
                            label="OEE Target (%)"
                            type="number"
                            value={formData.oee_target}
                            onChange={(v) => setFormData({ ...formData, oee_target: v })}
                            placeholder="85"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default WorkCenters;
