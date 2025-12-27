import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Wrench,
  Calendar,
  MapPin,
  Building2,
  Users,
  FileText,
  Shield,
  Clock,
  AlertTriangle,
  Loader2,
  FolderTree,
  Factory,
  User,
  Building,
} from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Button, Badge, Avatar, Modal, Input, Select, Textarea } from '../components/common';
import { equipmentAPI, maintenanceAPI, teamsAPI, categoriesAPI, usersAPI } from '../services/api';
import { departments, locations } from '../data/constants';
import { formatDate, cn } from '../utils/helpers';

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [teams, setTeams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [equipmentRes, teamsRes, categoriesRes, usersRes] = await Promise.all([
        equipmentAPI.getById(id),
        teamsAPI.getAll().catch(() => ({ data: [] })),
        categoriesAPI.getAll().catch(() => ({ data: [] })),
        usersAPI.getAll().catch(() => ({ data: [] })),
      ]);

      const equipmentData = equipmentRes.data?.data || equipmentRes.data;
      setEquipment(equipmentData);
      setTeams(teamsRes.data?.data || teamsRes.data || []);
      setCategories(categoriesRes.data?.data || categoriesRes.data || []);
      setUsers(usersRes.data?.data || usersRes.data || []);

      try {
        const requestsRes = await maintenanceAPI.getByEquipment(id);
        const requestsData = requestsRes.data?.data || requestsRes.data || [];
        setMaintenanceRequests(requestsData);
      } catch (reqErr) {
        console.error('Error fetching maintenance requests:', reqErr);
        setMaintenanceRequests([]);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError('Equipment not found');
      setEquipment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = () => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        serialNumber: equipment.serial_number || '',
        department: equipment.department || '',
        company: equipment.company || '',
        categoryId: equipment.category_id?.toString() || '',
        employeeId: equipment.employee_id?.toString() || '',
        technicianId: equipment.technician_id?.toString() || '',
        location: equipment.location || '',
        maintenanceTeamId: equipment.maintenance_team_id?.toString() || '',
        purchaseDate: equipment.purchase_date || '',
        warrantyExpiry: equipment.warranty_end || '',
        scrapDate: equipment.scrap_date || '',
        description: equipment.description || '',
      });
      setShowEditModal(true);
    }
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

      await equipmentAPI.update(id, payload);
      await fetchData();
      setShowEditModal(false);
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
      setDeleting(true);
      await equipmentAPI.delete(id);
      navigate('/equipment');
    } catch (err) {
      console.error('Error deleting equipment:', err);
      const message = err.response?.data?.message || 'Failed to delete equipment';
      alert(message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Loading..." />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div>
        <Header title="Equipment Not Found" />
        <div className="p-6">
          <Card className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Equipment not found</h2>
            <p className="text-gray-400 mb-6">The equipment you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/equipment')}>Back to Equipment</Button>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => (
    <Badge variant={equipment.is_scrapped ? 'danger' : 'success'} size="lg">
      {equipment.is_scrapped ? 'Scrapped' : 'Operational'}
    </Badge>
  );

  const getRequestStatusBadge = (status) => {
    const statusKey = status?.toLowerCase().replace(' ', '_') || 'new';
    const variants = { new: 'info', in_progress: 'warning', repaired: 'success', scrap: 'danger' };
    return <Badge variant={variants[statusKey] || 'default'}>{status || 'New'}</Badge>;
  };

  const isWarrantyExpired = equipment.warranty_end && new Date(equipment.warranty_end) < new Date();
  const openRequests = maintenanceRequests.filter(r => r.status === 'New' || r.status === 'In Progress');

  const infoItems = [
    { icon: FileText, label: 'Serial Number', value: equipment.serial_number || '-' },
    { icon: FolderTree, label: 'Category', value: equipment.category?.name || '-', link: equipment.category_id ? `/equipment-categories?highlight=${equipment.category_id}` : null },
    { icon: User, label: 'Employee', value: equipment.employee?.name || '-' },
    { icon: Wrench, label: 'Technician', value: equipment.technician?.name || '-' },
    { icon: Building2, label: 'Department', value: equipment.department || '-' },
    { icon: Building, label: 'Company', value: equipment.company || '-' },
    { icon: MapPin, label: 'Location', value: equipment.location || '-' },
    { icon: Factory, label: 'Work Center', value: equipment.workCenter?.name || '-' },
    { icon: Users, label: 'Maintenance Team', value: equipment.maintenanceTeam?.name || '-' },
    { icon: Calendar, label: 'Purchase Date', value: equipment.purchase_date ? formatDate(equipment.purchase_date) : '-' },
    { icon: Shield, label: 'Warranty Expiry', value: equipment.warranty_end ? formatDate(equipment.warranty_end) : '-', alert: isWarrantyExpired },
    { icon: AlertTriangle, label: 'Scrap Date', value: equipment.scrap_date ? formatDate(equipment.scrap_date) : '-' },
  ];

  return (
    <div>
      <Header title={equipment.name} subtitle={equipment.category?.name || equipment.company || 'Equipment Details'} />

      <div className="p-6">
        {/* Back button and actions */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/equipment" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Equipment
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="secondary" leftIcon={<Edit className="w-4 h-4" />} onClick={handleOpenEdit}>
              Edit
            </Button>
            <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Wrench className="w-8 h-8 text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{equipment.name}</h2>
                    <p className="text-gray-400">{equipment.serial_number}</p>
                  </div>
                </div>
                {getStatusBadge()}
              </div>
            </Card>

            {/* Details Card */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Equipment Details</h3>
                <Button variant="ghost" size="sm" leftIcon={<Edit className="w-4 h-4" />} onClick={handleOpenEdit}>
                  Edit Details
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {infoItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 bg-dark-900/30 rounded-xl">
                    <div className="p-2 bg-dark-800/50 rounded-lg border border-dark-700/50">
                      <item.icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
                      {item.link ? (
                        <Link to={item.link} className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">
                          {item.value}
                        </Link>
                      ) : (
                        <p className={cn('text-sm font-medium truncate', item.alert ? 'text-rose-400' : 'text-gray-200')}>
                          {item.value}
                          {item.alert && <span className="ml-1 text-xs">(Expired)</span>}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {equipment.description && (
                <div className="mt-6 pt-6 border-t border-dark-700/50">
                  <h4 className="text-sm font-medium text-gray-200 mb-2">Description</h4>
                  <p className="text-sm text-gray-400">{equipment.description}</p>
                </div>
              )}
            </Card>

            {/* Maintenance Requests */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Maintenance History</h3>
                <Link to="/maintenance" className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">
                  View all →
                </Link>
              </div>

              {maintenanceRequests.length > 0 ? (
                <div className="space-y-3">
                  {maintenanceRequests.map((request) => (
                    <div
                      key={request.id}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-xl border transition-all duration-200',
                        request.isOverdue
                          ? 'border-rose-500/30 bg-rose-500/10'
                          : 'border-dark-700/50 bg-dark-900/50 hover:border-primary-500/30'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {request.isOverdue && <AlertTriangle className="w-5 h-5 text-rose-400" />}
                        <div>
                          <p className="text-sm font-medium text-gray-200">{request.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={request.type === 'Preventive' ? 'info' : 'warning'} size="sm">
                              {request.type}
                            </Badge>
                            {request.scheduled_date && (
                              <span className="text-xs text-gray-500">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {formatDate(request.scheduled_date)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Avatar name={request.assignedTechnician?.name || 'Unassigned'} size="sm" />
                        {getRequestStatusBadge(request.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wrench className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">No maintenance history</p>
                  <Link to="/maintenance">
                    <Button size="sm">Create Request</Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-primary-600 to-cyan-600 border-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-primary-100 text-sm">Open Requests</p>
                  <p className="text-3xl font-bold text-white">{openRequests.length}</p>
                </div>
              </div>
              <Link
                to="/maintenance"
                className="mt-4 block w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-center font-medium text-white transition-colors"
              >
                View Maintenance
              </Link>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Requests</span>
                  <span className="text-sm font-medium text-gray-200">{maintenanceRequests.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Completed</span>
                  <span className="text-sm font-medium text-emerald-400">
                    {maintenanceRequests.filter(r => r.status === 'Repaired').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">In Progress</span>
                  <span className="text-sm font-medium text-amber-400">
                    {maintenanceRequests.filter(r => r.status === 'In Progress').length}
                  </span>
                </div>
              </div>
            </Card>

            {isWarrantyExpired && (
              <Card className="bg-rose-500/10 border-rose-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-rose-300">Warranty Expired</h4>
                    <p className="text-sm text-rose-400/80 mt-1">
                      Expired on {formatDate(equipment.warranty_end)}. Consider reviewing maintenance contracts.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Equipment"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
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
          <div className="col-span-2">
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(v) => setFormData({ ...formData, description: v })}
              placeholder="Additional notes about this equipment..."
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
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-gray-300">
          Are you sure you want to delete <strong className="text-white">{equipment.name}</strong>? This will also remove
          all associated maintenance records. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default EquipmentDetail;
