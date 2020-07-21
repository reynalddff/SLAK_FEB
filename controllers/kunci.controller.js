const express = require('express');
const router = express.Router();

const { User, Kunci, Peminjaman_Kunci, Notifications } = require('../models');

exports.getAllKunci = async (req, res) => {
    const kunci = await Kunci.findAll({});
    if (req.user.RoleId === 7) {
        const notifications = await Notifications.findAll({
            where: {
                tujuan_notif: '7'
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.render('satpam/pinjam_kunci/daftar_kunci_ruangan', {
            kunci,
            notifications,
            nama_user: req.user.nama_user,
            success: req.flash('success'),
            foto_user: req.user.foto_user
        })
    } else if (req.user.RoleId === 2) {
        const notifications = await Notifications.findAll({
            where: {
                tujuan_notif: ['7', '3', '4', '5', '6']
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.render('admin/pinjam_kunci/daftar_kunci_ruangan', {
            kunci,
            notifications,
            nama_user: req.user.nama_user,
            success: req.flash('success'),
            foto_user: req.user.foto_user
        })
    }
}

exports.renderFormTambah = async (req, res) => {
    if (req.user.RoleId === 7) {
        const notifications = await Notifications.findAll({
            where: {
                tujuan_notif: '7'
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.render('satpam/pinjam_kunci/tambah_kunci', {
            notifications,
            nama_user: req.user.nama_user,
            foto_user: req.user.foto_user
        })
    } else if (req.user.RoleId === 2) {
        const notifications = await Notifications.findAll({
            where: {
                tujuan_notif: ['7', '3', '4', '5', '6']
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.render('admin/pinjam_kunci/tambah_kunci', {
            notifications,
            nama_user: req.user.nama_user,
            foto_user: req.user.foto_user
        })
    }
}

exports.tambahKunci = async (req, res) => {
    const { nama_ruangan, status_kunci } = req.body;
    const kunci = await Kunci.create({ nama_ruangan, status_kunci });
    req.flash('success', 'Kunci berhasil ditambahkan');
    if (req.user.RoleId === 7) {
        res.redirect('/satpam/pinjam_kunci/daftar_kunci')
    } else if (req.user.RoleId === 2) {
        res.redirect('/admin/pinjam_kunci/daftar_kunci')
    }
};

exports.renderFormEdit = async (req, res) => {
    const { id } = req.params;
    const kunci = await Kunci.findOne({ where: { id } });
    if (!kunci) {
        console.log('Kunci tidak ditemukan');
        if (req.user.RoleId == 7) {
            res.redirect('/satpam/pinjam_kunci/daftar_kunci')
        } else if (req.user.RoleId == 2) {
            res.redirect('/admin/pinjam_kunci/daftar_kunci')
        }
    }
    if (req.user.RoleId === 7) {
        const notifications = await Notifications.findAll({
            where: {
                tujuan_notif: '7'
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.render('satpam/pinjam_kunci/edit_kunci', {
            kunci, notifications, nama_user: req.user.nama_user, foto_user: req.user.foto_user
        })
    } else if (req.user.RoleId === 2) {
        const notifications = await Notifications.findAll({
            where: {
                tujuan_notif: ['7', '3', '4', '5', '6']
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.render('admin/pinjam_kunci/edit_kunci', {
            kunci, nama_user: req.user.nama_user, foto_user: req.user.foto_user, notifications
        })
    }
}

exports.updateKunci = async (req, res) => {
    const { nama_ruangan, status_kunci } = req.body;
    const { id } = req.params;
    const kunci = await Kunci.findOne({ where: { id } });
    if (!kunci) {
        if (req.user.RoleId == 7) {
            res.redirect('/satpam/pinjam_kunci/daftar_kunci')
        } else if (req.user.RoleId == 2) {
            res.redirect('/admin/pinjam_kunci/daftar_kunci')
        }
    }
    await kunci.update({ nama_ruangan, status_kunci });
    req.flash('success', 'Kunci berhasil diupdate');
    if (req.user.RoleId == 7) {
        res.redirect('/satpam/pinjam_kunci/daftar_kunci')
    } else if (req.user.RoleId == 2) {
        res.redirect('/admin/pinjam_kunci/daftar_kunci')
    }
}

exports.deleteKunci = async (req, res) => {
    const { id } = req.params;
    const kunci = await Kunci.findOne({ where: { id } });
    if (!kunci) {
        if (req.user.RoleId == 7) {
            res.redirect('/satpam/pinjam_kunci/daftar_kunci')
        } else if (req.user.RoleId == 2) {
            res.redirect('/admin/pinjam_kunci/daftar_kunci')
        }
    }

    await kunci.destroy();
    if (req.user.RoleId == 7) {
        res.redirect('/satpam/pinjam_kunci/daftar_kunci')
    } else if (req.user.RoleId == 2) {
        res.redirect('/admin/pinjam_kunci/daftar_kunci')
    }
}