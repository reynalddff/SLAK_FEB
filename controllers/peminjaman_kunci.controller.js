const { User, Kunci, Peminjaman_Kunci, Notifications } = require('./../models');
const Op = require('sequelize').Op;
const moment = require('moment')

require('express-async-errors');

exports.getPeminjamanKunci = async (req, res) => {
    const kunci = await Kunci.findAll({
        include: [{ model: Peminjaman_Kunci }],
        order: [['nama_ruangan', 'ASC']]
    });

    const kunciDipinjam = await Peminjaman_Kunci.findOne({
        include: [{ model: User }, { model: Kunci }],
        where: {
            UserId: req.user.id,
            status_peminjaman: "dipinjam"
        }
    });

    const menungguValidasi = await Peminjaman_Kunci.findOne({
        include: [{ model: User }, { model: Kunci }],
        where: {
            UserId: req.user.id,
            status_peminjaman: "menunggu validasi"
        }
    });

    const riwayatMinjamKunci = await Peminjaman_Kunci.findAll({
        include: [{ model: User }, { model: Kunci }],
        order: [['tanggal_pinjam', 'DESC'], ['status_peminjaman', 'DESC']],
        where: {
            UserId: req.user.id
        }
    })

    const notifications = await Notifications.findAll({
        where: {
            tujuan_notif: req.user.id
        }
    });

    res.render('karyawan/pinjam_kunci/pinjam_kunci', {
        kunci,
        kunciDipinjam,
        menungguValidasi,
        riwayatMinjamKunci,
        notifications,
        nama_user: req.user.nama_user,
        success: req.flash('success'),
        failed: req.flash('failed'),
        foto_user: req.user.foto_user
    })
};

// exports.getKunciTersedia = async (req, res) => {

// }

exports.getContactProfile2 = async (req, res) => {
    const id = req.params.id;

    const user = await User.findOne({
        where: {
            id: req.user.id
        }
    });

    const notifications = await Notifications.findAll({
        where: {
            tujuan_notif: req.user.id
        }
    });

    res.render('karyawan/pinjam_kunci/pinjam_kunci_konfirmasi_contact', {
        user,
        notifications,
        nama_user: req.user.nama_user,
        idKunci: id,
        foto_user: req.user.foto_user
    })
};

exports.updateContactProfile2 = async (req, res) => {
    const id = req.params.id;
    const { telp_user, email } = req.body;
    try {
        const user = await User.findOne({
            where: {
                id: req.user.id
            }
        });
        user.update({
            telp_user,
            email
        })
        res.redirect(`/karyawan/pinjam_kunci/form/${id}`)
    } catch (error) {
        res.send({ error })
    }
}

exports.pinjamKunci = async (req, res) => {
    const kunci = await Kunci.findOne({
        where: {
            id: req.params.id
        }
    });

    if (kunci.status_kunci === 'tersedia') {
        // update status kunci
        kunci.update({ status_kunci: "dipinjam" });
        // pinjam kunci
        const pinjam_kunci = await Peminjaman_Kunci.create({
            tanggal_pinjam: req.body.start_date,
            tanggal_kembali: req.body.end_date,
            keperluan: req.body.keperluan,
            status_peminjaman: "menunggu validasi",
            UserId: req.user.id,
            KunciId: req.params.id
        });

        // create notifications untuk satpam
        await Notifications.create({
            layananId: pinjam_kunci.id,
            jenis_notif: 'peminjaman kunci',
            deskripsi_notif: `Permintaan peminjaman kunci ${kunci.nama_ruangan} dari ${req.user.nama_user}`,
            tujuan_notif: '7', //Role Id Satpam
            UserId: req.user.id
        });

        req.flash('success', 'Peminjaman kunci berhasil diajukan. Silahkan menunggu validasi dari Satpam')
        res.redirect('/karyawan/pinjam_kunci')
    } else {
        req.flash('failed', 'Peminjaman gagal diajukan. Kunci sedang tidak tersedia, silahkan pinjam besok.')
        res.redirect('/karyawan/pinjam_kunci')
    }

}

// buat satpam
exports.validasiPinjamKunci = async (req, res) => {
    const pinjam_kunci = await Peminjaman_Kunci.findOne({ where: { id: req.params.id } });
    const kunci = await Kunci.findOne({ where: { id: pinjam_kunci.KunciId } });
    const userPinjamKunci = await User.findOne({ where: { id: pinjam_kunci.UserId } })
    if (!pinjam_kunci) {
        return res.status(200).send({
            msg: 'peminjaman kunci yang dicari tidak ditemukan'
        });
    }
    if (pinjam_kunci.status_peminjaman === 'menunggu validasi') {

        const update = await pinjam_kunci.update({
            status_peminjaman: 'dipinjam'
        });

        await kunci.update({ status_kunci: "dipinjam" });

        if (req.user.RoleId === 7) {
            // create notification validasi kunci untuk penguna dari satpam
            await Notifications.create({
                layananId: pinjam_kunci.id,
                jenis_notif: 'peminjaman kunci',
                deskripsi_notif: `Permintaan peminjaman kunci ${kunci.nama_ruangan} telah divalidasi oleh satpam.`,
                tujuan_notif: userPinjamKunci.id, //Id Peminjam kunci
                UserId: req.user.id
            });
            req.flash('success', 'Peminjaman kunci berhasil divalidasi');
            res.redirect('/satpam/pinjam_kunci/validasi_pinjam_kunci');
        } else if (req.user.RoleId === 2) {
            // create notification validasi kunci untuk penguna dari admin
            await Notifications.create({
                layananId: pinjam_kunci.id,
                jenis_notif: 'peminjaman kunci',
                deskripsi_notif: `Permintaan peminjaman kunci ${kunci.nama_ruangan} telah divalidasi oleh admin.`,
                tujuan_notif: userPinjamKunci.id, //Rd Peminjam Kunci
                UserId: req.user.id
            });
            req.flash('success', 'Peminjaman kunci berhasil divalidasi');
            res.redirect('/admin/pinjam_kunci/validasi_pinjam_kunci');
        }
    } else {
        res.status(200).send({
            status: 'Failed',
            msg: 'Hanya bisa memvalidasi dengan status "menunggu validasi" ',
        })
    }
}

