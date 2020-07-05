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

// controller
const { getUsers, getProfileById, createUser, formCreateUser, updateProfile, deleteUser, getAccountById, updateAccount, getAccount, getProfile, editAccount, editProfile } = require('./../controllers/user.controller')
const { getAllAduan, getAduan, tanggapAduan, deleteAduan } = require('./../controllers/aduan_lapor.controller');
const { getAduanKehilangan, validasiAdminAduan, getAduanKehilangan2, validasiSatpamAduan } = require('./../controllers/aduan_hilang.controller')
const { getAllKunci, renderFormTambah, tambahKunci, renderFormEdit, updateKunci, deleteKunci } = require('./../controllers/kunci.controller');
const { validasiPinjamKunci, tolakPinjamKunci, validasiKembaliKunci } = require('./../controllers/peminjaman_kunci.controller');

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
router.post('/edit_account', editAccount)
router.post('/edit_profile', upload.single('foto_user'), editProfile);

// aduan lapor
router.get('/aduan_lapor', getAllAduan);
router.get('/aduan_lapor/:id/edit_aduan', getAduan);
router.post('/aduan_lapor/:id/edit_aduan', tanggapAduan);
router.get('/aduan_lapor/delete_aduan/:id', deleteAduan);

// manajemen user
router.get('/manajemen_user', getUsers);
router.get('/manajemen_user/tambah', formCreateUser);
router.post('/manajemen_user/tambah', upload.single('foto_user'), createUser);
router.get('/manajemen_user/edit/:id', getProfileById);
router.post('/manajemen_user/edit/:id', updateProfile)
router.get('/manajemen_user/edit/credentials/:id', getAccountById);
router.post('/manajemen_user/edit/:id', updateAccount);
router.delete('/manajemen_user/delete/:id', deleteUser);

//CRUD Kunci
router.get('/pinjam_kunci/daftar_kunci', getAllKunci);
router.get('/pinjam_kunci/tambah_kunci/form', renderFormTambah)
router.post('/pinjam_kunci/tambah_kunci', tambahKunci);
router.get('/pinjam_kunci/edit_kunci/:id', renderFormEdit)
router.post('/pinjam_kunci/edit_kunci/:id', updateKunci)
router.get('/pinjam_kunci/delete_kunci/:id', deleteKunci);

// Validasi Pinjam Kunci
router.get('/pinjam_kunci/validasi_pinjam_kunci', async (req, res) => {
    const peminjaman_kunci = await Peminjaman_Kunci.findAll({
        where: {
            status_peminjaman: 'menunggu validasi'
        },
        include: [
            { model: Kunci }, { model: User }
        ]
    });

    res.render('admin/pinjam_kunci/validasi_pinjam_kunci', {
        peminjaman_kunci, success: req.flash('success'),
        failed: req.flash('failed'),
        foto_user: req.user.foto_user,
        nama_user: req.user.nama_user
    })
});
router.get('/pinjam_kunci/validasi_pinjam_kunci/:id', validasiPinjamKunci);
router.get('/pinjam_kunci/tolak_pinjam_kunci/:id', tolakPinjamKunci);

// Validasi pengembalian kunci
router.get('/pinjam_kunci/validasi_kembali_kunci', async (req, res) => {
    const now = moment().format('dddd, DD MMMM YYYY');
    const peminjaman_kunci = await Peminjaman_Kunci.findAll({
        order: [['status_peminjaman', 'DESC'], ['tanggal_pinjam', 'DESC']],
        // where: { 'tanggal_pinjam': now },
        include: [{ model: Kunci }, { model: User }],
        limit: 10
    });
    console.log(now)
    res.render('admin/pinjam_kunci/validasi_kembali_kunci', {
        peminjaman_kunci,
        success: req.flash('success'),
        foto_user: req.user.foto_user,
        nama_user: req.user.nama_user
    })
});
router.get('/pinjam_kunci/validasi_kembali_kunci/:id', validasiKembaliKunci);

// Aduan Hilang
router.get('/aduan_hilang/validasi_admin', getAduanKehilangan2);
router.get('/aduan_hilang/validasi_admin/:id', validasiAdminAduan);
router.get('/aduan_hilang/validasi_satpam', getAduanKehilangan)
router.get('/aduan_hilang/validasi_satpam/:id', validasiSatpamAduan);


module.exports = router;
