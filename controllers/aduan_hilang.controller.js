const { Aduan_Hilang, User, Notifications } = require('./../models');
const { Op } = require('sequelize')

exports.getAduanKehilangan = async (req, res) => {
    if (req.user.RoleId === 1) {
        const aduan = await Aduan_Hilang.findAll({
            include: [{ model: User }],
            where: { UserId: req.user.id },
            order: [['status_aduan', 'DESC']]
        });

        const notifications = await Notifications.findAll({
            where: {
                tujuan_notif: req.user.id
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });

        res.render('karyawan/aduan_hilang/aduan_barang_hilang', { aduan, notifications, nama_user: req.user.nama_user, success: req.flash('success'), foto_user: req.user.foto_user })
    } else if (req.user.RoleId === 7) {
        const aduan = await Aduan_Hilang.findAll({
            include: [{ model: User }]
        });
        const notifications = await Notifications.findAll({
            where: {
                tujuan_notif: '7'
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.render('satpam/aduan_hilang/verifikasi_aduan_barang_hilang', { aduan, notifications, success: req.flash('success'), error: req.flash('error'), foto_user: req.user.foto_user })
    } else if (req.user.RoleId === 2) {
        const aduan = await Aduan_Hilang.findAll({
            include: [{ model: User }]
        });

        const notifications = await Notifications.findAll({
            where: {
                [Op.or]: [{ tujuan_notif: '3' }, { tujuan_notif: '7' }]
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.render('admin/aduan_hilang/verifikasi_aduan_barang_hilang', { aduan, notifications, success: req.flash('success'), error: req.flash('error'), foto_user: req.user.foto_user, nama_user: req.user.nama_user, })
    }
}

exports.getAduanKehilangan2 = async (req, res) => {
    if (req.user.RoleId === 2) {
        const aduan = await Aduan_Hilang.findAll({
            include: [{ model: User }]
        });

        const notifications = await Notifications.findAll({
            where: {
                [Op.or]: [{ tujuan_notif: '3' }, { tujuan_notif: '7' }]
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });

        res.render('admin/aduan_hilang/validasi_aduan_barang_hilang', { aduan, notifications, success: req.flash('success'), error: req.flash('error'), foto_user: req.user.foto_user, nama_user: req.user.nama_user, })
    }
}

exports.updateContactProfile3 = async (req, res) => {
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
        res.redirect('/karyawan/aduan_hilang/form')
    } catch (error) {
        res.send({ error })
    }
}

exports.getContactProfile3 = async (req, res) => {
    const user = await User.findOne({
        where: {
            id: req.user.id
        }
    });

    const notifications = await Notifications.findAll({
        where: {
            tujuan_notif: req.user.id
        },
        order: [
            ['createdAt', 'DESC']
        ]
    });
    res.render('karyawan/aduan_hilang/aduan_hilang_konfirmasi_contact', { user, notifications, nama_user: req.user.nama_user, foto_user: req.user.foto_user })
};

exports.createAduanHilang = async (req, res) => {
    const { judul_aduan, deskripsi_aduan, lokasi_aduan } = req.body;
    if (!req.body) {
        res.status(200).send({
            msg: 'Harap isi semua kolom form yang tersedia'
        })
    } else if (judul_aduan && deskripsi_aduan) {

        const aduan = await Aduan_Hilang.create({
            judul_aduan,
            deskripsi_aduan,
            lokasi_aduan,
            latitude: req.body.lat,
            longitude: req.body.long,
            foto_barang: req.file === undefined ? '' : req.file.filename,
            UserId: req.user.id
        });

        // create notifications untuk satpam
        await Notifications.create({
            layananId: aduan.id,
            jenis_notif: 'aduan barang hilang',
            deskripsi_notif: `Permintaan validasi aduan barang hilang dari ${req.user.nama_user}`,
            tujuan_notif: '7', //Role Id Satpam
            UserId: req.user.id
        });

        req.flash('success', 'Aduan berhasil ditambahkan')
        res.redirect('/karyawan/aduan_hilang')
    }

};

exports.validasiSatpamAduan = async (req, res) => {
    const { id } = req.params;
    const aduan = await Aduan_Hilang.findOne({ where: { id } });
    if (!aduan) {
        req.flash('error', 'Aduan tidak ditemukan');
        if (req.user.RoleId === 2) {
            res.redirect('/satpam/aduan_hilang');
        } else if (req.user.RoleId === 7) {
            res.redirect('/admin/aduan_hilang');
        }
    }

    await aduan.update({ status_aduan: "menunggu validasi admin / kasubbag" });
    req.flash('success', 'Aduan berhasil divalidasi');
    if (req.user.RoleId === 2) {
        res.redirect('/admin/aduan_hilang');
    } else if (req.user.RoleId === 7) {
        res.redirect('/satpam/aduan_hilang');
    }
}

exports.validasiAdminAduan = async (req, res) => {
    const { id } = req.params;
    const aduan = await Aduan_Hilang.findOne({ where: { id } });
    if (!aduan) {
        req.flash('error', 'Aduan tidak ditemukan');
        res.redirect('/admin/aduan_hilang');
    }

    await aduan.update({ status_aduan: "divalidasi" });
    req.flash('success', 'Aduan berhasil divalidasi');
    if (req.user.RoleId === 2) {
        res.redirect('/admin/aduan_hilang/validasi_admin');
    } else if (req.user.RoleId === 8) {
        res.redirect('/kasubbag/aduan_hilang/validasi_admin');
    }
}

exports.deleteAduanHilang = async (req, res) => {
    const aduan = await Aduan_Hilang.findOne({
        where: { id: req.params.id }
    });
    await aduan.destroy({});
    if (req.user.RoleId === 1) {
        res.redirect('/karyawan/aduan_hilang')
    } else if (req.user.RoleId === 2) {
        res.redirect('/admin/aduan_hilang')
    } else if (req.user.RoleId === 7) {
        res.redirect('/satpam/aduan_hilang')
    }
}