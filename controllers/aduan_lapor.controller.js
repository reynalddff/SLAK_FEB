const { User, Aduan_Lapor, Komentar, Notifications } = require('./../models');
const excel = require('exceljs');
const Op = require('sequelize').Op;
const db = require('../models');
const { sendEmailNotification } = require('./../helper/sendEmail');
const { sendSMS } = require('./../helper/sendSMS');

require('express-async-errors');

// Karyawan / Pegawai /  Dosen & ADmin
exports.getAllAduan = async (req, res) => {
  if (req.user.RoleId === 2) {
    // admin
    const aduans = await Aduan_Lapor.findAll({
      include: [{ model: User }, { model: Komentar }],
      order: [['status_aduan', 'ASC']],
    });
    const notifications = await Notifications.findAll({
      where: {
        [Op.or]: [{ tujuan_notif: '3' }, { tujuan_notif: '7' }],
      },
      order: [['createdAt', 'DESC']],
    });
    res.render('admin/aduan_lapor/aduan_lapor', {
      aduans,
      notifications,
      nama_user: req.user.nama_user,
      success: req.flash('success'),
      failed: req.flash('failed'),
      foto_user: req.user.foto_user,
    });
  } else if (req.user.RoleId === 1) {
    //karyawan
    const aduans = await Aduan_Lapor.findAll({
      include: [{ model: User }, { model: Komentar }],
      where: {
        UserId: req.user.id,
      },
      order: [['status_aduan', 'ASC']],
    });

    const notifications = await Notifications.findAll({
      where: {
        tujuan_notif: req.user.id,
      },
    });

    res.render('karyawan/aduan_lapor/aduan_lapor', {
      aduans,
      notifications,
      user: req.user,
      nama_user: req.user.nama_user,
      success: req.flash('success'),
      failed: req.flash('failed'),
      foto_user: req.user.foto_user,
    });
  }
};

