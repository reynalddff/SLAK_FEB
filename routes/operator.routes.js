const express = require('express');
const router = express.Router();
const { Aduan_Lapor, User, Komentar } = require('./../models')

//middleware auth
const check = require('./../middlewares/rolePermission');
// upload multer
const { upload } = require('./../config/multer');

// controller
const { getAduanByTujuan, getAduan, tanggapAduan } = require('./../controllers/aduan_lapor.controller');
const { findKomentarByAduan } = require('./../controllers/komentar.controller');
const { getProfile, getAccount, editAccount, editProfile } = require('./../controllers/user.controller');

router.use(check.isOperator, check.isLoggedIn)

// dashboard
router.get('/', async (req, res, next) => {
    const aduans = await Aduan_Lapor.findAll({
        include: [
            { model: User }
        ],
        where: {
            tujuan_aduan: req.user.RoleId
        }
    })
    res.render('operator/dashboard', {
        aduans,
        nama_user: req.user.nama_user,
        foto_user: req.user.foto_user
    })
});

// edit profile
router.get('/edit_profile', getProfile);
router.get('/edit_account', getAccount);
router.post('/edit_profile', upload.single('foto_user'), editProfile);
router.post('/edit_account', editAccount);

router.get('/aduan_lapor', getAduanByTujuan);
router.get('/aduan_lapor/:id/edit_aduan', getAduan);
router.post('/aduan_lapor/:id/edit_aduan', tanggapAduan)

// komentar
router.get('/komentar/:id', findKomentarByAduan)

module.exports = router;
