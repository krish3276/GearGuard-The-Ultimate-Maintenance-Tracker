const { User, MaintenanceTeam } = require('../models');
const { NotFoundError, ConflictError } = require('../utils/errors');

const getAllUsers = async () => {
  return User.findAll({
    include: [{ model: MaintenanceTeam, as: 'teams' }]
  });
};

const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    include: [{ model: MaintenanceTeam, as: 'teams' }]
  });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};

const createUser = async (userData) => {
  const existingUser = await User.findOne({ where: { email: userData.email } });
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }
  return User.create(userData);
};

const updateUser = async (id, userData) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (userData.email && userData.email !== user.email) {
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }
  }

  await user.update(userData);
  
  // Return updated user with associations
  return getUserById(id);
};

const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  await user.destroy();
  return { message: 'User deleted successfully' };
};

const getTechnicians = async () => {
  return User.findAll({
    where: { role: 'technician' },
    include: [{ model: MaintenanceTeam, as: 'teams' }]
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getTechnicians
};
