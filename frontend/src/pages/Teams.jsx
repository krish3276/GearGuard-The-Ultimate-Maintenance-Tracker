import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Mail, Wrench, ChevronRight } from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Button, Avatar, Badge, Modal, Input, Textarea } from '../components/common';
import { mockTeams } from '../data/mockData';
import { cn } from '../utils/helpers';

const Teams = () => {
  const [teams, setTeams] = useState(mockTeams);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
  });

  const colors = [
    '#3b82f6', // blue
    '#22c55e', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ];

  const handleOpenModal = (team = null) => {
    if (team) {
      setSelectedTeam(team);
      setFormData({
        name: team.name,
        description: team.description,
        color: team.color,
      });
    } else {
      setSelectedTeam(null);
      setFormData({ name: '', description: '', color: '#3b82f6' });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (selectedTeam) {
      setTeams((prev) =>
        prev.map((t) =>
          t.id === selectedTeam.id ? { ...t, ...formData } : t
        )
      );
    } else {
      const newTeam = {
        id: Date.now(),
        ...formData,
        technicians: [],
      };
      setTeams((prev) => [...prev, newTeam]);
    }
    setShowModal(false);
  };

  return (
    <div>
      <Header title="Maintenance Teams" subtitle="Manage your maintenance teams and technicians" />

      <div className="p-6">
        {/* Actions */}
        <div className="flex justify-end mb-6">
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => handleOpenModal()}>
            Add Team
          </Button>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Link key={team.id} to={`/teams/${team.id}`}>
              <Card hover className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: team.color + '20' }}
                  >
                    <Users className="w-6 h-6" style={{ color: team.color }} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">{team.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{team.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {team.technicians.slice(0, 3).map((tech) => (
                        <Avatar
                          key={tech.id}
                          name={tech.name}
                          size="sm"
                          className="ring-2 ring-white"
                        />
                      ))}
                    </div>
                    {team.technicians.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{team.technicians.length - 3}
                      </span>
                    )}
                  </div>
                  <Badge variant="default">
                    {team.technicians.length} Technician{team.technicians.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {teams.length === 0 && (
          <Card className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
            <p className="text-gray-500 mb-4">Create your first maintenance team to get started</p>
            <Button onClick={() => handleOpenModal()}>Create Team</Button>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedTeam ? 'Edit Team' : 'Create New Team'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {selectedTeam ? 'Save Changes' : 'Create Team'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Team Name"
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
            placeholder="e.g., Electrical Team"
            required
          />
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(v) => setFormData({ ...formData, description: v })}
            placeholder="Describe the team's responsibilities..."
            rows={3}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Color</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={cn(
                    'w-8 h-8 rounded-lg transition-transform',
                    formData.color === color
                      ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                      : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Teams;
