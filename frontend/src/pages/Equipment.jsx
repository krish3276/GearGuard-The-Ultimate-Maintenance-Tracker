import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Wrench,
  ChevronDown,
} from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Button, Badge, SearchInput, Modal, Input, Select, Textarea } from '../components/common';
import { mockEquipment, mockTeams, departments, locations, equipmentStatusColors } from '../data/mockData';
import { formatDate, formatStatus, cn } from '../utils/helpers';

const Equipment = () => {
  const [equipment, setEquipment] = useState(mockEquipment);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
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

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.owner.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = !filterDepartment || item.department === filterDepartment;
      const matchesStatus = !filterStatus || item.status === filterStatus;

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
        name: item.name,
        serialNumber: item.serialNumber,
        model: item.model,
        manufacturer: item.manufacturer,
        purchaseDate: item.purchaseDate,
        warrantyExpiry: item.warrantyExpiry,
        location: item.location,
        department: item.department,
        maintenanceTeamId: item.maintenanceTeamId?.toString() || '',
        owner: item.owner,
        notes: item.notes || '',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSave = () => {
    const team = mockTeams.find((t) => t.id === parseInt(formData.maintenanceTeamId));
    
    if (selectedEquipment) {
      // Update existing
      setEquipment((prev) =>
        prev.map((item) =>
          item.id === selectedEquipment.id
            ? {
                ...item,
                ...formData,
                maintenanceTeamId: parseInt(formData.maintenanceTeamId),
                maintenanceTeam: team?.name || '',
              }
            : item
        )
      );
    } else {
      // Create new
      const newEquipment = {
        id: Date.now(),
        ...formData,
        maintenanceTeamId: parseInt(formData.maintenanceTeamId),
        maintenanceTeam: team?.name || '',
        status: 'operational',
        openMaintenanceCount: 0,
      };
      setEquipment((prev) => [...prev, newEquipment]);
    }
    setShowModal(false);
    resetForm();
  };

  const handleDelete = () => {
    setEquipment((prev) => prev.filter((item) => item.id !== selectedEquipment.id));
    setShowDeleteConfirm(false);
    setSelectedEquipment(null);
  };

  const getStatusBadge = (status) => {
    const colors = equipmentStatusColors[status] || equipmentStatusColors.operational;
    return (
      <Badge className={cn(colors.bg, colors.text)}>
        {formatStatus(status)}
      </Badge>
    );
  };

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
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
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
                <tr className="border-b border-gray-200 bg-gray-50">
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
              <tbody className="divide-y divide-gray-100">
                {filteredEquipment.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div>
                        <Link
                          to={`/equipment/${item.id}`}
                          className="font-medium text-gray-900 hover:text-primary-600"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-gray-500">{item.manufacturer} {item.model}</p>
                      </div>
                    </td>
                    <td className="table-cell font-mono text-sm">{item.serialNumber}</td>
                    <td className="table-cell text-gray-600">{item.location}</td>
                    <td className="table-cell text-gray-600">{item.department}</td>
                    <td className="table-cell">{getStatusBadge(item.status)}</td>
                    <td className="table-cell text-gray-600">{item.maintenanceTeam}</td>
                    <td className="table-cell">
                      <span
                        className={cn(
                          'text-sm',
                          new Date(item.warrantyExpiry) < new Date()
                            ? 'text-red-600'
                            : 'text-gray-600'
                        )}
                      >
                        {formatDate(item.warrantyExpiry)}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <Link
                        to={`/equipment/${item.id}`}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium',
                          item.openMaintenanceCount > 0
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        {item.openMaintenanceCount}
                      </Link>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/equipment/${item.id}`}
                          className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEquipment(item);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
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
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {selectedEquipment ? 'Save Changes' : 'Add Equipment'}
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
            options={mockTeams.map((t) => ({ value: t.id.toString(), label: t.name }))}
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
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete <strong>{selectedEquipment?.name}</strong>? This action
          cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Equipment;
