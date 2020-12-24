const express = require("express");
const router = express.Router();
const moment = require("moment");
const Op = require("sequelize").Op;

// models
const {
  Aduan_Lapor,
  User,
  Komentar,
  Kunci,
  Detail_Peminjaman,
  Data_Peminjaman,
  Notifications,
  Aduan_Hilang,
} = require("./../models");
const db = require("../models");
//middleware auth
const check = require("./../middlewares/rolePermission");
// upload multer
const { upload } = require("./../config/multer");

// controller
const {
  getUsers,
  getProfileById,
  createUser,
  formCreateUser,
  updateProfile,
  deleteUser,
  getAccountById,
  updateAccount,
  getAccount,
  getProfile,
  editAccount,
  editProfile,
  validasiUser,
} = require("./../controllers/user.controller");
const {
  getAllAduan,
  getAduan,
  tanggapAduan,
  deleteAduan,
  downloadAduanLapor,
} = require("./../controllers/aduan_lapor.controller");
const {
  getAduanKehilangan,
  validasiAdminAduan,
  getAduanKehilangan2,
  validasiSatpamAduan,
  downloadAduanHilang,
  getPrintAduan,
} = require("./../controllers/aduan_hilang.controller");
const {
  getAllKunci,
  renderFormTambah,
  tambahKunci,
  renderFormEdit,
  updateKunci,
  deleteKunci,
} = require("./../controllers/kunci.controller");
const {
  validasiPinjamKunci,
  tolakPinjamKunci,
  validasiKembaliKunci,
} = require("./../controllers/peminjaman_kunci.controller");

router.use(check.isLoggedIn, check.isAdmin);

