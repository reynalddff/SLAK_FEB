const {
  User,
  Kunci,
  Notifications,
  Data_Peminjaman,
  Detail_Peminjaman,
  Data_Pengembalian,
} = require('./../models');
const Op = require('sequelize').Op;
const moment = require('moment');
const { sendEmailNotification } = require('./../helper/sendEmail');
const { sendSMS } = require('./../helper/sendSMS');

require('express-async-errors');

exports.getPeminjamanKunci = async (req, res) => {
  const notifications = await Notifications.findAll({
    where: {
      tujuan_notif: req.user.id,
    },
  });
  const findDataByStatusPeminjaman = (arr, status_peminjaman) => {
    return arr.filter((obj) =>
      obj.Detail_Peminjamans.some(
        (detail) =>
          detail.Data_Peminjaman.status_peminjaman === status_peminjaman
      )
    );
  };

  const dataPinjam = await Data_Peminjaman.findOne({
    where: {
      status_peminjaman: 'menunggu validasi' || 'sudah divalidasi',
      UserId: req.user.id,
    },
  });

  const { tanggal } = req.query;

  const today = moment().clone().format('yyy-MM-DD');

  if (!tanggal) {
    const kunci = await Kunci.findAll({
      include: [
        {
          model: Detail_Peminjaman,
          include: {
            model: Data_Peminjaman,
            where: { tanggal_pinjam: today },
          },
        },
      ],
      order: [['nama_ruangan', 'ASC']],
    });
    res.render('karyawan/pinjam_kunci/pinjam_kunci', {
      dataPinjam,
      today,
      kunci,
      notifications,
      tanggal: today,
      user: req.user,
      nama_user: req.user.nama_user,
      success: req.flash('success'),
      failed: req.flash('failed'),
      foto_user: req.user.foto_user,
    });
    return;
  } else if (tanggal) {
    const kunci = await Kunci.findAll({
      include: [
        {
          model: Detail_Peminjaman,
          include: {
            model: Data_Peminjaman,
            where: { tanggal_pinjam: tanggal },
          },
        },
      ],
    });

    res.render('karyawan/pinjam_kunci/pinjam_kunci', {
      dataPinjam,
      user: req.user,
      kunci,
      notifications,
      tanggal,
      nama_user: req.user.nama_user,
      success: req.flash('success'),
      failed: req.flash('failed'),
      foto_user: req.user.foto_user,
    });
    return;
  }

  const kunci = await Kunci.findAll({
    include: [
      {
        model: Detail_Peminjaman,
        include: {
          model: Data_Peminjaman,
          where: { tanggal_pinjam: today },
        },
      },
    ],
  });

  res.render('karyawan/pinjam_kunci/pinjam_kunci', {
    dataPinjam,
    user: req.user,
    kunci,
    tanggal: today,
    notifications,
    nama_user: req.user.nama_user,
    success: req.flash('success'),
    failed: req.flash('failed'),
    foto_user: req.user.foto_user,
  });
  return;
};

exports.getContactProfile2 = async (req, res) => {
  const id = req.params.id;

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

  res.render('karyawan/pinjam_kunci/pinjam_kunci_konfirmasi_contact', {
    user: req.user,
    user,
    notifications,
    nama_user: req.user.nama_user,
    idKunci: id,
    foto_user: req.user.foto_user,
  });
};

exports.updateContactProfile2 = async (req, res) => {
  const id = req.params.id;
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
    res.redirect(`/karyawan/pinjam_kunci/form/${id}`);
  } catch (error) {
    res.send({ error });
  }
};

