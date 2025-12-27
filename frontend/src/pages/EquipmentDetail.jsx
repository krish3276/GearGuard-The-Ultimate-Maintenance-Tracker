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
} from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Button, Badge, Avatar, Modal, EmptyState } from '../components/common';
import { mockEquipment, mockMaintenanceRequests, equipmentStatusColors, statusColors } from '../data/mockData';
import { formatDate, formatStatus, cn } from '../utils/helpers';

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    // Find equipment by ID
    const found = mockEquipment.find((e) => e.id === parseInt(id));
    setEquipment(found);

    // Get maintenance requests for this equipment
    if (found) {
      const requests = mockMaintenanceRequests.filter(
        (r) => r.equipmentId === found.id
      );
      setMaintenanceRequests(requests);
    }
  }, [id]);

  if (!equipment) {
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

  const getStatusBadge = (status) => {
    const colors = equipmentStatusColors[status] || equipmentStatusColors.operational;
    return (
      <Badge className={cn(colors.bg, colors.text)} size="lg">
        {formatStatus(status)}
      </Badge>
    );
  };

  const getRequestStatusBadge = (status) => {
    const colors = statusColors[status] || statusColors.new;
    return (
      <Badge className={cn(colors.bg, colors.text)}>
        {formatStatus(status)}
      </Badge>
    );
  };

  const isWarrantyExpired = new Date(equipment.warrantyExpiry) < new Date();
  const openRequests = maintenanceRequests.filter(
    (r) => r.status === 'new' || r.status === 'in_progress'
  );

  const infoItems = [
    { icon: FileText, label: 'Serial Number', value: equipment.serialNumber },
    { icon: Building2, label: 'Manufacturer', value: `${equipment.manufacturer} ${equipment.model}` },
    { icon: MapPin, label: 'Location', value: equipment.location },
    { icon: Building2, label: 'Department', value: equipment.department },
    { icon: Users, label: 'Owner', value: equipment.owner },
    { icon: Users, label: 'Maintenance Team', value: equipment.maintenanceTeam },
    { icon: Calendar, label: 'Purchase Date', value: formatDate(equipment.purchaseDate) },
    {
      icon: Shield,
      label: 'Warranty Expiry',
      value: formatDate(equipment.warrantyExpiry),
      alert: isWarrantyExpired,
    },
  ];

  return (
    <div>
      <Header title={equipment.name} subtitle={`${equipment.manufacturer} ${equipment.model}`} />

      <div className="p-6">
        {/* Back button and actions */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/equipment"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
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
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Wrench className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{equipment.name}</h2>
                    <p className="text-gray-500">
                      {equipment.manufacturer} {equipment.model}
                    </p>
                  </div>
                </div>
                {getStatusBadge(equipment.status)}
              </div>
            </Card>

            {/* Details Card */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {infoItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <item.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <p
                        className={cn(
                          'text-sm font-medium',
                          item.alert ? 'text-red-600' : 'text-gray-900'
                        )}
                      >
                        {item.value}
                        {item.alert && (
                          <span className="ml-2 text-xs text-red-500">(Expired)</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {equipment.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{equipment.notes}</p>
                </div>
              )}
            </Card>

            {/* Maintenance Requests */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Maintenance Requests</h3>
                <Link
                  to="/maintenance"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
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
                        'flex items-center justify-between p-4 rounded-lg border',
                        request.isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {request.isOverdue && (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{request.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={request.type === 'preventive' ? 'info' : 'warning'}
                              size="sm"
                            >
                              {request.type}
                            </Badge>
                            {request.scheduledDate && (
                              <span className="text-xs text-gray-500">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {formatDate(request.scheduledDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Avatar name={request.assignedTechnician} size="sm" />
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
            <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-primary-100 text-sm">Open Requests</p>
                  <p className="text-3xl font-bold">{openRequests.length}</p>
                </div>
              </div>
              <Link
                to="/maintenance"
                className="mt-4 block w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-center font-medium transition-colors"
              >
                View Maintenance
              </Link>
            </Card>

            {/* Quick Stats */}
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Requests</span>
                  <span className="text-sm font-medium text-gray-900">
                    {maintenanceRequests.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Completed</span>
                  <span className="text-sm font-medium text-green-600">
                    {maintenanceRequests.filter((r) => r.status === 'repaired').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">In Progress</span>
                  <span className="text-sm font-medium text-amber-600">
                    {maintenanceRequests.filter((r) => r.status === 'in_progress').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Overdue</span>
                  <span className="text-sm font-medium text-red-600">
                    {maintenanceRequests.filter((r) => r.isOverdue).length}
                  </span>
                </div>
              </div>
            </Card>

            {/* Warranty Alert */}
            {isWarrantyExpired && (
              <Card className="bg-red-50 border-red-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Warranty Expired</h4>
                    <p className="text-sm text-red-600 mt-1">
                      This equipment's warranty expired on {formatDate(equipment.warrantyExpiry)}.
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
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                // Delete logic here
                navigate('/equipment');
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete <strong>{equipment.name}</strong>? This will also remove
          all associated maintenance records. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default EquipmentDetail;
