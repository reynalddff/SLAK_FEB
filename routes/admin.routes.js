const express = require('express');
const router = express.Router();
const moment = require('moment')
const Op = require("sequelize").Op;

// models
const { Aduan_Lapor, User, Komentar, Kunci, Peminjaman_Kunci } = require('./../models');
//middleware auth
const check = require('./../middlewares/rolePermission')
// upload multer
const { upload } = require('./../config/multer');

const { getUsers, getProfileById, createUser, formCreateUser, updateProfile, deleteUser, getAccountById, updateAccount, getAccount, getProfile, editAccount, editProfile } = require('./../controllers/user.controller')
const { getAllAduan, getAduan, tanggapAduan, deleteAduan } = require('./../controllers/aduan_lapor.controller');
const { getAduanKehilangan, validasiAdminAduan } = require('./../controllers/aduan_hilang.controller')

router.use(check.isLoggedIn, check.isAdmin)

// dashboard
router.get('/', async (req, res, next) => {
    const aduans = await Aduan_Lapor.findAll({
        include: [{ model: User }, { model: Komentar }],
        where: {
            status_aduan: 'belum'
        },
        order: [
            ['status_aduan', 'ASC'],
            ['createdAt', 'ASC']
        ],
        limit: 5
    });
    const peminjaman_kunci = await Peminjaman_Kunci.findAll({
        include: [{ model: Kunci }, { model: User }],
        order: [['tanggal_pinjam', 'DESC']],
        limit: 5
    });
    const { count } = await User.findAndCountAll({
        where: {
            id: {
                [Op.not]: req.user.id
            }
        }
    })
    res.render('admin/dashboard', {
        nama_user: req.user.nama_user,
        aduans,
        peminjaman_kunci,
        tanggal_pinjam: moment(peminjaman_kunci.tanggal_pinjam).format('dddd, DD MMMM YYYY'),
        user: count,
        foto_user: req.user.foto_user
    })
});

// Edit Profile
router.get('/edit_profile', getProfile);
router.get('/edit_account', getAccount);
router.post('/edit_profile', editAccount);
router.post('/edit_account', upload.single('foto_user'), editProfile)

// aduan lapor
router.get('/aduan_lapor', getAllAduan);
router.get('/aduan_lapor/:id/edit_aduan', getAduan);
router.post('/aduan_lapor/:id/edit_aduan', tanggapAduan);
router.get('/aduan_lapor/delete_aduan/:id', deleteAduan);

// router.get('/aduan_lapor/komentar', (req, res) => { res.render('admin/aduan_lapor/aduan_lapor_komentar') });

// manajemen user
router.get('/manajemen_user', getUsers);

router.get('/manajemen_user/tambah', formCreateUser);
router.post('/manajemen_user/tambah', upload.single('foto_user'), createUser);

router.get('/manajemen_user/edit/:id', getProfileById);
router.post('/manajemen_user/edit/:id', updateProfile)

router.get('/manajemen_user/edit/credentials/:id', getAccountById);
router.post('/manajemen_user/edit/:id', updateAccount);

router.delete('/manajemen_user/delete/:id', deleteUser);

//Kunci

// Aduan Hilang
router.get('/aduan_hilang', getAduanKehilangan);
router.get('/aduan_hilang/validasi/:id', validasiAdminAduan);


module.exports = router;
