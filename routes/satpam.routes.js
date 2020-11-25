const express = require('express');
const router = express.Router();
const moment = require('moment');
const Op = require('sequelize').Op;

// models
const {
  Role,
  Data_Peminjaman,
  Detail_Peminjaman,
  Kunci,
  User,
  Aduan_Hilang,
  Notifications,
} = require('./../models');

// middleware auth
const check = require('./../middlewares/rolePermission');
// Upload multer
const { upload } = require('./../config/multer');

// controller
const {
  getAllKunci,
  renderFormTambah,
  tambahKunci,
  renderFormEdit,
  updateKunci,
  deleteKunci,
} = require('./../controllers/kunci.controller');
const {
  validasiPinjamKunci,
  tolakPinjamKunci,
  validasiKembaliKunci,
} = require('./../controllers/peminjaman_kunci.controller');
const {
  getProfile,
  getAccount,
  editAccount,
  editProfile,
} = require('./../controllers/user.controller');
const {
  getAduanKehilangan,
  validasiSatpamAduan,
  getPrintAduan,
} = require('./../controllers/aduan_hilang.controller');

router.use(check.isSatpam, check.isLoggedIn);

router.get('/', async (req, res) => {
  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: '7',
    },
    order: [['createdAt', 'DESC']],
  });

  const totalKunci = await Kunci.findAndCountAll({});
  const kunciDipinjam = await Detail_Peminjaman.findAndCountAll({
    where: {
      status: 'dipinjam',
    },
  });

  const totalAduanKehilangan = await Aduan_Hilang.findAndCountAll({});
  const aduanKehilanganBelum = await Aduan_Hilang.findAndCountAll({
    where: {
      status_aduan: [
        'menunggu validasi satpam',
        'menunggu validasi admin / kasubbag',
      ],
    },
  });

  let tahun = req.query.tahun; //|| new Date().getFullYear().toString();
  let bulan = req.query.bulan; //|| new Date().getMonth() + 1;
  if (bulan) {
    if (bulan.length > 2) {
      bulan = '0' + bulan;
    }
  }

  if (tahun) {
    if (tahun === 'semua') {
      const allAduanHilang = await Aduan_Hilang.findAll({});

      const allAduanHilangBelum = allAduanHilang.filter((aduan) => {
        return (
          aduan.status_aduan === 'menunggu validasi admin / kasubbag' &&
          'menunggu validasi satpam'
        );
      });
      console.log('total: ' + allAduanHilangBelum);
      return res.render('satpam/dashboard', {
        notifications,
        user: 6,
        totalKunci: totalKunci.count,
        kunciDipinjam: kunciDipinjam.count,
        totalAduanHilang: totalAduanKehilangan.count,
        aduanHilangBelum: aduanKehilanganBelum.count,
        data_bulan_ini: bulan ? moment(bulan).format('MMMM') : '', //moment().format('MMMM'),
        data_tahun_ini: tahun ? moment(tahun).year() : '', //moment().year(),
        nama_user: req.user.nama_user,
        foto_user: req.user.foto_user,
        aduan_hilang: {
          total: allAduanHilang.length,
          belum: allAduanHilangBelum.length,
          sudah: allAduanHilang.length - allAduanHilangBelum.length,
        },
      });
    }
    if (tahun !== 'semua') {
      const aduanHilangPerBulan = await db.sequelize.query(
        `SELECT * FROM "Aduan_Hilangs" AS "Aduan_Hilang" WHERE date_trunc('month', "Aduan_Hilang"."createdAt")::date = '${tahun}-${bulan}-01'::date`,
        {
          replacements: ['active'],
          type: db.sequelize.QueryTypes,
        }
      );

      const aduanHilangPerBulanBelum = aduanHilangPerBulan.filter((aduan) => {
        return (
          aduan.status_aduan === 'menunggu validasi admin / kasubbag' &&
          'menunggu validasi satpam'
        );
      });

      return res.render('satpam/dashboard', {
        notifications,
        user: 6,
        totalKunci: totalKunci.count,
        kunciDipinjam: kunciDipinjam.count,
        totalAduanHilang: totalAduanKehilangan.count,
        aduanHilangBelum: aduanKehilanganBelum.count,
        data_bulan_ini: bulan ? moment(bulan).format('MMMM') : '', //moment().format('MMMM'),
        data_tahun_ini: tahun ? moment(tahun).year() : '', //moment().year(),
        nama_user: req.user.nama_user,
        foto_user: req.user.foto_user,
        aduan_hilang: {
          total: aduanHilangPerBulan.length,
          belum: aduanHilangPerBulanBelum.length,
          sudah: aduanHilangPerBulan.length - aduanHilangPerBulanBelum.length,
        },
      });
    }
  }

  const allAduanHilang = await Aduan_Hilang.findAll({});

  const allAduanHilangBelum = allAduanHilang.filter((aduan) => {
    return (
      aduan.status_aduan === 'menunggu validasi admin / kasubbag' &&
      'menunggu validasi satpam'
    );
  });

  return res.render('satpam/dashboard', {
    notifications,
    user: 6,
    totalKunci: totalKunci.count,
    kunciDipinjam: kunciDipinjam.count,
    totalAduanHilang: totalAduanKehilangan.count,
    aduanHilangBelum: aduanKehilanganBelum.count,
    data_bulan_ini: bulan ? moment(bulan).format('MMMM') : '', //moment().format('MMMM'),
    data_tahun_ini: tahun ? moment(tahun).year() : '', //moment().year(),
    nama_user: req.user.nama_user,
    foto_user: req.user.foto_user,
    aduan_hilang: {
      total: allAduanHilang.length,
      belum: allAduanHilangBelum.length,
      sudah: allAduanHilang.length - allAduanHilangBelum.length,
    },
  });

  // res.render("satpam/dashboard", {
  //   peminjaman_kunci,
  //   notifications,
  //   foto_user: req.user.foto_user,
  // });
});