exports.pinjamKunci = async (req, res) => {
  const {
    id_kunci,
    nama_kunci,
    tanggal_pinjam,
    keperluan,
    identitas,
  } = req.body;
  const kunci = await Kunci.findOne({
    where: { id: id_kunci },
  });

  const pinjamKunci = await Data_Peminjaman.create({
    keperluan,
    identitas,
    status_peminjaman: 'menunggu validasi',
    tanggal_pinjam: tanggal_pinjam,
    tanggal_kembali: moment(tanggal_pinjam).add(1, 'days'),
    UserId: req.user.id,
  });

  const pinjam_kunci_detail = await Detail_Peminjaman.create({
    status: 'menunggu validasi',
    DataPeminjamanId: pinjamKunci.id,
    KunciId: id_kunci,
  });

  const karyawan = await User.findOne({
    where: {
      id: pinjamKunci.UserId,
    },
  });

  const satpam = await User.findOne({
    where: {
      RoleId: 7,
    },
  });

  await Notifications.create({
    layananId: pinjamKunci.id,
    jenis_notif: 'peminjaman kunci',
    deskripsi_notif: `Permintaan peminjaman kunci ${kunci.nama_ruangan} dari ${req.user.nama_user}`,
    tujuan_notif: '7', //Role Id Satpam
    UserId: req.user.id,
  });

  if (satpam) {
    const recipentMail = `${satpam.mail}, testing.feb.psik@gmail.com`;
    await sendSMS(
      `Permintaan validasi peminjaman kunci dari ${karyawan.nama_user}, silahkan segera divalidasi. Terimakasih!`, // isi sms
      '+6281298223262' // nomor handphone yang dituju
    );
    await sendEmailNotification(
      'Aduan Lapor',
      recipentMail,
      `<p> Telah masuk permintaan validasi peminjaman kunci dari <b>${karyawan.nama_user}</b>, silahkan segera divalidasi. Terimakasih. </p>`
    );
  } else {
    await sendSMS(
      `Permintaan validasi peminjaman kunci dari ${karyawan.nama_user}, silahkan segera divalidasi. Terimakasih!`, // isi sms
      '+6281298223262' // nomor handphone yang dituju
    );
    await sendEmailNotification(
      'Aduan Lapor',
      'testing.feb.psik@gmail.com',
      `<p> Telah masuk permintaan validasi peminjaman kunci dari <b>${karyawan.nama_user}</b>, silahkan segera divalidasi. Terimakasih. </p>`
    );
  }

  req.flash(
    'success',
    'Peminjaman kunci berhasil diajukan. Silahkan menunggu validasi dari Satpam'
  );
  res.redirect('/karyawan/pinjam_kunci');
};

// buat satpam & admin
exports.validasiPinjamKunci = async (req, res) => {
  const dataPinjamKunci = await Data_Peminjaman.findOne({
    where: { id: req.params.id },
    include: [{ model: User }],
  });

  const dataDetailPinjamKunci = await Detail_Peminjaman.findOne({
    where: {
      DataPeminjamanId: dataPinjamKunci.id,
    },
    include: [
      { model: Kunci },
      { model: Data_Peminjaman, include: [{ model: User }] },
    ],
  });

  const userPeminjam = await User.findOne({
    where: {
      id: dataPinjamKunci.UserId,
    },
  });

  if (dataPinjamKunci.status_peminjaman === 'menunggu validasi') {
    await dataPinjamKunci.update({ status_peminjaman: 'sudah divalidasi' });
    await dataDetailPinjamKunci.update({ status: 'dipinjam' });
    await Data_Pengembalian.create({
      tanggal_pinjam: dataPinjamKunci.tanggal_pinjam,
      tanggal_kembali: dataPinjamKunci.tanggal_kembali,
      nama_pengembali: '',
      status_pengembalian: 'masih dipinjam',
      DataPeminjamanId: dataPinjamKunci.id,
    });
    if (req.user.RoleId === 7) {
      // create notification validasi kunci untuk penguna dari satpam
      await Notifications.create({
        layananId: dataPinjamKunci.id,
        jenis_notif: 'peminjaman kunci',
        deskripsi_notif: `Permintaan peminjaman kunci ${dataDetailPinjamKunci.Kunci.nama_ruangan} telah divalidasi oleh satpam.`,
        tujuan_notif: dataPinjamKunci.User.id, //Id Peminjam kunci
        UserId: req.user.id,
      });
      await sendSMS(
        `Permintaan validasi peminjaman kunci telah divalidasi. Silahkan datang ke kantor satpam untuk mengambil kunci tersebut. Terimakasih!`, // isi sms
        '+6281298223262' // nomor handphone yang dituju
      );
      await sendEmailNotification(
        'Aduan Lapor',
        userPeminjam.email,
        `<p> Permintaan validasi peminjaman kunci sudah divalidasi. Silahkan datang ke kantor satpam untuk mengambil kunci tersebut. Terimakasih! </p>`
      );
      req.flash('success', 'Peminjaman kunci berhasil divalidasi');
      res.redirect('/satpam/pinjam_kunci/validasi_pinjam_kunci');
    } else if (req.user.RoleId === 2) {
      // create notification validasi kunci untuk penguna dari admin
      await Notifications.create({
        layananId: dataPinjamKunci.id,
        jenis_notif: 'peminjaman kunci',
        deskripsi_notif: `Permintaan peminjaman kunci ${dataDetailPinjamKunci.Kunci.nama_ruangan} telah divalidasi oleh admin.`,
        tujuan_notif: dataPinjamKunci.User.id, //Id Peminjam Kunci
        UserId: req.user.id,
      });
      req.flash('success', 'Peminjaman kunci berhasil divalidasi');
      res.redirect('/admin/pinjam_kunci/validasi_pinjam_kunci');
    }
  } else {
    if (req.user.RoleId === 7) {
      req.flash(
        'failed',
        'Validasi peminjaman kunci gagal! Silahkan dicoba kembali.'
      );
      res.redirect('/satpam/pinjam_kunci/validasi_pinjam_kunci');
    } else if (req.user.RoleId === 2) {
      req.flash(
        'failed',
        'Validasi peminjaman kunci gagal! Silahkan dicoba kembali.'
      );
      res.redirect('/admin/pinjam_kunci/validasi_pinjam_kunci');
    }
  }
};

