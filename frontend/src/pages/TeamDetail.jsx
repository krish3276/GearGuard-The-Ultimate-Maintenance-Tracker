import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Mail, Trash2, User, Loader2, Wrench } from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Button, Avatar, Badge, Modal, EmptyState, Select, SkeletonCard, Skeleton, SkeletonAvatar } from '../components/common';
import { teamsAPI, usersAPI } from '../services/api';

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showAddTechModal, setShowAddTechModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeam();
  }, [id]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await teamsAPI.getById(id);
      const teamData = res.data?.data || res.data;
      setTeam(teamData);

      try {
        const usersRes = await usersAPI.getTechnicians();
        setAvailableUsers(usersRes.data?.data || usersRes.data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching team:', err);
      setError('Team not found');
      setTeam(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTechnician = async () => {
    if (!selectedUserId) return;

    try {
      setSaving(true);
      await teamsAPI.addMember(id, { user_id: parseInt(selectedUserId) });
      await fetchTeam();
      setShowAddTechModal(false);
      setSelectedUserId('');
    } catch (err) {
      console.error('Error adding technician:', err);
      const message = err.response?.data?.message || 'Failed to add technician';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTechnician = async () => {
    if (!selectedTech) return;

    try {
      setSaving(true);
      await teamsAPI.removeMember(id, selectedTech.id);
      await fetchTeam();
      setShowDeleteConfirm(false);
      setSelectedTech(null);
    } catch (err) {
      console.error('Error removing technician:', err);
      const message = err.response?.data?.message || 'Failed to remove technician';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!confirm(`Are you sure you want to delete "${team.name}"? This action cannot be undone.`)) return;
    try {
      setDeletingTeam(true);
      await teamsAPI.delete(id);
      navigate('/teams');
    } catch (err) {
      console.error('Error deleting team:', err);
      alert(err.response?.data?.message || 'Failed to delete team');
    } finally {
      setDeletingTeam(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Loading..." />
        <div className="p-6">
          {/* Back button skeleton */}
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Info Skeleton */}
            <div className="lg:col-span-1">
              <Card>
                <Skeleton className="w-16 h-16 rounded-xl mb-4" />
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-6" />
                <div className="pt-6 border-t border-dark-700/50">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-8 rounded-full" />
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-dark-700/50">
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </Card>
            </div>

            {/* Technicians List Skeleton */}
            <div className="lg:col-span-2">
              <Card>
                <Skeleton className="h-6 w-28 mb-4" />
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-dark-900/50 rounded-xl border border-dark-700/50">
                      <div className="flex items-center gap-4">
                        <SkeletonAvatar size="lg" />
                        <div>
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-48 mb-2" />
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                      </div>
                      <Skeleton className="w-8 h-8 rounded-lg" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div>
        <Header title="Team Not Found" />
        <div className="p-6">
          <EmptyState
            title="Team not found"
            description="The team you're looking for doesn't exist."
            action={
              <Button onClick={() => navigate('/teams')}>
                Back to Teams
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const technicians = team.members || [];

  return (
    <div>
      <Header title={team.name} subtitle={team.description} />

      <div className="p-6">
        {/* Back button */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/teams"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Teams
          </Link>
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddTechModal(true)}
          >
            Add Technician
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Info */}
          <div className="lg:col-span-1">
            <Card>
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: (team.color || '#3b82f6') + '30' }}
              >
                <Wrench className="w-8 h-8" style={{ color: team.color || '#3b82f6' }} />
              </div>
              <h2 className="text-xl font-semibold text-white">{team.name}</h2>
              <p className="text-gray-400 mt-2">{team.description}</p>

              <div className="mt-6 pt-6 border-t border-dark-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Team Members</span>
                  <Badge variant="primary">{technicians.length}</Badge>
                </div>
              </div>

              {/* Delete Team Button */}
              <div className="mt-6 pt-6 border-t border-dark-700/50">
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={handleDeleteTeam}
                  disabled={deletingTeam}
                  leftIcon={deletingTeam ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                >
                  {deletingTeam ? 'Deleting...' : 'Delete Team'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Technicians List */}
          <div className="lg:col-span-2">
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Technicians</h3>

              {technicians.length > 0 ? (
                <div className="space-y-4">
                  {technicians.map((tech) => (
                    <div
                      key={tech.id}
                      className="flex items-center justify-between p-4 bg-dark-900/50 rounded-xl border border-dark-700/50 hover:border-primary-500/30 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar name={tech.name} size="lg" />
                        <div>
                          <p className="font-medium text-gray-200">{tech.name}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              {tech.email}
                            </span>
                          </div>
                          {(tech.specialization || tech.role) && (
                            <Badge variant="info" size="sm" className="mt-2">
                              {tech.specialization || tech.role}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTech(tech);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={User}
                  title="No technicians"
                  description="Add technicians to this team to start assigning maintenance tasks."
                  action={
                    <Button size="sm" onClick={() => setShowAddTechModal(true)}>
                      Add Technician
                    </Button>
                  }
                />
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Add Technician Modal */}
      <Modal
        isOpen={showAddTechModal}
        onClose={() => setShowAddTechModal(false)}
        title="Add Technician"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddTechModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleAddTechnician} disabled={saving || !selectedUserId}>
              {saving ? 'Adding...' : 'Add Technician'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Select Technician"
            value={selectedUserId}
            onChange={setSelectedUserId}
            placeholder="Choose a technician..."
            options={availableUsers.map((u) => ({ value: u.id.toString(), label: `${u.name} (${u.email})` }))}
          />
          {availableUsers.length === 0 && (
            <p className="text-sm text-gray-500">No available technicians found. Create users first.</p>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Remove Technician"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRemoveTechnician} disabled={saving}>
              {saving ? 'Removing...' : 'Remove'}
            </Button>
          </>
        }
      >
        <p className="text-gray-300">
          Are you sure you want to remove <strong className="text-white">{selectedTech?.name}</strong> from this team?
        </p>
      </Modal>
    </div>
  );
};

export default TeamDetail;
