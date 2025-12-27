import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  Wrench,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Button, Badge, SearchInput, Modal, Input, Select, Textarea } from '../components/common';
import { equipmentAPI, teamsAPI } from '../services/api';
import { departments, locations, equipmentStatusColors } from '../data/constants';
import { formatDate, cn } from '../utils/helpers';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    model: '',
    manufacturer: '',
    purchaseDate: '',
    warrantyExpiry: '',
    location: '',
    department: '',
    maintenanceTeamId: '',
    owner: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [equipmentRes, teamsRes] = await Promise.all([
        equipmentAPI.getAll(),
        teamsAPI.getAll(),
      ]);
      setEquipment(equipmentRes.data?.data || equipmentRes.data || []);
      setTeams(teamsRes.data?.data || teamsRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load equipment data');
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department_or_owner?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = !filterDepartment || item.department_or_owner === filterDepartment;
      const matchesStatus = !filterStatus || (item.is_scrapped ? 'offline' : 'operational') === filterStatus;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [equipment, searchTerm, filterDepartment, filterStatus]);

  const resetForm = () => {
    setFormData({
      name: '',
      serialNumber: '',
      model: '',
      manufacturer: '',
      purchaseDate: '',
      warrantyExpiry: '',
      location: '',
      department: '',
      maintenanceTeamId: '',
      owner: '',
      notes: '',
    });
    setSelectedEquipment(null);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setSelectedEquipment(item);
      setFormData({
        name: item.name || '',
        serialNumber: item.serial_number || '',
        model: item.model || '',
        manufacturer: item.manufacturer || '',
        purchaseDate: item.purchase_date || '',
        warrantyExpiry: item.warranty_end || '',
        location: item.location || '',
        department: item.department_or_owner || '',
        maintenanceTeamId: item.maintenance_team_id?.toString() || '',
        owner: item.department_or_owner || '',
        notes: item.notes || '',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        serial_number: formData.serialNumber,
        location: formData.location || undefined,
        department_or_owner: formData.department || formData.owner || undefined,
      };

      if (formData.purchaseDate) payload.purchase_date = formData.purchaseDate;
      if (formData.warrantyExpiry) payload.warranty_end = formData.warrantyExpiry;
      if (formData.maintenanceTeamId) payload.maintenance_team_id = parseInt(formData.maintenanceTeamId);

      if (selectedEquipment) {
        await equipmentAPI.update(selectedEquipment.id, payload);
      } else {
        await equipmentAPI.create(payload);
      }

      await fetchData();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving equipment:', err);
      const message = err.response?.data?.message || err.message || 'Failed to save equipment';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await equipmentAPI.delete(selectedEquipment.id);
      await fetchData();
      setShowDeleteConfirm(false);
      setSelectedEquipment(null);
    } catch (err) {
      console.error('Error deleting equipment:', err);
      const message = err.response?.data?.message || err.message || 'Failed to delete equipment';
      if (err.response?.status === 403) {
        alert('Permission denied. Only administrators can delete equipment.');
      } else if (err.response?.status === 401) {
        alert('Please log in again to perform this action.');
      } else {
        alert(message);
      }
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (item) => {
    const status = item.is_scrapped ? 'offline' : 'operational';
    return (
      <Badge variant={item.is_scrapped ? 'danger' : 'success'}>
        {item.is_scrapped ? 'Scrapped' : 'Operational'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div>
        <Header title="Equipment" subtitle="Manage and monitor all your equipment" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Equipment" subtitle="Manage and monitor all your equipment" />
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
      <Header title="Equipment" subtitle="Manage and monitor all your equipment" />

      <div className="p-6">
        <Card>
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 flex-1">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
                placeholder="Search equipment..."
                className="w-full md:w-80"
              />
              <Button
                variant="secondary"
                leftIcon={<Filter className="w-4 h-4" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </div>
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => handleOpenModal()}>
              Add Equipment
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-dark-900/50 rounded-xl border border-dark-700/50">
              <Select
                value={filterDepartment}
                onChange={setFilterDepartment}
                placeholder="All Departments"
                options={departments.map((d) => ({ value: d, label: d }))}
                className="w-48"
              />
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="All Status"
                options={[
                  { value: 'operational', label: 'Operational' },
                  { value: 'maintenance', label: 'Under Maintenance' },
                  { value: 'offline', label: 'Offline' },
                ]}
                className="w-48"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterDepartment('');
                  setFilterStatus('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th className="table-header">Equipment</th>
                  <th className="table-header">Serial Number</th>
                  <th className="table-header">Location</th>
                  <th className="table-header">Department</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Maintenance Team</th>
                  <th className="table-header">Warranty</th>
                  <th className="table-header text-center">Requests</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/30">
                {filteredEquipment.map((item) => (
                  <tr key={item.id} className="hover:bg-glass-white transition-colors">
                    <td className="table-cell">
                      <div>
                        <Link
                          to={`/equipment/${item.id}`}
                          className="font-medium text-gray-200 hover:text-primary-400 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-gray-500">{item.manufacturer} {item.model}</p>
                      </div>
                    </td>
                    <td className="table-cell font-mono text-sm text-gray-400">{item.serial_number || '-'}</td>
                    <td className="table-cell text-gray-400">{item.location || '-'}</td>
                    <td className="table-cell text-gray-400">{item.department_or_owner || '-'}</td>
                    <td className="table-cell">{getStatusBadge(item)}</td>
                    <td className="table-cell text-gray-400">{item.maintenanceTeam?.name || '-'}</td>
                    <td className="table-cell">
                      <span
                        className={cn(
                          'text-sm',
                          item.warranty_end && new Date(item.warranty_end) < new Date()
                            ? 'text-rose-400'
                            : 'text-gray-400'
                        )}
                      >
                        {item.warranty_end ? formatDate(item.warranty_end) : '-'}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <Link
                        to={`/equipment/${item.id}`}
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-medium transition-colors',
                          (item.openMaintenanceCount || 0) > 0
                            ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                            : 'bg-dark-700/50 text-gray-400 hover:bg-dark-700'
                        )}
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        {item.openMaintenanceCount || 0}
                      </Link>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/equipment/${item.id}`}
                          className="p-2 text-gray-500 hover:text-primary-400 hover:bg-glass-hover rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-gray-500 hover:text-primary-400 hover:bg-glass-hover rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEquipment(item);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredEquipment.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No equipment found matching your criteria</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={selectedEquipment ? 'Edit Equipment' : 'Add New Equipment'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : selectedEquipment ? 'Save Changes' : 'Add Equipment'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Equipment Name"
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
            placeholder="e.g., CNC Milling Machine"
            required
          />
          <Input
            label="Serial Number"
            value={formData.serialNumber}
            onChange={(v) => setFormData({ ...formData, serialNumber: v })}
            placeholder="e.g., CNC-2024-001"
            required
          />
          <Input
            label="Manufacturer"
            value={formData.manufacturer}
            onChange={(v) => setFormData({ ...formData, manufacturer: v })}
            placeholder="e.g., Haas Automation"
          />
          <Input
            label="Model"
            value={formData.model}
            onChange={(v) => setFormData({ ...formData, model: v })}
            placeholder="e.g., VF-2"
          />
          <Input
            label="Purchase Date"
            type="date"
            value={formData.purchaseDate}
            onChange={(v) => setFormData({ ...formData, purchaseDate: v })}
          />
          <Input
            label="Warranty Expiry"
            type="date"
            value={formData.warrantyExpiry}
            onChange={(v) => setFormData({ ...formData, warrantyExpiry: v })}
          />
          <Select
            label="Location"
            value={formData.location}
            onChange={(v) => setFormData({ ...formData, location: v })}
            options={locations.map((l) => ({ value: l, label: l }))}
            placeholder="Select location"
          />
          <Select
            label="Department"
            value={formData.department}
            onChange={(v) => setFormData({ ...formData, department: v })}
            options={departments.map((d) => ({ value: d, label: d }))}
            placeholder="Select department"
          />
          <Select
            label="Maintenance Team"
            value={formData.maintenanceTeamId}
            onChange={(v) => setFormData({ ...formData, maintenanceTeamId: v })}
            options={teams.map((t) => ({ value: t.id.toString(), label: t.name }))}
            placeholder="Assign team"
          />
          <Input
            label="Owner"
            value={formData.owner}
            onChange={(v) => setFormData({ ...formData, owner: v })}
            placeholder="Equipment owner"
          />
          <div className="col-span-2">
            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(v) => setFormData({ ...formData, notes: v })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Equipment"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={saving}>
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-gray-300">
          Are you sure you want to delete <strong className="text-white">{selectedEquipment?.name}</strong>? This action
          cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Equipment;
