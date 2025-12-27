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
} from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Button, Badge, Avatar, Modal, EmptyState } from '../components/common';
import { equipmentAPI, maintenanceAPI } from '../services/api';
import { formatDate, cn } from '../utils/helpers';

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const equipmentRes = await equipmentAPI.getById(id);
        const equipmentData = equipmentRes.data?.data || equipmentRes.data;
        setEquipment(equipmentData);

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

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await equipmentAPI.delete(id);
      navigate('/equipment');
    } catch (err) {
      console.error('Error deleting equipment:', err);
      const message = err.response?.data?.message || 'Failed to delete equipment';
      if (err.response?.status === 403) {
        alert('Permission denied. Only administrators can delete equipment.');
      } else {
        alert(message);
      }
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
          <EmptyState
            title="Equipment not found"
            description="The equipment you're looking for doesn't exist or has been removed."
            action={
              <Button onClick={() => navigate('/equipment')}>
                Back to Equipment
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    return (
      <Badge variant={equipment.is_scrapped ? 'danger' : 'success'} size="lg">
        {equipment.is_scrapped ? 'Scrapped' : 'Operational'}
      </Badge>
    );
  };

  const getRequestStatusBadge = (status) => {
    const statusKey = status?.toLowerCase().replace(' ', '_') || 'new';
    const variants = {
      new: 'info',
      in_progress: 'warning',
      repaired: 'success',
      scrap: 'danger',
    };
    return <Badge variant={variants[statusKey] || 'default'}>{status || 'New'}</Badge>;
  };

  const isWarrantyExpired = equipment.warranty_end && new Date(equipment.warranty_end) < new Date();
  const openRequests = maintenanceRequests.filter(
    (r) => r.status === 'New' || r.status === 'In Progress'
  );

  const infoItems = [
    { icon: FileText, label: 'Serial Number', value: equipment.serial_number || '-' },
    { icon: Building2, label: 'Manufacturer', value: `${equipment.manufacturer || ''} ${equipment.model || ''}`.trim() || '-' },
    { icon: MapPin, label: 'Location', value: equipment.location || '-' },
    { icon: Building2, label: 'Department', value: equipment.department_or_owner || '-' },
    { icon: Users, label: 'Owner', value: equipment.department_or_owner || '-' },
    { icon: Users, label: 'Maintenance Team', value: equipment.maintenanceTeam?.name || '-' },
    { icon: Calendar, label: 'Purchase Date', value: equipment.purchase_date ? formatDate(equipment.purchase_date) : '-' },
    {
      icon: Shield,
      label: 'Warranty Expiry',
      value: equipment.warranty_end ? formatDate(equipment.warranty_end) : '-',
      alert: isWarrantyExpired,
    },
  ];

  return (
    <div>
      <Header title={equipment.name} subtitle={`${equipment.manufacturer || ''} ${equipment.model || ''}`.trim()} />

      <div className="p-6">
        {/* Back button and actions */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/equipment"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Equipment
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="secondary" leftIcon={<Edit className="w-4 h-4" />}>
              Edit
            </Button>
            <Button
              variant="danger"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setShowDeleteConfirm(true)}
            >
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
                  <div className="w-16 h-16 bg-primary-500/20 rounded-xl flex items-center justify-center">
                    <Wrench className="w-8 h-8 text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{equipment.name}</h2>
                    <p className="text-gray-400">
                      {equipment.manufacturer} {equipment.model}
                    </p>
                  </div>
                </div>
                {getStatusBadge()}
              </div>
            </Card>

            {/* Details Card */}
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Equipment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {infoItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="p-2 bg-dark-900/50 rounded-xl border border-dark-700/50">
                      <item.icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <p
                        className={cn(
                          'text-sm font-medium',
                          item.alert ? 'text-rose-400' : 'text-gray-200'
                        )}
                      >
                        {item.value}
                        {item.alert && (
                          <span className="ml-2 text-xs text-rose-400">(Expired)</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {equipment.notes && (
                <div className="mt-6 pt-6 border-t border-dark-700/50">
                  <h4 className="text-sm font-medium text-gray-200 mb-2">Notes</h4>
                  <p className="text-sm text-gray-400">{equipment.notes}</p>
                </div>
              )}
            </Card>

            {/* Maintenance Requests */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Maintenance Requests</h3>
                <Link
                  to="/maintenance"
                  className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
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
                        {request.isOverdue && (
                          <AlertTriangle className="w-5 h-5 text-rose-400" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-200">{request.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={request.type === 'Preventive' ? 'info' : 'warning'}
                              size="sm"
                            >
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
                <EmptyState
                  icon={Wrench}
                  title="No maintenance requests"
                  description="This equipment has no maintenance history."
                  action={
                    <Link to="/maintenance">
                      <Button size="sm">Create Request</Button>
                    </Link>
                  }
                />
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Maintenance Smart Button */}
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

            {/* Quick Stats */}
            <Card>
              <h3 className="text-sm font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Requests</span>
                  <span className="text-sm font-medium text-gray-200">
                    {maintenanceRequests.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Completed</span>
                  <span className="text-sm font-medium text-emerald-400">
                    {maintenanceRequests.filter((r) => r.status === 'Repaired').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">In Progress</span>
                  <span className="text-sm font-medium text-amber-400">
                    {maintenanceRequests.filter((r) => r.status === 'In Progress').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Overdue</span>
                  <span className="text-sm font-medium text-rose-400">
                    {maintenanceRequests.filter((r) => r.isOverdue).length}
                  </span>
                </div>
              </div>
            </Card>

            {/* Warranty Alert */}
            {isWarrantyExpired && (
              <Card className="bg-rose-500/10 border-rose-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-rose-300">Warranty Expired</h4>
                    <p className="text-sm text-rose-400/80 mt-1">
                      This equipment's warranty expired on {formatDate(equipment.warranty_end)}.
                      Consider reviewing maintenance contracts.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

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
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
            >
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