exports.tolakPinjamKunci = async (req, res) => {
  const dataPinjamKunci = await Data_Peminjaman.findOne({
    where: { id: req.params.id },
    include: [{ model: User }],
  });

  const dataDetailPinjamKunci = await Detail_Peminjaman.findOne({
    where: {
      DataPeminjamanId: dataPinjamKunci.id,
    },
    include: [
      { model: Kunci },
      { model: Data_Peminjaman, include: [{ model: User }] },
    ],
  });

  const userPeminjam = await User.findOne({
    where: {
      id: dataPinjamKunci.UserId,
    },
  });

  if (dataPinjamKunci.status_peminjaman === 'menunggu validasi') {
    await dataPinjamKunci.update({ status_peminjaman: 'dikembalikan' });
    await dataDetailPinjamKunci.update({ status: 'dikembalikan' });
    await Data_Pengembalian.create({
      tanggal_pinjam: dataPinjamKunci.tanggal_pinjam,
      tanggal_kembali: dataPinjamKunci.tanggal_kembali,
      nama_pengembali: 'Peminjaman ditolak satpam',
      status_pengembalian: 'sudah dikembalikan',
      DataPeminjamanId: dataPinjamKunci.id,
    });
    if (req.user.RoleId === 7) {
      // create notification tolak kunci untuk penguna dari satpam
      await Notifications.create({
        layananId: dataPinjamKunci.id,
        jenis_notif: 'peminjaman kunci',
        deskripsi_notif: `Permintaan peminjaman kunci ${dataDetailPinjamKunci.Kunci.nama_ruangan} telah ditolak oleh satpam.`,
        tujuan_notif: dataPinjamKunci.User.id, //Id Peminjam kunci
        UserId: req.user.id,
      });
      await sendSMS(
        `Maaf peminjaman kunci telah ditolak oleh satpam. Terimakasih.`, // isi sms
        '+6281298223262' // nomor handphone yang dituju
      );
      await sendEmailNotification(
        'Peminjaman Kunci',
        userPeminjam.email,
        `<p>Peminjaman kunci yang kamu ajukan ditolak oleh satpam karena alasan tertentu, silahkan meminjam kunci yang lain atau dilain waktu. Terimakasih.</p>`
      );
      req.flash('failed', 'Peminjaman kunci berhasil ditolak.');
      res.redirect('/satpam/pinjam_kunci/validasi_pinjam_kunci');
    } else if (req.user.RoleId === 2) {
      // create notification tolak kunci  untuk penguna dari admin
      await Notifications.create({
        layananId: dataPinjamKunci.id,
        jenis_notif: 'peminjaman kunci',
        deskripsi_notif: `Permintaan peminjaman kunci ${dataDetailPinjamKunci.kunci.nama_ruangan} telah ditolak oleh admin.`,
        tujuan_notif: dataPinjamKunci.User.id, //Id peminmjam kunci
        UserId: req.user.id,
      });
      await sendSMS(
        `Maaf peminjaman kunci telah ditolak oleh satpam. Terimakasih.`, // isi sms
        '+6281298223262' // nomor handphone yang dituju
      );
      await sendEmailNotification(
        'Aduan Lapor',
        userPeminjam.email,
        `<p> Maaf peminjaman kunci telah ditolak oleh satpam. Terimakasih. </p>`
      );
      req.flash('failed', 'Peminjaman kunci berhasil ditolak.');
      res.redirect('/admin/pinjam_kunci/validasi_pinjam_kunci');
    }

    await sendSMS(
      `Maaf peminjaman kunci telah ditolak oleh satpam. Terimakasih.`, // isi sms
      '+6281298223262' // nomor handphone yang dituju
    );

    // ngirim email
    await sendEmailNotification(
      'Peminjaman Kunci',
      userPeminjam.email,
      `<p>Peminjaman kunci yang kamu ajukan ditolak oleh satpam karena alasan tertentu, silahkan meminjam kunci yang lain atau dilain waktu. Terimakasih.</p>`
    );
  } else {
    if (req.user.RoleId === 7) {
      req.flash(
        'failed',
        'Penolakan peminjaman kunci gagal! Silahkan dicoba kembali.'
      );
      res.redirect('/satpam/pinjam_kunci/validasi_pinjam_kunci');
    } else if (req.user.RoleId === 2) {
      req.flash(
        'failed',
        'Penolakan peminjaman kunci gagal! Silahkan dicoba kembali.'
      );
      res.redirect('/admin/pinjam_kunci/validasi_pinjam_kunci');
    }
  }
};

