const { User, Aduan_Lapor, Komentar, Tanggap_Lapor } = require('./../models');
const Op = require('sequelize').Op;

require('express-async-errors');

// Karyawan / Pegawai /  Dosen & ADmin
exports.getAllAduan = async (req, res) => {
    if (req.user.RoleId === 2) {
        // admin
        const aduans = await Aduan_Lapor.findAll({
            include: [
                { model: User }, { model: Komentar }
            ],
            order: [
                ['status_aduan', 'ASC']
            ]
        });

        res.render('admin/aduan_lapor/aduan_lapor', { aduans, nama_user: req.user.nama_user, success: req.flash('success'), foto_user: req.user.foto_user });
    } else if (req.user.RoleId === 1) {
        //karyawan
        const aduans = await Aduan_Lapor.findAll({
            include: [
                { model: User }, { model: Komentar }
            ],
            where: {
                UserId: req.user.id
            },
            order: [
                ['status_aduan', 'ASC']
            ]
        });

        res.render('karyawan/aduan_lapor/aduan_lapor', { aduans, nama_user: req.user.nama_user, success: req.flash('success'), foto_user: req.user.foto_user })
    }
}

exports.createAduan = async (req, res) => {
    const { judul_aduan, lokasi_aduan, deskripsi_aduan, tujuan_aduan } = req.body;
    if (judul_aduan && deskripsi_aduan) {
        const aduan = await Aduan_Lapor.create({
            judul_aduan,
            lokasi_aduan,
            deskripsi_aduan,
            tujuan_aduan,
            status_aduan: "belum",
            UserId: req.user.id
        });
        await Komentar.create({
            deskripsi_komentar: "belum ada",
            nilai_komentar: "0",
            AduanLaporId: aduan.id,
            UserId: req.user.id
        })
        req.flash('success', 'Aduan berhasil ditambahkan')
        res.redirect('/karyawan/aduan_lapor')
    }
    // console.log(`isi dulu goblok form aduannya`)
}

exports.updateContactProfile = async (req, res) => {
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
        res.redirect('/karyawan/aduan_lapor/form')
    } catch (error) {
        res.send({ error })
    }
}

exports.getContactProfile = async (req, res) => {
    const user = await User.findOne({
        where: {
            id: req.user.id
        }
    });
    res.render('karyawan/aduan_lapor/aduan_lapor_konfirmasi_contact', { user, nama_user: req.user.nama_user, foto_user: req.user.foto_user })
}

// Operator & Admin
exports.getAduanByTujuan = (req, res) => {
    const filterByTujuan = async (RoleId) => {
        if (req.user.RoleId === RoleId) {
            const aduans = await Aduan_Lapor.findAll({
                include: [{ model: User }, { model: Komentar }],
                where: {
                    tujuan_aduan: RoleId
                }
            });

            res.render('operator/aduan_lapor/aduan_lapor', {
                aduans,
                nama_user: req.user.nama_user,
                foto_user: req.user.foto_user,
                success: req.flash('success')
            });
        }
    }

    filterByTujuan(req.user.RoleId)
}

exports.getAduan = async (req, res) => {
    const aduan = await Aduan_Lapor.findOne({
        include: User,
        where: {
            id: req.params.id
        }
    });
    if (req.user.RoleId === 2) {
        res.render('admin/aduan_lapor/aduan_lapor_edit_status', { aduan, nama_user: req.user.nama_user, foto_user: req.user.foto_user })
    } else {
        res.render('operator/aduan_lapor/aduan_lapor_edit_status', { aduan, nama_user: req.user.nama_user, foto_user: req.user.foto_user, })
    }
}

exports.deleteAduan = async (req, res) => {
    const aduan = await Aduan_Lapor.findOne({
        where: { id: req.params.id }
    });
    await aduan.destroy();
    if (req.user.RoleId === 1) {
        res.redirect('/karyawan/aduan_lapor')
    } else if (req.user.RoleId === 2) {
        res.redirect('/admin/aduan_lapor')
    }
}

exports.tanggapAduan = async (req, res) => {
    const { tanggapan_aduan } = req.body
    const aduan = await Aduan_Lapor.findOne({
        where: {
            id: req.params.id
        }
    });
    if (!aduan) {
        return res.status(200).send({
            msg: 'aduan yang dicari tidak ditemukan'
        })
    }

    const updateAduan = await aduan.update({
        tanggapan_aduan,
        status_aduan: 'sudah'
    });

    if (req.user.RoleId === 2) {
        req.flash('success', 'Aduan berhasil ditanggapi')
        res.redirect('/admin/aduan_lapor')
    } else {
        req.flash('success', 'Aduan berhasil ditanggapi')
        res.redirect('/operator/aduan_lapor')
    }
}
