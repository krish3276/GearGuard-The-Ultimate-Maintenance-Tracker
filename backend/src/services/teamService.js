const { MaintenanceTeam, User, TeamMember } = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/errors');

const getAllTeams = async () => {
  return MaintenanceTeam.findAll({
    include: [{ model: User, as: 'members', through: { attributes: [] } }]
  });
};

const getTeamById = async (id) => {
  const team = await MaintenanceTeam.findByPk(id, {
    include: [{ model: User, as: 'members', through: { attributes: [] } }]
  });
  if (!team) {
    throw new NotFoundError('Team not found');
  }
  return team;
};

const createTeam = async (teamData) => {
  return MaintenanceTeam.create(teamData);
};

const updateTeam = async (id, teamData) => {
  const team = await MaintenanceTeam.findByPk(id);
  if (!team) {
    throw new NotFoundError('Team not found');
  }
  await team.update(teamData);
  return team;
};

const deleteTeam = async (id) => {
  const team = await MaintenanceTeam.findByPk(id);
  if (!team) {
    throw new NotFoundError('Team not found');
  }
  await team.destroy();
  return { message: 'Team deleted successfully' };
};

const addMember = async (teamId, userId) => {
  const team = await MaintenanceTeam.findByPk(teamId);
  if (!team) {
    throw new NotFoundError('Team not found');
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const existingMember = await TeamMember.findOne({
    where: { team_id: teamId, user_id: userId }
  });
  if (existingMember) {
    throw new BadRequestError('User is already a member of this team');
  }

  await TeamMember.create({ team_id: teamId, user_id: userId });
  return getTeamById(teamId);
};

const removeMember = async (teamId, userId) => {
  const member = await TeamMember.findOne({
    where: { team_id: teamId, user_id: userId }
  });
  if (!member) {
    throw new NotFoundError('Member not found in team');
  }

  await member.destroy();
  return { message: 'Member removed from team successfully' };
};

const getTeamMembers = async (teamId) => {
  const team = await MaintenanceTeam.findByPk(teamId, {
    include: [{ model: User, as: 'members', through: { attributes: [] } }]
  });
  if (!team) {
    throw new NotFoundError('Team not found');
  }
  return team.members;
};

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  getTeamMembers
};