// dashboard
router.get("/", async (req, res, next) => {
  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: {
        [Op.or]: ["2", "3", "4", "5", "6", "7"],
      },
    },
    order: [["createdAt", "DESC"]],
  });

  let tahun = req.query.tahun; //|| new Date().getFullYear().toString();
  let bulan = req.query.bulan; //|| new Date().getMonth() + 1;

  const allUser = await User.findAndCountAll({});
  const userIsNotValid = await User.findAndCountAll({
    where: {
      isValid: "belum divalidasi",
    },
  });
  const totalAduanKehilangan = await Aduan_Hilang.findAndCountAll({});
  const aduanKehilanganBelum = await Aduan_Hilang.findAndCountAll({
    where: {
      status_aduan: [
        "menunggu validasi satpam",
        "menunggu validasi admin / kasubbag",
      ],
    },
  });
  if (bulan) {
    if (bulan.length > 2) {
      bulan = "0" + bulan;
    }
  }

  if (tahun) {
    if (tahun === "semua") {
      const allAduanLapor = await Aduan_Lapor.findAll({});
      const allAduanHilang = await Aduan_Hilang.findAll({});

      const allAduanLaporBelum = allAduanLapor.filter((aduan) => {
        return aduan.status_aduan === "belum";
      });

      const allAduanHilangBelum = allAduanHilang.filter((aduan) => {
        return (
          aduan.status_aduan === "menunggu validasi admin / kasubbag" &&
          "menunggu validasi satpam"
        );
      });

      return res.render("admin/dashboard", {
        notifications,
        allUser: allUser.count,
        userIsNotValid: userIsNotValid.count,
        allAduan: allAduanLapor.length,
        allAduanBelum: allAduanLaporBelum.length,
        totalAduanHilang: totalAduanKehilangan.count,
        aduanHilangBelum: aduanKehilanganBelum.count,
        data_bulan_ini: bulan ? moment(bulan).format("MMMM") : "", //moment().format('MMMM'),
        data_tahun_ini: tahun ? moment(tahun).year() : "", //moment().year(),
        nama_user: req.user.nama_user,
        foto_user: req.user.foto_user,
        aduan_lapor: {
          total: allAduanLapor.length,
          belum: allAduanLaporBelum.length,
          sudah: allAduanLapor.length - allAduanLaporBelum.length,
        },
        aduan_hilang: {
          total: allAduanHilang.length,
          belum: allAduanHilangBelum.length,
          sudah: allAduanHilang.length - allAduanHilangBelum.length,
        },
      });
    }
    if (tahun !== "semua") {
      const allAduanLapor = await Aduan_Lapor.findAll({});
      const allAduanHilang = await Aduan_Hilang.findAll({});
      const allAduanLaporBelum = allAduanLapor.filter((aduan) => {
        return aduan.status_aduan === "belum";
      });

      const allAduanHilangBelum = allAduanHilang.filter((aduan) => {
        return (
          aduan.status_aduan === "menunggu validasi satpam" ||
          "menunggu validasi admin / kasubbag"
        );
      });
      const aduanLaporPerBulan = await db.sequelize.query(
        `SELECT * FROM "Aduan_Lapors" AS "Aduan_Lapor" WHERE date_trunc('month', "Aduan_Lapor"."createdAt")::date = '${tahun}-${bulan}-01'::date`,
        {
          replacements: ["active"],
          type: db.sequelize.QueryTypes,
        }
      );

      const aduanHilangPerBulan = await db.sequelize.query(
        `SELECT * FROM "Aduan_Hilangs" AS "Aduan_Hilang" WHERE date_trunc('month', "Aduan_Hilang"."createdAt")::date = '${tahun}-${bulan}-01'::date`,
        {
          replacements: ["active"],
          type: db.sequelize.QueryTypes,
        }
      );

      const aduanLaporPerBulanBelum = aduanLaporPerBulan.filter((aduan) => {
        return aduan.status_aduan === "belum";
      });

      const aduanHilangPerBulanBelum = aduanHilangPerBulan.filter((aduan) => {
        return (
          aduan.status_aduan === "menunggu validasi admin / kasubbag" &&
          "menunggu validasi satpam"
        );
      });

      return res.render("admin/dashboard", {
        notifications,
        allUser: allUser.count,
        userIsNotValid: userIsNotValid.count,
        allAduan: allAduanLapor.length,
        allAduanBelum: allAduanLaporBelum.length,
        totalAduanHilang: totalAduanKehilangan.count,
        aduanHilangBelum: aduanKehilanganBelum.count,
        data_bulan_ini: bulan ? moment(bulan).format("MMMM") : "", //moment().format('MMMM'),
        data_tahun_ini: tahun ? moment(tahun).year() : "", //moment().year(),
        nama_user: req.user.nama_user,
        foto_user: req.user.foto_user,
        aduan_lapor: {
          total: aduanLaporPerBulan.length,
          belum: aduanLaporPerBulanBelum.length,
          sudah: aduanLaporPerBulan.length - aduanLaporPerBulanBelum.length,
        },
        aduan_hilang: {
          total: aduanHilangPerBulan.length,
          belum: aduanHilangPerBulanBelum.length,
          sudah: aduanHilangPerBulan.length - aduanHilangPerBulanBelum.length,
        },
      });
    }
  }

  const allAduanLapor = await Aduan_Lapor.findAll({});
  const allAduanHilang = await Aduan_Hilang.findAll({});

  const allAduanLaporBelum = allAduanLapor.filter((aduan) => {
    return aduan.status_aduan === "belum";
  });

  const allAduanHilangBelum = allAduanHilang.filter((aduan) => {
    return (
      aduan.status_aduan === "menunggu validasi admin / kasubbag" &&
      "menunggu validasi satpam"
    );
  });

  return res.render("admin/dashboard", {
    notifications,
    allUser: allUser.count,
    userIsNotValid: userIsNotValid.count,
    allAduan: allAduanLapor.length,
    allAduanBelum: allAduanLaporBelum.length,
    totalAduanHilang: totalAduanKehilangan.count,
    aduanHilangBelum: aduanKehilanganBelum.count,
    data_bulan_ini: bulan ? moment(bulan).format("MMMM") : "", //moment().format('MMMM'),
    data_tahun_ini: tahun ? moment(tahun).year() : "", //moment().year(),
    nama_user: req.user.nama_user,
    foto_user: req.user.foto_user,
    aduan_lapor: {
      total: allAduanLapor.length,
      belum: allAduanLaporBelum.length,
      sudah: allAduanLapor.length - allAduanLaporBelum.length,
    },
    aduan_hilang: {
      total: allAduanHilang.length,
      belum: allAduanHilangBelum.length,
      sudah: allAduanHilang.length - allAduanHilangBelum.length,
    },
  });
});

// Edit Profile
router.get("/edit_profile", getProfile);
router.get("/edit_account", getAccount);
router.post("/edit_account", editAccount);
router.post("/edit_profile", upload.single("foto_user"), editProfile);

// aduan lapor
router.get("/aduan_lapor", getAllAduan);
router.get("/aduan_lapor/:id/edit_aduan", getAduan);
router.post(
  "/aduan_lapor/:id/edit_aduan",
  upload.single("tanggapan_foto"),
  tanggapAduan
);
router.get("/aduan_lapor/delete_aduan/:id", deleteAduan);

