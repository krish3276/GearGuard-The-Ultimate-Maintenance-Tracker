const teamService = require('../services/teamService');

const getAllTeams = async (req, res, next) => {
  try {
    const teams = await teamService.getAllTeams();
    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    next(error);
  }
};

const getTeamById = async (req, res, next) => {
  try {
    const team = await teamService.getTeamById(req.params.id);
    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

const createTeam = async (req, res, next) => {
  try {
    const team = await teamService.createTeam(req.body);
    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

const updateTeam = async (req, res, next) => {
  try {
    const team = await teamService.updateTeam(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

const deleteTeam = async (req, res, next) => {
  try {
    const result = await teamService.deleteTeam(req.params.id);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const team = await teamService.addMember(req.params.id, req.body.user_id);
    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const result = await teamService.removeMember(req.params.id, req.params.userId);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getTeamMembers = async (req, res, next) => {
  try {
    const members = await teamService.getTeamMembers(req.params.id);
    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    next(error);
  }
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