exports.createAduan = async (req, res) => {
  if (req.body.judul_aduan && req.body.deskripsi_aduan) {
    // check file upload
    if (req.fileValidationError) {
      req.flash('failed', 'Foto harus memiliki format JPG/JPEG/PNG');
      res.redirect('/karyawan/aduan_lapor');
    }

    //create aduan
    const aduan = await Aduan_Lapor.create({
      judul_aduan: req.body.judul_aduan,
      lokasi_aduan: req.body.lokasi_aduan || '-',
      deskripsi_aduan: req.body.deskripsi_aduan,
      tujuan_aduan: req.body.tujuan_aduan,
      latitude: req.body.lat,
      longitude: req.body.long,
      foto_aduan: req.file === undefined ? '' : req.file.filename,
      status_aduan: 'belum',
      UserId: req.user.id,
    });

    // create komentar
    await Komentar.create({
      deskripsi_komentar: 'belum ada',
      nilai_komentar: '0',
      AduanLaporId: aduan.id,
      UserId: req.user.id,
    });

    // create notifications untuk operator
    await Notifications.create({
      layananId: aduan.id,
      jenis_notif: 'aduan layanan',
      deskripsi_notif: `Aduan baru telah masuk dari ${req.user.nama_user}`,
      tujuan_notif: aduan.tujuan_aduan,
      UserId: req.user.id,
    });

    const operator = await User.findOne({
      where: {
        RoleId: aduan.tujuan_aduan,
      },
    });

    const karyawan = await User.findOne({
      where: {
        id: aduan.UserId,
      },
    });

    if (operator) {
      const recipentMail = `${operator.mail}, testing.feb.psik@gmail.com`;
      await sendSMS(
        `Aduan lapor telah masuk dari ${karyawan.nama_user}, silahkan segera diselsaikan. Terimakasih!`, // isi sms
        '+6285157712124' // nomor handphone yang dituju
      );
      await sendEmailNotification(
        'Aduan Lapor',
        recipentMail,
        `<p> Telah masuk aduan lapor dari <b>${karyawan.nama_user}</b>, silahkan segera diselsaikan. Terimakasih. </p>`
      );
    } else {
      await sendSMS(
        `Aduan lapor telah masuk dari ${karyawan.nama_user}, silahkan segera diselsaikan. Terimakasih!`, //isi sms
        '+6285157712124' // nomor yang dituju
      );
      await sendEmailNotification(
        'Aduan Lapor',
        'testing.feb.psik@gmail.com',
        `<p> Telah masuk aduan lapor dari <b>${karyawan.nama_user}</b>, silahkan segera diselsaikan. Terimakasih. </p>`
      );
    }

    req.flash('success', 'Aduan berhasil ditambahkan');
    res.redirect('/karyawan/aduan_lapor');
  } else {
    req.flash('failed', 'Input field judul dan deskripsi aduan harus terisi');
    res.redirect('/karyawan/aduan_lapor');
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
    res.redirect('/karyawan/aduan_lapor/form');
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
  res.render('karyawan/aduan_lapor/aduan_lapor_konfirmasi_contact', {
    user: req.user,
    user,
    notifications,
    nama_user: req.user.nama_user,
    foto_user: req.user.foto_user,
  });
};

exports.updateAduan = async (req, res) => {
  if (req.body.judul_aduan && req.body.deskripsi_aduan) {
    // check file upload
    if (req.fileValidationError) {
      req.flash('failed', 'Foto harus memiliki format JPG/JPEG/PNG');
      res.redirect('/karyawan/aduan_lapor');
    }

    const aduan = await Aduan_Lapor.findOne({
      where: {
        id: req.params.id,
      },
    });

    const userAduan = await User.findOne({
      where: {
        id: aduan.UserId,
      },
    });

    //update aduan
    await aduan.update({
      judul_aduan: req.body.judul_aduan,
      lokasi_aduan: req.body.lokasi_aduan || '-',
      deskripsi_aduan: req.body.deskripsi_aduan,
      tujuan_aduan: req.body.tujuan_aduan,
      latitude: req.body.lat,
      longitude: req.body.long,
      foto_aduan: req.file === undefined ? '' : req.file.filename,
      status_aduan: 'belum',
      UserId: req.user.id,
    });

    req.flash('success', 'Aduan berhasil diupdate');
    res.redirect('/karyawan/aduan_lapor');
  } else {
    req.flash('failed', 'Input field judul dan deskripsi aduan harus terisi');
    res.redirect('/karyawan/aduan_lapor');
  }
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

      res.render('operator/aduan_lapor/aduan_lapor', {
        aduans,
        notifications,
        nama_user: req.user.nama_user,
        foto_user: req.user.foto_user,
        success: req.flash('success'),
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
      [Op.or]: [{ tujuan_notif: '3' }, { tujuan_notif: '7' }],
    },
    order: [['createdAt', 'DESC']],
  });
  if (req.user.RoleId === 2) {
    res.render('admin/aduan_lapor/aduan_lapor_edit_status', {
      aduan,
      notifications,
      nama_user: req.user.nama_user,
      foto_user: req.user.foto_user,
    });
  } else {
    res.render('operator/aduan_lapor/aduan_lapor_edit_status', {
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
    res.redirect('/karyawan/aduan_lapor');
  } else if (req.user.RoleId === 2) {
    res.redirect('/admin/aduan_lapor');
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
      msg: 'aduan yang dicari tidak ditemukan',
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
    tanggapan_foto: req.file === undefined ? '' : req.file.filename,
    tanggapan_tanggal: new Date(),
    status_aduan: 'sudah',
  });

  await Notifications.create({
    layananId: aduan.id,
    jenis_notif: 'aduan layanan',
    deskripsi_notif: `Aduan yang anda telah laporkan telah diselsaikan oleh pihak FEB`,
    tujuan_notif: userAduan.id,
    UserId: req.user.id,
  });

  await sendSMS(
    `Aduan yang anda laporkan telah diselsaikan oleh operator kami.Silahkan memberikan nilai dan komentar atas aduan yang telah diselsaikan. Terimakasih.`, // isi sms
    '+6281298223262' // nomor handphone yang dituju
  );

  await sendEmailNotification(
    'Aduan Lapor',
    userAduan.email,
    `<p>Aduan yang anda laporkan telah diselsaikan oleh operator kami. 
    Silahkan memberikan <b>nilai</b> dan <b>komentar</b> atas aduan yang telah diselsaikan. 
    Terimakasih.</p>`
  );

  if (req.user.RoleId === 2) {
    req.flash('success', 'Aduan berhasil ditanggapi');
    res.redirect('/admin/aduan_lapor');
  } else {
    req.flash('success', 'Aduan berhasil ditanggapi');
    res.redirect('/operator/aduan_lapor');
  }
};

// download and export data ke excel
exports.downloadAduanLapor = async (req, res) => {
  let allAduan = [];
  let aduans = [];
  const tahun = req.query.tahun;
  const bulan = req.query.bulan;

  if (!tahun && !bulan) {
    aduans = await Aduan_Lapor.findAll({
      include: [{ model: User }],
    });
    aduans.forEach((aduan) => {
      const {
        id,
        judul_aduan,
        deskripsi_aduan,
        lokasi_aduan,
        tujuan_aduan,
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
  } else if (tahun && bulan) {
    if (tahun === 'semua' && bulan === 'semua') {
      aduans = await Aduan_Lapor.findAll({
        include: [{ model: User }],
      });
      aduans.forEach((aduan) => {
        const {
          id,
          judul_aduan,
          deskripsi_aduan,
          lokasi_aduan,
          tujuan_aduan,
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
    } else if (tahun !== 'semua' && bulan === 'semua') {
      aduans = await db.sequelize.query(
        // `SELECT DATE_TRUNC('month', "Aduan_Lapor"."createdAt") AS "Bulan", COUNT ("Aduan_Lapor"."id") AS "Total Aduan" FROM "Aduan_Lapors" AS "Aduan_Lapor" GROUP BY DATE_TRUNC('month', "createdAt")`,
        `SELECT "Aduan_Lapor"."id", "Aduan_Lapor"."judul_aduan", "Aduan_Lapor"."deskripsi_aduan", "Aduan_Lapor"."lokasi_aduan", "Aduan_Lapor"."tujuan_aduan", "Aduan_Lapor"."status_aduan", "Aduan_Lapor"."kategori_aduan", "Aduan_Lapor"."createdAt", 
        "User"."nama_user" FROM "Aduan_Lapors" AS "Aduan_Lapor" LEFT OUTER JOIN "Users" AS "User" ON "Aduan_Lapor"."UserId" = "User"."id" WHERE date_trunc('month', "Aduan_Lapor"."createdAt")::date = '${tahun}-${
          new Date().getMonth() + 1
        }-01'::date`,
        {
          replacements: ['active'],
          type: db.sequelize.QueryTypes,
        }
      );
      console.log('semua bulan');
      aduans.forEach((aduan) => {
        const {
          id,
          judul_aduan,
          nama_user,
          deskripsi_aduan,
          lokasi_aduan,
          tujuan_aduan,
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
          tujuan_aduan,
          status_aduan,
          kategori_aduan,
          createdAt,
        });
      });
    } else if (bulan !== 'semua' && tahun === 'semua') {
      aduans = await db.sequelize.query(
        // `SELECT DATE_TRUNC('month', "Aduan_Lapor"."createdAt") AS "Bulan", COUNT ("Aduan_Lapor"."id") AS "Total Aduan" FROM "Aduan_Lapors" AS "Aduan_Lapor" GROUP BY DATE_TRUNC('month', "createdAt")`,
        `SELECT "Aduan_Lapor"."id", "Aduan_Lapor"."judul_aduan", "Aduan_Lapor"."deskripsi_aduan", "Aduan_Lapor"."lokasi_aduan", "Aduan_Lapor"."tujuan_aduan", "Aduan_Lapor"."status_aduan", "Aduan_Lapor"."kategori_aduan", "Aduan_Lapor"."createdAt", 
        "User"."nama_user" FROM "Aduan_Lapors" AS "Aduan_Lapor" LEFT OUTER JOIN "Users" AS "User" ON "Aduan_Lapor"."UserId" = "User"."id" WHERE date_trunc('month', "Aduan_Lapor"."createdAt")::date = '${new Date().getFullYear()}-${bulan}-01'::date`,
        {
          replacements: ['active'],
          type: db.sequelize.QueryTypes,
        }
      );
      console.log('semua tahun');
      aduans.forEach((aduan) => {
        const {
          id,
          judul_aduan,
          nama_user,
          deskripsi_aduan,
          lokasi_aduan,
          tujuan_aduan,
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
          tujuan_aduan,
          status_aduan,
          kategori_aduan,
          createdAt,
        });
      });
    } else if (bulan !== 'semua' && tahun !== 'semua') {
      aduans = await db.sequelize.query(
        // `SELECT DATE_TRUNC('month', "Aduan_Lapor"."createdAt") AS "Bulan", COUNT ("Aduan_Lapor"."id") AS "Total Aduan" FROM "Aduan_Lapors" AS "Aduan_Lapor" GROUP BY DATE_TRUNC('month', "createdAt")`,
        `SELECT "Aduan_Lapor"."id", "Aduan_Lapor"."judul_aduan", "Aduan_Lapor"."deskripsi_aduan", "Aduan_Lapor"."lokasi_aduan", "Aduan_Lapor"."tujuan_aduan", "Aduan_Lapor"."status_aduan", "Aduan_Lapor"."kategori_aduan", "Aduan_Lapor"."createdAt", 
        "User"."nama_user" FROM "Aduan_Lapors" AS "Aduan_Lapor" LEFT OUTER JOIN "Users" AS "User" ON "Aduan_Lapor"."UserId" = "User"."id" WHERE date_trunc('month', "Aduan_Lapor"."createdAt")::date = '${tahun}-${bulan}-01'::date`,
        {
          replacements: ['active'],
          type: db.sequelize.QueryTypes,
        }
      );
      aduans.forEach((aduan) => {
        const {
          id,
          judul_aduan,
          nama_user,
          deskripsi_aduan,
          lokasi_aduan,
          tujuan_aduan,
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
          tujuan_aduan,
          status_aduan,
          kategori_aduan,
          createdAt,
        });
      });
    }
  }
  let workbook = new excel.Workbook();
  let worksheet = workbook.addWorksheet('Aduan');

  worksheet.columns = [
    { header: 'Id Aduan', key: 'id', width: 20 },
    { header: 'Nama Pelapor', key: 'nama_user', width: 20 },
    { header: 'Judul Aduan', key: 'judul_aduan', width: 20 },
    { header: 'Deskripsi Aduan', key: 'deskripsi_aduan', width: 20 },
    { header: 'Lokasi Aduan', key: 'lokasi_aduan', width: 20 },
    { header: 'Tujuan Aduan', key: 'tujuan_aduan', width: 20 },
    { header: 'Status Aduan', key: 'status_aduan', width: 20 },
    { header: 'Kategori Aduan', key: 'kategori_aduan', width: 20 },
    { header: 'Tanggal Aduan Diajukan', key: 'createdAt', width: 20 },
  ];
  worksheet.addRows(allAduan);
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  res.setHeader(
    'Content-Disposition',
    'attachment; filename=' + 'Laporan Aduan Lapor.xlsx'
  );

  const dataExport = await workbook.xlsx.write(res);
  return res.status(200).end();
};
