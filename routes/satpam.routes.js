const express = require('express');
const router = express.Router();
const moment = require('moment')
const Op = require("sequelize").Op;

// models
const { Role, Peminjaman_Kunci, Kunci, User, Aduan_Hilang } = require('./../models');

// middleware auth
const check = require('./../middlewares/rolePermission');
// Upload multer
const { upload } = require('./../config/multer');

// controller
const { getAllKunci, renderFormTambah, tambahKunci, renderFormEdit, updateKunci, deleteKunci } = require('./../controllers/kunci.controller');
const { validasiPinjamKunci, tolakPinjamKunci, validasiKembaliKunci } = require('./../controllers/peminjaman_kunci.controller');
const { getProfile, getAccount, editAccount, editProfile } = require('./../controllers/user.controller');
const { getAduanKehilangan, validasiSatpamAduan } = require('./../controllers/aduan_hilang.controller')

router.use(check.isSatpam, check.isLoggedIn);

router.get('/', async (req, res) => {
    const peminjaman_kunci = await Peminjaman_Kunci.findAll({
        where: { status_peminjaman: 'menunggu validasi' },
        include: [{ model: Kunci }, { model: User }],
        limit: 5
    })
    res.render('satpam/dashboard', { peminjaman_kunci, foto_user: req.user.foto_user })
});

// edit profile
router.get('/edit_profile', getProfile);
router.get('/edit_account', getAccount);
router.post('/edit_profile', upload.single('foto_user'), editProfile);
router.post('/edit_account', editAccount);

// CRUD Kunci
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

    res.render('satpam/pinjam_kunci/validasi_pinjam_kunci', { peminjaman_kunci, success: req.flash('success'), failed: req.flash('failed'), foto_user: req.user.foto_user })
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
    res.render('satpam/pinjam_kunci/validasi_kembali_kunci', { peminjaman_kunci, success: req.flash('success'), foto_user: req.user.foto_user })
});
router.get('/pinjam_kunci/validasi_kembali_kunci/:id', validasiKembaliKunci);


// Aduan Hilang
router.get('/aduan_hilang', getAduanKehilangan);
router.get('/aduan_hilang/validasi/:id', validasiSatpamAduan);


module.exports = router;