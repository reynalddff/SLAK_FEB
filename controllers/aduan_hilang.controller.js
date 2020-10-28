const { Aduan_Hilang, User, Notifications } = require("./../models");
const { Op } = require("sequelize");
const excel = require("exceljs");
const db = require("../models");
<<<<<<< HEAD
const { sendEmailNotification } = require("./../helper/sendEmail");
=======
>>>>>>> 545070e64a206e6c75356f6f5aaab26b2fe65221

exports.getAduanKehilangan = async (req, res) => {
  if (req.user.RoleId === 1) {
    const aduan = await Aduan_Hilang.findAll({
      include: [{ model: User }],
      where: { UserId: req.user.id },
      order: [["status_aduan", "ASC"]],
    });

    const notifications = await Notifications.findAll({
      where: {
        tujuan_notif: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });

    res.render("karyawan/aduan_hilang/aduan_barang_hilang", {
      user: req.user,
      aduan,
      notifications,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      foto_user: req.user.foto_user,
    });
  } else if (req.user.RoleId === 7) {
    const aduan = await Aduan_Hilang.findAll({
      include: [{ model: User }],
    });
    const notifications = await Notifications.findAll({
      where: {
        tujuan_notif: "7",
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("satpam/aduan_hilang/verifikasi_aduan_barang_hilang", {
      aduan,
      notifications,
      success: req.flash("success"),
      error: req.flash("error"),
      foto_user: req.user.foto_user,
    });
  } else if (req.user.RoleId === 2) {
    const aduan = await Aduan_Hilang.findAll({
      include: [{ model: User }],
      order: [["status_aduan", "DESC"]],
    });

    const notifications = await Notifications.findAll({
      where: {
        [Op.or]: [{ tujuan_notif: "3" }, { tujuan_notif: "7" }],
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("admin/aduan_hilang/verifikasi_aduan_barang_hilang", {
      aduan,
      notifications,
      success: req.flash("success"),
      error: req.flash("error"),
      foto_user: req.user.foto_user,
      nama_user: req.user.nama_user,
    });
  }
};

exports.getAduanKehilangan2 = async (req, res) => {
  if (req.user.RoleId === 2) {
    const aduan = await Aduan_Hilang.findAll({
      include: [{ model: User }],
      order: [["status_aduan", "DESC"]],
    });

    const notifications = await Notifications.findAll({
      where: {
        [Op.or]: [{ tujuan_notif: "3" }, { tujuan_notif: "7" }],
      },
      order: [["createdAt", "DESC"]],
    });

    res.render("admin/aduan_hilang/validasi_aduan_barang_hilang", {
      aduan,
      notifications,
      success: req.flash("success"),
      error: req.flash("error"),
      foto_user: req.user.foto_user,
      nama_user: req.user.nama_user,
    });
  }
};

exports.updateContactProfile3 = async (req, res) => {
  const { telp_user, email } = req.body;
  try {
    const user = await User.findOne({
      where: {
        id: req.user.id,
      },
<<<<<<< HEAD
    });
    user.update({
      telp_user,
      email,
    });
=======
    });
    user.update({
      telp_user,
      email,
    });
>>>>>>> 545070e64a206e6c75356f6f5aaab26b2fe65221
    res.redirect("/karyawan/aduan_hilang/form");
  } catch (error) {
    res.send({ error });
  }
};

exports.getContactProfile3 = async (req, res) => {
  const user = await User.findOne({
    where: {
      id: req.user.id,
    },
  });

  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: req.user.id,
    },
    order: [["createdAt", "DESC"]],
  });
  res.render("karyawan/aduan_hilang/aduan_hilang_konfirmasi_contact", {
    user: req.user,
    user,
    notifications,
    nama_user: req.user.nama_user,
    foto_user: req.user.foto_user,
  });
};

exports.createAduanHilang = async (req, res) => {
  const { judul_aduan, deskripsi_aduan, lokasi_aduan } = req.body;
  if (!req.body) {
    res.status(200).send({
      msg: "Harap isi semua kolom form yang tersedia",
    });
  } else if (judul_aduan && deskripsi_aduan) {
    const aduan = await Aduan_Hilang.create({
      judul_aduan,
      deskripsi_aduan,
      lokasi_aduan,
      latitude: req.body.lat,
      longitude: req.body.long,
      foto_barang: req.file === undefined ? "" : req.file.filename,
      UserId: req.user.id,
    });
<<<<<<< HEAD

    // create notifications untuk satpam
    await Notifications.create({
      layananId: aduan.id,
      jenis_notif: "aduan barang hilang",
      deskripsi_notif: `Permintaan validasi aduan barang hilang dari ${req.user.nama_user}`,
      tujuan_notif: "7", //Role Id Satpam
      UserId: req.user.id,
    });

    const satpam = await User.findOne({
      where: {
        RoleId: 7,
      },
    });

    const karyawan = await User.findOne({
      where: {
        id: aduan.UserId,
      },
    });

    await sendEmailNotification(
      "Aduan Hilang",
      "testing.feb.psik@gmail.com", //sementara doang
      `<p>Telah masuk aduan hilang dari <b>${karyawan.nama_user}</b>, silahkan segera divalidasi. Terimakasih.</p>`
    );
=======

    // create notifications untuk satpam
    await Notifications.create({
      layananId: aduan.id,
      jenis_notif: "aduan barang hilang",
      deskripsi_notif: `Permintaan validasi aduan barang hilang dari ${req.user.nama_user}`,
      tujuan_notif: "7", //Role Id Satpam
      UserId: req.user.id,
    });
>>>>>>> 545070e64a206e6c75356f6f5aaab26b2fe65221

    req.flash("success", "Aduan berhasil ditambahkan");
    res.redirect("/karyawan/aduan_hilang");
  }
};

exports.validasiSatpamAduan = async (req, res) => {
  const { id } = req.params;
  const aduan = await Aduan_Hilang.findOne({ where: { id } });
<<<<<<< HEAD
  const user = await User.findOne({ where: { id: aduan.UserId } });
=======
>>>>>>> 545070e64a206e6c75356f6f5aaab26b2fe65221
  if (!aduan) {
    req.flash("error", "Aduan tidak ditemukan");
    if (req.user.RoleId === 2) {
      res.redirect("/satpam/aduan_hilang");
    } else if (req.user.RoleId === 7) {
      res.redirect("/admin/aduan_hilang");
    }
  }

  await aduan.update({ status_aduan: "menunggu validasi admin / kasubbag" });
<<<<<<< HEAD

  await sendEmailNotification(
    "Aduan Hilang",
    user.email,
    `<p>Aduan yang anda laporkan telah divalidasi oleh satpam. Silahkan menunggu untuk diverifikasi oleh kasubbag. Terimakasih</p>`
  );

=======
>>>>>>> 545070e64a206e6c75356f6f5aaab26b2fe65221
  req.flash("success", "Aduan berhasil divalidasi");
  if (req.user.RoleId === 2) {
    res.redirect("/admin/aduan_hilang");
  } else if (req.user.RoleId === 7) {
    res.redirect("/satpam/aduan_hilang");
  }
};

exports.validasiAdminAduan = async (req, res) => {
  const { id } = req.params;
  const aduan = await Aduan_Hilang.findOne({ where: { id } });
<<<<<<< HEAD
  const user = await User.findOne({ where: { id: aduan.UserId } });
=======
>>>>>>> 545070e64a206e6c75356f6f5aaab26b2fe65221
  if (!aduan) {
    req.flash("error", "Aduan tidak ditemukan");
    res.redirect("/admin/aduan_hilang");
  }

  await aduan.update({ status_aduan: "divalidasi" });
<<<<<<< HEAD
  await sendEmailNotification(
    "Aduan Hilang",
    user.email,
    `<p>Aduan yang anda laporkan telah diverifiaksi oleh kasubbag. Silahkan mengambil surat di <b>Kantor Satpam Gedung Utama Lantai 1</b>. Terimakasih</p>`
  );
=======
>>>>>>> 545070e64a206e6c75356f6f5aaab26b2fe65221
  req.flash("success", "Aduan berhasil divalidasi");
  if (req.user.RoleId === 2) {
    res.redirect("/admin/aduan_hilang/validasi_admin");
  } else if (req.user.RoleId === 8) {
    res.redirect("/kasubbag/aduan_hilang/validasi_admin");
  }
};

exports.deleteAduanHilang = async (req, res) => {
  const aduan = await Aduan_Hilang.findOne({
    where: { id: req.params.id },
  });
  await aduan.destroy({});
  if (req.user.RoleId === 1) {
    res.redirect("/karyawan/aduan_hilang");
  } else if (req.user.RoleId === 2) {
    res.redirect("/admin/aduan_hilang");
  } else if (req.user.RoleId === 7) {
    res.redirect("/satpam/aduan_hilang");
  }
};

exports.getPrintAduan = async (req, res) => {
  const aduan = await Aduan_Hilang.findOne({
    include: User,
    where: {
      id: req.params.id,
    },
  });

  const { judul_aduan, deskripsi_aduan, lokasi_aduan, foto_barang } = aduan;

  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: "7",
    },
    order: [["createdAt", "DESC"]],
  });

  res.render("satpam/aduan_hilang/print_template", {
    aduan,
    notifications,
    nama_pelapor: aduan.User.nama_user,
    contact_pelapor: aduan.User.telp_user,
    username: aduan.User.username,
    judul_aduan,
    deskripsi_aduan,
    lokasi_aduan,
    foto_barang,
  });
};

