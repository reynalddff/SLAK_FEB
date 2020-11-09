const express = require("express");
const router = express.Router();
const Op = require("sequelize").Op;

// models
const {
  Aduan_Lapor,
  Role,
  Kunci,
  User,
  Notifications,
} = require("./../models");
//middleware auth
const check = require("./../middlewares/rolePermission");
// upload multer
const { upload } = require("./../config/multer");
// controllers
const {
  getProfile,
  getAccount,
  editProfile,
  editAccount,
} = require("./../controllers/user.controller");
const {
  getAllAduan,
  getContactProfile,
  updateContactProfile,
  createAduan,
  deleteAduan,
  updateAduan,
} = require("./../controllers/aduan_lapor.controller");
const {
  memberikanKomentar,
  getDeskripsiKomentar,
} = require("./../controllers/komentar.controller");
const {
  getPeminjamanKunci,
  getContactProfile2,
  updateContactProfile2,
  pinjamKunci,
} = require("./../controllers/peminjaman_kunci.controller");
const {
  getAduanKehilangan,
  getContactProfile3,
  updateContactProfile3,
  createAduanHilang,
  deleteAduanHilang,
} = require("./../controllers/aduan_hilang.controller");

router.use(check.isKaryawan, check.isLoggedIn);

// dashboard
router.get("/", async (req, res, next) => {
  const aduans = await Aduan_Lapor.findAll({
    where: {
      UserId: req.user.id,
    },
  });

  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: req.user.id,
    },
    order: [["createdAt", "DESC"]],
  });

  res.render("karyawan/dashboard", {
    // nama_user: req.user.name,
    user: req.user,
    aduans,
    notifications,
    nama_user: req.user.nama_user,
    foto_user: req.user.foto_user,
  });
});

// edit profile
router.get("/edit_profile", getProfile);
router.get("/edit_account", getAccount);
router.post("/edit_profile", upload.single("foto_user"), editProfile);
router.post("/edit_account", editAccount);

// aduan lapor
router.get("/aduan_lapor", getAllAduan);
router.get("/aduan_lapor/konfirmasi", getContactProfile);
router.post("/aduan_lapor/konfirmasi", updateContactProfile);
router.get("/aduan_lapor/form", async (req, res) => {
  const roles = await Role.findAll({
    where: {
      [Op.not]: [{ id: [1, 2, 7] }],
    },
  });
  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: req.user.id,
    },
  });
  res.render("karyawan/aduan_lapor/aduan_lapor_form", {
    roles,
    notifications,
    user: req.user,
    nama_user: req.user.nama_user,
    foto_user: req.user.foto_user,
    UserId: req.user.id,
  });
});
router.post("/aduan_lapor/form", upload.single("foto_aduan"), createAduan);
router.get("/aduan_lapor/delete_aduan/:id", deleteAduan);
router.get("/aduan_lapor/edit/:id", async (req, res) => {
  const aduan = await Aduan_Lapor.findOne({
    where: {
      id: req.params.id,
    },
  });

  const roles = await Role.findAll({
    where: {
      [Op.not]: [{ id: [1, 2, 7] }],
    },
  });

  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: req.user.id,
    },
  });

  res.render("karyawan/aduan_lapor/aduan_lapor_form_edit", {
    aduan,
    roles,
    notifications,
    user: req.user,
    nama_user: req.user.nama_user,
    foto_user: req.user.foto_user,
    UserId: req.user.id,
  });
});
router.post("/aduan_lapor/edit/:id", upload.single("foto_aduan"), updateAduan);

// komentar
router.get("/aduan_lapor/komentar/:id", getDeskripsiKomentar);
router.post("/aduan_lapor/komentar/:id", memberikanKomentar);

// kunci
router.get("/pinjam_kunci", getPeminjamanKunci);
router.post("/pinjam_kunci", pinjamKunci);
// router.get('/pinjam_kunci/konfirmasi/:id', getContactProfile2);
// router.post('/pinjam_kunci/konfirmasi/:id', updateContactProfile2);

// aduan hilang
router.get("/aduan_hilang", getAduanKehilangan);
router.get("/aduan_hilang/konfirmasi", getContactProfile3);
router.post("/aduan_hilang/konfirmasi", updateContactProfile3);
router.get("/aduan_hilang/form", async (req, res) => {
  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: req.user.id,
    },
    order: [["createdAt", "DESC"]],
  });
  res.render("karyawan/aduan_hilang/aduan_barang_hilang_form", {
    notifications,
    nama_user: req.user.nama_user,
    foto_user: req.user.foto_user,
    user: req.user,
  });
});
router.post(
  "/aduan_hilang/form",
  upload.single("foto_barang"),
  createAduanHilang
);
router.get("/aduan_hilang/delete_aduan/:id", deleteAduanHilang);

module.exports = router;
