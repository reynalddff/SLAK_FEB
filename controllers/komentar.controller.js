const { User, Aduan_Lapor, Komentar, Notifications } = require("./../models");
const Op = require("sequelize").Op;

require("express-async-errors");

exports.findKomentarByAduan = async (req, res) => {
  const komentar = await Komentar.findOne({
    where: {
      AduanLaporId: req.params.id,
    },
  });
  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: req.user.RoleId.toString(),
    },
  });
  if (!komentar) {
    res.status(200).json({
      msg: "Aduan tidak ditemukan",
    });
  }

  res.status(200).json({
    nama_user: req.user.nama_user,
    notifications,
    komentar,
    success: req.flash("success"),
  });
};

exports.memberikanKomentar = async (req, res) => {
  const { deskripsi_komentar, nilai_komentar } = req.body;
  if (!req.body) {
    res.status(200).send({
      msg: "Harap isi semua kolom form yang tersedia",
    });
  }

  const aduan = await Aduan_Lapor.findOne({
    where: {
      id: req.params.id,
    },
  });

  const komentar = await Komentar.findOne({
    where: {
      AduanLaporId: req.params.id,
    },
  });

  await komentar.update({
    deskripsi_komentar,
    nilai_komentar,
    UserId: req.user.id,
    AduanLaporId: req.params.id,
  });
  req.flash("success", "Komentar berhasil diberikan");
  res.redirect("/karyawan/aduan_lapor");
};

exports.getDeskripsiKomentar = async (req, res) => {
  const aduan = await Aduan_Lapor.findOne({
    where: {
      id: req.params.id,
    },
  });

  const komentar = await Komentar.findOne({
    where: {
      AduanLaporId: aduan.id,
    },
  });

  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: req.user.id,
    },
  });

  res.render("karyawan/aduan_lapor/aduan_lapor_komentar", {
    user: req.user,
    aduan,
    notifications,
    nama_user: req.user.nama_user,
    foto_user: req.user.foto_user,
  });
};