exports.downloadAduanHilang = async (req, res) => {
  let allAduan = [];
  let aduanHilang = [];
  const tahun = req.query.tahun;
  const bulan = req.query.bulan;

  if (!tahun && !bulan) {
    aduanHilang = await Aduan_Lapor.findAll({
      include: [{ model: User }],
    });
    aduanHilang.forEach((aduan) => {
      const {
        id,
        judul_aduan,
        deskripsi_aduan,
        lokasi_aduan,
        status_aduan,
        kategori_aduan,
        createdAt,
      } = aduan;
      allAduan.push({
        id,
        nama_user: aduan.User.nama_user,
        judul_aduan,
        deskripsi_aduan,
        lokasi_aduan,
        tujuan_aduan,
        status_aduan,
        kategori_aduan,
        createdAt,
      });
    });
  } else if (tahun) {
    if (tahun === "semua") {
      aduanHilang = await Aduan_Lapor.findAll({
        include: [{ model: User }],
      });
      aduanHilang.forEach((aduan) => {
        const {
          id,
          judul_aduan,
          deskripsi_aduan,
          lokasi_aduan,
          status_aduan,
          kategori_aduan,
          createdAt,
        } = aduan;
        allAduan.push({
          id,
          nama_user: aduan.User.nama_user,
          judul_aduan,
          deskripsi_aduan,
          lokasi_aduan,
          tujuan_aduan,
          status_aduan,
          kategori_aduan,
          createdAt,
        });
      });
    } else {
      aduanHilang = await db.sequelize.query(
        // `SELECT DATE_TRUNC('month', "Aduan_Lapor"."createdAt") AS "Bulan", COUNT ("Aduan_Lapor"."id") AS "Total Aduan" FROM "Aduan_Lapors" AS "Aduan_Lapor" GROUP BY DATE_TRUNC('month', "createdAt")`,
        `SELECT "Aduan_Hilang"."id", "Aduan_Hilang"."judul_aduan", "Aduan_Hilang"."deskripsi_aduan", "Aduan_Hilang"."lokasi_aduan", "Aduan_Hilang"."status_aduan", "Aduan_Hilang"."kategori_aduan", "Aduan_Hilang"."createdAt", 
        "User"."nama_user" FROM "Aduan_Hilangs" AS "Aduan_Hilang" LEFT OUTER JOIN "Users" AS "User" ON "Aduan_Hilang"."UserId" = "User"."id" WHERE date_trunc('month', "Aduan_Hilang"."createdAt")::date = '${tahun}-${bulan}-01'::date`,
        {
          replacements: ["active"],
          type: db.sequelize.QueryTypes,
        }
      );
      aduanHilang.forEach((aduan) => {
        const {
          id,
          nama_user,
          judul_aduan,
          deskripsi_aduan,
          lokasi_aduan,
          status_aduan,
          kategori_aduan,
          createdAt,
        } = aduan;
        allAduan.push({
          id,
          nama_user,
          judul_aduan,
          deskripsi_aduan,
          lokasi_aduan,
          status_aduan,
          kategori_aduan,
          createdAt,
        });
      });
    }
  }

<<<<<<< HEAD
=======

>>>>>>> 545070e64a206e6c75356f6f5aaab26b2fe65221
  let workbook = new excel.Workbook();
  let worksheet = workbook.addWorksheet("Aduan");

  worksheet.columns = [
    { header: "Id Aduan", key: "id", width: 20 },
    { header: "Nama Pelapor", key: "nama_user", width: 20 },
    { header: "Judul Aduan", key: "judul_aduan", width: 20 },
    { header: "Deskripsi Aduan", key: "deskripsi_aduan", width: 20 },
    { header: "Lokasi Aduan", key: "lokasi_aduan", width: 20 },
    { header: "Tujuan Aduan", key: "tujuan_aduan", width: 20 },
    { header: "Status Aduan", key: "status_aduan", width: 20 },
    { header: "Kategori Aduan", key: "kategori_aduan", width: 20 },
    { header: "Tanggal Aduan Diajukan", key: "createdAt", width: 20 },
  ];
  worksheet.addRows(allAduan);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "Laporan Aduan Hilang.xlsx"
  );

  const dataExport = await workbook.xlsx.write(res);
  return res.status(200).end();
<<<<<<< HEAD
};
=======
}
>>>>>>> 545070e64a206e6c75356f6f5aaab26b2fe65221
