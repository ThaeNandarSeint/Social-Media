const { createGroup, addUsers } = require('../controllers/groupCtrl')
const groupValidator = require('../validators/group/groupValidator')

const router = require('express').Router()

router.post('/', groupValidator, createGroup)
router.put('/:id/addUsers', addUsers)

module.exports = router