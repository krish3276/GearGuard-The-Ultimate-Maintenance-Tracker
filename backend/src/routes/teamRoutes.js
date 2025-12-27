const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/auth');
const { teamValidation, idParam } = require('../middleware/validation');

router.use(protect);

router
  .route('/')
  .get(teamController.getAllTeams)
  .post(authorize('admin', 'manager'), teamValidation.create, teamController.createTeam);

router
  .route('/:id')
  .get(idParam, teamController.getTeamById)
  .put(idParam, authorize('admin', 'manager'), teamValidation.update, teamController.updateTeam)
  .delete(idParam, authorize('admin'), teamController.deleteTeam);

router.get('/:id/members', idParam, teamController.getTeamMembers);
router.post('/:id/members', idParam, authorize('admin', 'manager'), teamValidation.addMember, teamController.addMember);
router.delete('/:id/members/:userId', idParam, authorize('admin', 'manager'), teamController.removeMember);

module.exports = router;
