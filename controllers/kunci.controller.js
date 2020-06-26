const express = require('express');
const router = express.Router();

const { User, Kunci, Peminjaman_Kunci } = require('../models');

exports.getAllKunci = async (req, res) => {
    const kunci = await Kunci.findAll({});
    res.render('satpam/pinjam_kunci/daftar_kunci_ruangan', {
        kunci,
        nama_user: req.user.nama_user,
        success: req.flash('success'),
        foto_user: req.user.foto_user
    })
}

exports.renderFormTambah = async (req, res) => {
    res.render('satpam/pinjam_kunci/tambah_kunci', { nama_user: req.user.nama_user, foto_user: req.user.foto_user })
}

exports.tambahKunci = async (req, res) => {
    const { nama_ruangan, status_kunci } = req.body;
    // if (!req.body) {
    //     console.log('Isi form harus diisi')
    //     res.redirect('/satpam/pinjam_kunci/daftar_kunci')
    // }
    const kunci = await Kunci.create({ nama_ruangan, status_kunci });
    req.flash('success', 'Kunci berhasil ditambahkan')
    res.redirect('/satpam/pinjam_kunci/daftar_kunci')
};

exports.renderFormEdit = async (req, res) => {
    const { id } = req.params;
    const kunci = await Kunci.findOne({ where: { id } });
    if (!kunci) {
        console.log('Kunci tidak ditemukan')
        res.redirect('/satpam/pinjam_kunci/daftar_kunci')
    }
    res.render('satpam/pinjam_kunci/edit_kunci', { kunci, nama_user: req.user.nama_user, })
}

exports.updateKunci = async (req, res) => {
    const { nama_ruangan, status_kunci } = req.body;
    const { id } = req.params;
    const kunci = await Kunci.findOne({ where: { id } });

    if (!kunci) {
        res.redirect('/satpam/pinjam_kunci/daftar_kunci');
    }

    await kunci.update({ nama_ruangan, status_kunci });
    req.flash('success', 'Kunci berhasil diupdate')
    res.redirect('/satpam/pinjam_kunci/daftar_kunci');
}

exports.deleteKunci = async (req, res) => {
    const { id } = req.params;
    const kunci = await Kunci.findOne({ where: { id } });
    if (!kunci) {
        return res.redirect('/satpam/pinjam_kunci/daftar_kunci');
    }

    await kunci.destroy();
    return res.redirect('/satpam/pinjam_kunci/daftar_kunci');
}