exports.validasiKembaliKunci = async (req, res) => {
  const dataPinjamKunci = await Data_Peminjaman.findOne({
    where: { id: req.body.id_peminjaman },
    include: [{ model: User }],
  });

  const dataDetailPinjamKunci = await Detail_Peminjaman.findOne({
    where: {
      DataPeminjamanId: dataPinjamKunci.id,
    },
    include: [
      { model: Kunci },
      { model: Data_Peminjaman, include: [{ model: User }] },
    ],
  });

  const dataKembaliKunci = await Data_Pengembalian.findOne({
    where: {
      DataPeminjamanId: dataPinjamKunci.id,
    },
  });

  const userPeminjam = await User.findOne({
    where: {
      id: dataPinjamKunci.UserId,
    },
  });

  const { tanggal_kembali, nama_pengembali } = req.body;
  if (dataDetailPinjamKunci.status === 'dipinjam') {
    await dataPinjamKunci.update({ status_peminjaman: 'dikembalikan' });
    await dataDetailPinjamKunci.update({ status: 'dikembalikan' });
    await dataKembaliKunci.update({
      tanggal_kembali: tanggal_kembali,
      nama_pengembali: nama_pengembali,
      status_pengembalian: 'sudah dikembalikan',
    });
    if (req.user.RoleId === 7) {
      // create notification tolak kunci  untuk penguna dari admin
      await Notifications.create({
        layananId: dataPinjamKunci.id,
        jenis_notif: 'peminjaman kunci',
        deskripsi_notif: `Pengembalian kunci ${dataDetailPinjamKunci.Kunci.nama_ruangan} telah divalidasi oleh admin.`,
        tujuan_notif: dataPinjamKunci.User.id, //Id Peminjam Kunci
        UserId: req.user.id,
      });
      await sendSMS(
        `Pengembalian kunci telah diterima oleh satpam. Terimakasih sudah menggunakan layanan ini.`, // isi sms
        '+6281298223262' // nomor handphone yang dituju
      );
      await sendEmailNotification(
        'Aduan Lapor',
        userPeminjam.email,
        `<p> Pengembalian kunci telah diterima oleh satpam. Terimakasih sudah menggunakan layanan ini. </p>`
      );
      req.flash('success', 'Pengembalian kunci berhasil divalidasi');
      res.redirect('/satpam/pinjam_kunci/validasi_kembali_kunci');
    } else if (req.user.RoleId === 2) {
      // create notification tolak kunci  untuk penguna dari admin
      await Notifications.create({
        layananId: dataPinjamKunci.id,
        jenis_notif: 'peminjaman kunci',
        deskripsi_notif: `Pengembalian kunci ${dataDetailPinjamKunci.Kunci.nama_ruangan} telah divalidasi oleh admin.`,
        tujuan_notif: dataPinjamKunci.User.id, //Id Peminjam Kunci
        UserId: req.user.id,
      });
      await sendSMS(
        `Pengembalian kunci telah diterima oleh satpam. Terimakasih sudah menggunakan layanan ini.`, // isi sms
        '+6281298223262' // nomor handphone yang dituju
      );
      await sendEmailNotification(
        'Aduan Lapor',
        userPeminjam.email,
        `<p> Pengembalian kunci telah diterima oleh satpam. Terimakasih sudah menggunakan layanan ini. </p>`
      );
      req.flash('success', 'Pengembalian kunci berhasil divalidasi');
      res.redirect('/admin/pinjam_kunci/validasi_kembali_kunci');
    }
  } else {
    if (req.user.RoleId === 7) {
      req.flash(
        'failed',
        'Validasi pengembalian kunci gagal! Silahkan dicoba kembali.'
      );
      res.redirect('/satpam/pinjam_kunci/validasi_kembali_kunci');
    } else if (req.user.RoleId === 2) {
      req.flash(
        'failed',
        'Validasi pengembalian kunci gagal! Silahkan dicoba kembali.'
      );
      res.redirect('/admin/pinjam_kunci/validasi_kembali_kunci');
    }
  }
};
