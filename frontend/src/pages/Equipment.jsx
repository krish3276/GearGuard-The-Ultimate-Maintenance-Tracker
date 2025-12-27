import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Button, Badge, SearchInput, Modal, Input, Select, Textarea } from '../components/common';
import { equipmentAPI, teamsAPI, categoriesAPI, usersAPI } from '../services/api';
import { departments, locations } from '../data/constants';
import { formatDate, cn } from '../utils/helpers';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [teams, setTeams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
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
    department: '',
    company: '',
    categoryId: '',
    employeeId: '',
    technicianId: '',
    location: '',
    maintenanceTeamId: '',
    purchaseDate: '',
    warrantyExpiry: '',
    scrapDate: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [equipmentRes, teamsRes, categoriesRes, usersRes] = await Promise.all([
        equipmentAPI.getAll(),
        teamsAPI.getAll(),
        categoriesAPI.getAll().catch(() => ({ data: [] })),
        usersAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setEquipment(equipmentRes.data?.data || equipmentRes.data || []);
      setTeams(teamsRes.data?.data || teamsRes.data || []);
      setCategories(categoriesRes.data?.data || categoriesRes.data || []);
      setUsers(usersRes.data?.data || usersRes.data || []);
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
        item.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.company?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = !filterDepartment || item.department === filterDepartment;
      const matchesCategory = !filterCategory || item.category_id?.toString() === filterCategory;

      return matchesSearch && matchesDepartment && matchesCategory;
    });
  }, [equipment, searchTerm, filterDepartment, filterCategory]);

  const resetForm = () => {
    setFormData({
      name: '',
      serialNumber: '',
      department: '',
      company: '',
      categoryId: '',
      employeeId: '',
      technicianId: '',
      location: '',
      maintenanceTeamId: '',
      purchaseDate: '',
      warrantyExpiry: '',
      scrapDate: '',
      description: '',
    });
    setSelectedEquipment(null);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setSelectedEquipment(item);
      setFormData({
        name: item.name || '',
        serialNumber: item.serial_number || '',
        department: item.department || '',
        company: item.company || '',
        categoryId: item.category_id?.toString() || '',
        employeeId: item.employee_id?.toString() || '',
        technicianId: item.technician_id?.toString() || '',
        location: item.location || '',
        maintenanceTeamId: item.maintenance_team_id?.toString() || '',
        purchaseDate: item.purchase_date || '',
        warrantyExpiry: item.warranty_end || '',
        scrapDate: item.scrap_date || '',
        description: item.description || '',
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
        department: formData.department || null,
        company: formData.company || null,
        location: formData.location || null,
        description: formData.description || null,
      };

      if (formData.categoryId) payload.category_id = parseInt(formData.categoryId);
      if (formData.employeeId) payload.employee_id = parseInt(formData.employeeId);
      if (formData.technicianId) payload.technician_id = parseInt(formData.technicianId);
      if (formData.maintenanceTeamId) payload.maintenance_team_id = parseInt(formData.maintenanceTeamId);
      if (formData.purchaseDate) payload.purchase_date = formData.purchaseDate;
      if (formData.warrantyExpiry) payload.warranty_end = formData.warrantyExpiry;
      if (formData.scrapDate) payload.scrap_date = formData.scrapDate;

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
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.name || '-';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '-';
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
            <div className="flex items-center gap-3">
              <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => handleOpenModal()}>
                New
              </Button>
              <span className="text-lg font-semibold text-white">Equipment</span>
            </div>
            <div className="flex items-center gap-3 flex-1 justify-end">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
                placeholder="Search..."
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
                value={filterCategory}
                onChange={setFilterCategory}
                placeholder="All Categories"
                options={categories.map((c) => ({ value: c.id.toString(), label: c.name }))}
                className="w-48"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterDepartment('');
                  setFilterCategory('');
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
                  <th className="table-header">Equipment Name</th>
                  <th className="table-header">Employee</th>
                  <th className="table-header">Department</th>
                  <th className="table-header">Serial Number</th>
                  <th className="table-header">Technician</th>
                  <th className="table-header">Equipment Category</th>
                  <th className="table-header">Company</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/30">
                {filteredEquipment.map((item) => (
                  <tr key={item.id} className="hover:bg-glass-white transition-colors">
                    <td className="table-cell">
                      <Link
                        to={`/equipment/${item.id}`}
                        className="font-medium text-gray-200 hover:text-primary-400 transition-colors"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="table-cell text-gray-400">
                      {item.employee?.name || getUserName(item.employee_id)}
                    </td>
                    <td className="table-cell text-gray-400">{item.department || '-'}</td>
                    <td className="table-cell font-mono text-sm text-gray-400">{item.serial_number || '-'}</td>
                    <td className="table-cell text-gray-400">
                      {item.technician?.name || getUserName(item.technician_id)}
                    </td>
                    <td className="table-cell">
                      {(item.category?.name || item.category_id) ? (
                        <Link
                          to={`/equipment-categories?highlight=${item.category_id || ''}`}
                          className="text-primary-400 hover:text-primary-300 hover:underline transition-colors"
                        >
                          {item.category?.name || getCategoryName(item.category_id)}
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="table-cell text-gray-400">{item.company || '-'}</td>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Equipment Name"
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
            placeholder="e.g., Samsung Monitor 15'"
            required
          />
          <Input
            label="Serial Number"
            value={formData.serialNumber}
            onChange={(v) => setFormData({ ...formData, serialNumber: v })}
            placeholder="e.g., MT/125/22778837"
            required
          />
          <Select
            label="Employee"
            value={formData.employeeId}
            onChange={(v) => setFormData({ ...formData, employeeId: v })}
            options={users.map((u) => ({ value: u.id.toString(), label: u.name }))}
            placeholder="Select employee"
          />
          <Select
            label="Technician"
            value={formData.technicianId}
            onChange={(v) => setFormData({ ...formData, technicianId: v })}
            options={users.filter(u => u.role === 'technician' || u.role === 'admin').map((u) => ({ value: u.id.toString(), label: u.name }))}
            placeholder="Select technician"
          />
          <Select
            label="Department"
            value={formData.department}
            onChange={(v) => setFormData({ ...formData, department: v })}
            options={departments.map((d) => ({ value: d, label: d }))}
            placeholder="Select department"
          />
          <Select
            label="Equipment Category"
            value={formData.categoryId}
            onChange={(v) => setFormData({ ...formData, categoryId: v })}
            options={categories.map((c) => ({ value: c.id.toString(), label: c.name }))}
            placeholder="Select category"
          />
          <Input
            label="Company"
            value={formData.company}
            onChange={(v) => setFormData({ ...formData, company: v })}
            placeholder="e.g., My Company (San Francisco)"
          />
          <Select
            label="Location"
            value={formData.location}
            onChange={(v) => setFormData({ ...formData, location: v })}
            options={locations.map((l) => ({ value: l, label: l }))}
            placeholder="Select location"
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
          <Input
            label="Scrap Date"
            type="date"
            value={formData.scrapDate}
            onChange={(v) => setFormData({ ...formData, scrapDate: v })}
          />
          <Select
            label="Maintenance Team"
            value={formData.maintenanceTeamId}
            onChange={(v) => setFormData({ ...formData, maintenanceTeamId: v })}
            options={teams.map((t) => ({ value: t.id.toString(), label: t.name }))}
            placeholder="Assign team"
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(v) => setFormData({ ...formData, description: v })}
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