exports.tolakPinjamKunci = async (req, res) => {
    const pinjam_kunci = await Peminjaman_Kunci.findOne({ where: { id: req.params.id } });
    const kunci = await Kunci.findOne({ where: { id: pinjam_kunci.KunciId } });
    const userPinjamKunci = await User.findOne({ where: { id: pinjam_kunci.UserId } })
    if (!pinjam_kunci) {
        return res.status(200).send({
            msg: 'peminjaman kunci yang dicari tidak ditemukan'
        });
    }
    if (pinjam_kunci.status_peminjaman === 'menunggu validasi') {
        const update = await pinjam_kunci.update({
            status_peminjaman: "dikembalikan"
        });
        await kunci.update({ status_kunci: "tersedia" });
        if (req.user.RoleId === 7) {
            // create notification tolak kunci untuk penguna dari satpam
            await Notifications.create({
                layananId: pinjam_kunci.id,
                jenis_notif: 'peminjaman kunci',
                deskripsi_notif: `Permintaan peminjaman kunci ${kunci.nama_ruangan} telah ditolak oleh satpam.`,
                tujuan_notif: userPinjamKunci.id, //Id Peminjam kunci
                UserId: req.user.id
            });
            req.flash('failed', 'Peminjaman kunci berhasil ditolak.')
            res.redirect('/satpam/pinjam_kunci/validasi_pinjam_kunci');
        } else if (req.user.RoleId === 2) {
            // create notification tolak kunci  untuk penguna dari admin
            await Notifications.create({
                layananId: pinjam_kunci.id,
                jenis_notif: 'peminjaman kunci',
                deskripsi_notif: `Permintaan peminjaman kunci ${kunci.nama_ruangan} telah ditolak oleh admin.`,
                tujuan_notif: userPinjamKunci.id, //Id peminmjam kunci
                UserId: req.user.id
            });
            req.flash('failed', 'Peminjaman kunci berhasil ditolak.')
            res.redirect('/admin/pinjam_kunci/validasi_pinjam_kunci');
        }
    } else {
        res.status(200).send({
            status: 'Failed',
            msg: 'Hanya bisa memvalidasi dengan status "menunggu validasi" ',
        })
    }
}

exports.validasiKembaliKunci = async (req, res) => {
    const pinjam_kunci = await Peminjaman_Kunci.findOne({ where: { id: req.params.id } });
    const kunci = await Kunci.findOne({ where: { id: pinjam_kunci.KunciId } });
    const userPinjamKunci = await User.findOne({ where: { id: pinjam_kunci.UserId } })
    if (!pinjam_kunci) {
        return res.status(200).send({
            msg: 'peminjaman kunci yang dicari tidak ditemukan'
        });
    }
    await kunci.update({ status_kunci: 'tersedia' });
    await pinjam_kunci.update({ status_peminjaman: 'dikembalikan' });
    if (req.user.RoleId === 7) {
        // create notification tolak kunci  untuk penguna dari admin
        await Notifications.create({
            layananId: pinjam_kunci.id,
            jenis_notif: 'peminjaman kunci',
            deskripsi_notif: `Pengembalian kunci ${kunci.nama_ruangan} telah divalidasi oleh admin.`,
            tujuan_notif: userPinjamKunci.id, //Id Peminjam Kunci
            UserId: req.user.id
        });
        req.flash('success', 'Pengembalian kunci berhasil divalidasi');
        res.redirect('/satpam/pinjam_kunci/validasi_kembali_kunci');
    } else if (req.user.RoleId === 2) {
        // create notification tolak kunci  untuk penguna dari admin
        await Notifications.create({
            layananId: pinjam_kunci.id,
            jenis_notif: 'peminjaman kunci',
            deskripsi_notif: `Pengembalian kunci ${kunci.nama_ruangan} telah divalidasi oleh admin.`,
            tujuan_notif: userPinjamKunci.id, //Id Peminjam Kunci
            UserId: req.user.id
        });
        req.flash('success', 'Pengembalian kunci berhasil divalidasi');
        res.redirect('/admin/pinjam_kunci/validasi_kembali_kunci');
    }
}