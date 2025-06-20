const express = require('express');
const router = express.Router();
const {
  createContact,
  closeContact,
  getAllContacts,
  getContactById,
} = require('../controllers/contactController');
const userMiddleware = require('../middleware/optionalAuthmiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/', userMiddleware, createContact);
router.patch(
  '/:id/close',
  authMiddleware,
  roleMiddleware(['admin']),
  closeContact
);
router.get('/', authMiddleware, roleMiddleware(['admin']), getAllContacts);
router.get('/:id', authMiddleware, roleMiddleware(['admin']), getContactById);

module.exports = router;
