const express = require('express');
const router = express.Router();
const {
  saveForLater,
  getSavedForLater,
  removeFromSavedForLater,
  isSaved,
} = require('../controllers/savedForLaterController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/is-saved/:id', authMiddleware, isSaved);
router.post('/:id', authMiddleware, saveForLater);
router.delete('/:id', authMiddleware, removeFromSavedForLater);
router.get('/', authMiddleware, getSavedForLater);

module.exports = router;