// manajemen user
router.get("/manajemen_user", getUsers);
router.get("/manajemen_user/tambah", formCreateUser);
router.post("/manajemen_user/tambah", upload.single("foto_user"), createUser);
router.get("/manajemen_user/edit/:id", getProfileById);
router.post("/manajemen_user/edit/:id", updateProfile);
router.get("/manajemen_user/edit/credentials/:id", getAccountById);
router.post("/manajemen_user/edit/credentials/:id", updateAccount);
router.get("/manajemen_user/delete/:id", deleteUser);
router.post("/manajemen_user/valdasi_user", validasiUser);

//CRUD Kunci
router.get("/pinjam_kunci/daftar_kunci", getAllKunci);
router.get("/pinjam_kunci/tambah_kunci/form", renderFormTambah);
router.post("/pinjam_kunci/tambah_kunci", tambahKunci);
router.get("/pinjam_kunci/edit_kunci/:id", renderFormEdit);
router.post("/pinjam_kunci/edit_kunci/:id", updateKunci);
router.get("/pinjam_kunci/delete_kunci/:id", deleteKunci);

// Validasi Pinjam Kunci
router.get("/pinjam_kunci/validasi_pinjam_kunci", async (req, res) => {
  const detail_peminjaman = await Detail_Peminjaman.findAll({
    include: [
      { model: Kunci },
      { model: Data_Peminjaman, include: [{ model: User }] },
    ],
    order: [["status", "DESC"]],
  });

  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: ["7", "3", "4", "5", "6"],
    },
    order: [["createdAt", "DESC"]],
  });

  res.render("admin/pinjam_kunci/validasi_pinjam_kunci", {
    notifications,
    detail_peminjaman,
    success: req.flash("success"),
    failed: req.flash("failed"),
    foto_user: req.user.foto_user,
    nama_user: req.user.nama_user,
  });
});
router.get("/pinjam_kunci/validasi_pinjam_kunci/:id", validasiPinjamKunci);
router.get("/pinjam_kunci/tolak_pinjam_kunci/:id", tolakPinjamKunci);

// Validasi pengembalian kunci
router.get("/pinjam_kunci/validasi_kembali_kunci", async (req, res) => {
  const now = moment().format("dddd, DD MMMM YYYY");
  const detail_peminjaman = await Detail_Peminjaman.findAll({
    include: [
      { model: Kunci },
      {
        model: Data_Peminjaman,
        order: [["status_peminjaman", "DESC"]],
        include: [{ model: User }],
      },
    ],
  });
  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: ["7", "3", "4", "5", "6"],
    },
    order: [["createdAt", "DESC"]],
  });
  res.render("admin/pinjam_kunci/validasi_kembali_kunci", {
    notifications,
    detail_peminjaman,
    success: req.flash("success"),
    foto_user: req.user.foto_user,
    nama_user: req.user.nama_user,
  });
});
router.post("/pinjam_kunci/validasi_kembali_kunci", validasiKembaliKunci);

// Aduan Hilang
router.get("/aduan_hilang/validasi_admin", getAduanKehilangan2);
router.get("/aduan_hilang/validasi_admin/:id", validasiAdminAduan);
router.get("/aduan_hilang/validasi_satpam", getAduanKehilangan);
router.get("/aduan_hilang/validasi_satpam/:id", validasiSatpamAduan);
router.get("/aduan_hilang/form/:id", async (req, res) => {
  const aduan = await Aduan_Hilang.findOne({
    include: User,
    where: {
      id: req.params.id,
    },
  });

  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: {
        [Op.or]: ["2", "3", "4", "5", "6", "7"],
      },
    },
    order: [["createdAt", "DESC"]],
  });

  res.render("admin/aduan_hilang/validasi_form", {
    aduan,
    notifications,
    success: req.flash("success"),
    foto_user: req.user.foto_user,
    nama_user: req.user.nama_user,
  });
});
router.get("/aduan_hilang/print/:id", getPrintAduan);

router.get("/download", async (req, res) => {
  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: {
        [Op.or]: ["2", "3", "4", "5", "6", "7"],
      },
    },
    order: [["createdAt", "DESC"]],
  });

  res.render("admin/download", {
    notifications,
    nama_user: req.user.nama_user,
    foto_user: req.user.foto_user,
  });
});
router.get("/aduan_lapor/download", downloadAduanLapor);
router.get("/aduan_hilang/download", downloadAduanHilang);

module.exports = router;