// edit profile
router.get('/edit_profile', getProfile);
router.get('/edit_account', getAccount);
router.post('/edit_profile', upload.single('foto_user'), editProfile);
router.post('/edit_account', editAccount);

// CRUD Kunci
router.get('/pinjam_kunci/daftar_kunci', getAllKunci);
router.get('/pinjam_kunci/tambah_kunci/form', renderFormTambah);
router.post('/pinjam_kunci/tambah_kunci', tambahKunci);
router.get('/pinjam_kunci/edit_kunci/:id', renderFormEdit);
router.post('/pinjam_kunci/edit_kunci/:id', updateKunci);
router.get('/pinjam_kunci/delete_kunci/:id', deleteKunci);

// Validasi Pinjam Kunci
router.get('/pinjam_kunci/validasi_pinjam_kunci', async (req, res) => {
  const detail_peminjaman = await Detail_Peminjaman.findAll({
    include: [
      { model: Kunci },
      { model: Data_Peminjaman, include: [{ model: User }] },
    ],
    order: [['status', 'DESC']],
  });

  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: '7',
    },
    order: [['createdAt', 'DESC']],
  });

  res.render('satpam/pinjam_kunci/validasi_pinjam_kunci', {
    detail_peminjaman,
    notifications,
    success: req.flash('success'),
    failed: req.flash('failed'),
    foto_user: req.user.foto_user,
  });
});
router.get('/pinjam_kunci/validasi_pinjam_kunci/:id', validasiPinjamKunci);
router.get('/pinjam_kunci/tolak_pinjam_kunci/:id', tolakPinjamKunci);

// Validasi pengembalian kunci
router.get('/pinjam_kunci/validasi_kembali_kunci', async (req, res) => {
  const now = moment().format('dddd, DD MMMM YYYY');
  const detail_peminjaman = await Detail_Peminjaman.findAll({
    include: [
      { model: Kunci },
      {
        model: Data_Peminjaman,
        order: [['status_peminjaman', 'DESC']],
        include: [{ model: User }],
      },
    ],
  });

  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: '7',
    },
    order: [['createdAt', 'DESC']],
  });

  res.render('satpam/pinjam_kunci/validasi_kembali_kunci', {
    detail_peminjaman,
    notifications,
    success: req.flash('success'),
    foto_user: req.user.foto_user,
  });
  // console.log(now)
});
router.post('/pinjam_kunci/validasi_kembali_kunci', validasiKembaliKunci);
// router.get("/pinjam_kunci/validasi_kembali_kunci/:id", validasiKembaliKunci);

// Aduan Hilang
router.get('/aduan_hilang', getAduanKehilangan);
router.get('/aduan_hilang/form/:id', async (req, res) => {
  const aduan = await Aduan_Hilang.findOne({
    include: User,
    where: {
      id: req.params.id,
    },
  });

  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: '7',
    },
    order: [['createdAt', 'DESC']],
  });

  res.render('satpam/aduan_hilang/verifikasi_form', {
    aduan,
    notifications,
    success: req.flash('success'),
    foto_user: req.user.foto_user,
  });
});
router.get('/aduan_hilang/validasi/:id', validasiSatpamAduan);
router.get('/aduan_hilang/print/:id', getPrintAduan);

module.exports = router;
