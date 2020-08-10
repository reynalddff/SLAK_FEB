const { User, Aduan_Lapor, Komentar, Notifications } = require("./../models");
const Op = require("sequelize").Op;

require("express-async-errors");

// Karyawan / Pegawai /  Dosen & ADmin
exports.getAllAduan = async (req, res) => {
  if (req.user.RoleId === 2) {
    // admin
    const aduans = await Aduan_Lapor.findAll({
      include: [{ model: User }, { model: Komentar }],
      order: [["status_aduan", "ASC"]],
    });
    const notifications = await Notifications.findAll({
      where: {
        [Op.or]: [{ tujuan_notif: "3" }, { tujuan_notif: "7" }],
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("admin/aduan_lapor/aduan_lapor", {
      aduans,
      notifications,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      foto_user: req.user.foto_user,
    });
  } else if (req.user.RoleId === 1) {
    //karyawan
    const aduans = await Aduan_Lapor.findAll({
      include: [{ model: User }, { model: Komentar }],
      where: {
        UserId: req.user.id,
      },
      order: [["status_aduan", "ASC"]],
    });

    const notifications = await Notifications.findAll({
      where: {
        tujuan_notif: req.user.id,
      },
    });

    res.render("karyawan/aduan_lapor/aduan_lapor", {
      aduans,
      notifications,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      foto_user: req.user.foto_user,
    });
  }
};

exports.createAduan = async (req, res) => {
  if (req.body.judul_aduan && req.body.deskripsi_aduan) {
    // check file upload
    if (req.fileValidationError) {
      req.flash("error", "Foto harus memiliki format JPG/JPEG/PNG");
      res.redirect("/karyawan/aduan_lapor");
    }

    //create aduan
    const aduan = await Aduan_Lapor.create({
      judul_aduan: req.body.judul_aduan,
      lokasi_aduan: req.body.lokasi_aduan,
      deskripsi_aduan: req.body.deskripsi_aduan,
      tujuan_aduan: req.body.tujuan_aduan,
      latitude: req.body.lat,
      longitude: req.body.long,
      foto_aduan: req.file === undefined ? "" : req.file.filename,
      status_aduan: "belum",
      UserId: req.user.id,
    });

    // create komentar
    await Komentar.create({
      deskripsi_komentar: "belum ada",
      nilai_komentar: "0",
      AduanLaporId: aduan.id,
      UserId: req.user.id,
    });

    // create notifications untuk operator
    await Notifications.create({
      layananId: aduan.id,
      jenis_notif: "aduan layanan",
      deskripsi_notif: `Aduan baru telah masuk dari ${req.user.nama_user}`,
      tujuan_notif: aduan.tujuan_aduan,
      UserId: req.user.id,
    });

    req.flash("success", "Aduan berhasil ditambahkan");
    res.redirect("/karyawan/aduan_lapor");
  } else {
    req.flash("error", "Input field judul dan deskripsi aduan harus terisi");
    res.redirect("/karyawan/aduan_lapor");
  }
};

exports.updateContactProfile = async (req, res) => {
  const { telp_user, email } = req.body;
  try {
    const user = await User.findOne({
      where: {
        id: req.user.id,
      },
    });
    user.update({
      telp_user,
      email,
    });
    res.redirect("/karyawan/aduan_lapor/form");
  } catch (error) {
    res.send({ error });
  }
};

exports.getContactProfile = async (req, res) => {
  const user = await User.findOne({
    where: {
      id: req.user.id,
    },
  });

  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: req.user.id,
    },
  });
  res.render("karyawan/aduan_lapor/aduan_lapor_konfirmasi_contact", {
    user,
    notifications,
    nama_user: req.user.nama_user,
    foto_user: req.user.foto_user,
  });
};

// Operator & Admin
exports.getAduanByTujuan = (req, res) => {
  const filterByTujuan = async (RoleId) => {
    if (req.user.RoleId === RoleId) {
      const aduans = await Aduan_Lapor.findAll({
        include: [{ model: User }, { model: Komentar }],
        where: {
          tujuan_aduan: RoleId,
        },
      });

      const notifications = await Notifications.findAll({
        where: {
          tujuan_notif: req.user.RoleId.toString(),
        },
      });

      res.render("operator/aduan_lapor/aduan_lapor", {
        aduans,
        notifications,
        nama_user: req.user.nama_user,
        foto_user: req.user.foto_user,
        success: req.flash("success"),
      });
    }
  };

  filterByTujuan(req.user.RoleId);
};

exports.getAduan = async (req, res) => {
  const aduan = await Aduan_Lapor.findOne({
    include: User,
    where: {
      id: req.params.id,
    },
  });
  const notifications = await Notifications.findAll({
    where: {
      [Op.or]: [{ tujuan_notif: "3" }, { tujuan_notif: "7" }],
    },
    order: [["createdAt", "DESC"]],
  });
  if (req.user.RoleId === 2) {
    res.render("admin/aduan_lapor/aduan_lapor_edit_status", {
      aduan,
      notifications,
      nama_user: req.user.nama_user,
      foto_user: req.user.foto_user,
    });
  } else {
    res.render("operator/aduan_lapor/aduan_lapor_edit_status", {
      aduan,
      notifications,
      nama_user: req.user.nama_user,
      foto_user: req.user.foto_user,
    });
  }
};

exports.deleteAduan = async (req, res) => {
  const aduan = await Aduan_Lapor.findOne({
    where: { id: req.params.id },
  });
  const notif = await Notifications.findOne({
    where: { layananId: aduan.id },
  });
  await aduan.destroy();
  await notif.destroy();
  if (req.user.RoleId === 1) {
    res.redirect("/karyawan/aduan_lapor");
  } else if (req.user.RoleId === 2) {
    res.redirect("/admin/aduan_lapor");
  }
};

exports.tanggapAduan = async (req, res) => {
  const { tanggapan_aduan } = req.body;
  const aduan = await Aduan_Lapor.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (!aduan) {
    return res.status(200).send({
      msg: "aduan yang dicari tidak ditemukan",
    });
  }

  const userAduan = await User.findOne({
    where: {
      id: aduan.UserId,
    },
  });

  await aduan.update({
    tanggapan_aduan,
    tanggapan_user: req.user.id, //orang yang menyelsaikan aduan
    tanggapan_foto: req.file === undefined ? "" : req.file.filename,
    tanggapan_tanggal: new Date(),
    status_aduan: "sudah",
  });

  await Notifications.create({
    layananId: aduan.id,
    jenis_notif: "aduan layanan",
    deskripsi_notif: `Aduan yang anda telah laporkan telah diselsaikan oleh pihak FEB`,
    tujuan_notif: userAduan.id,
    UserId: req.user.id,
  });

  if (req.user.RoleId === 2) {
    req.flash("success", "Aduan berhasil ditanggapi");
    res.redirect("/admin/aduan_lapor");
  } else {
    req.flash("success", "Aduan berhasil ditanggapi");
    res.redirect("/operator/aduan_lapor");
  }
};

// get aduan by month
exports.getAduanByMonth = async (req, res) => {
  const aduan = await Aduan_Lapor.findAll({
    attributes: [
      [sequelize.fn("date_trunc", "month", sequelize.col("createdAt")), "date"],
      [sequelize.fn("count", "*"), "count"],
    ],
    group: [sequelize.col("date")],
    // where: {
    //     tujuan_aduan: 3
    // }
  });

  const dataByMonth = {
    july: aduan[0],
  };

  res.send({ dataByMonth });
};
