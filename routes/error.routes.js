const express = require('express');
const router = express.Router();

router.get('/403', (req, res) => {
    res.render('error/403')
})

router.get('/404', (req, res) => {
    res.renders('error/404')
})

module.exports = router;