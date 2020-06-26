const { Aduan_Hilang, User } = require('./../models');

exports.getAduanKehilangan = async (req, res) => {
    if (req.user.RoleId === 1) {
        const aduan = await Aduan_Hilang.findAll({
            include: [{ model: User }],
            where: { UserId: req.user.id },
            order: [['status_aduan', 'DESC']]
        });

        res.render('karyawan/aduan_hilang/aduan_barang_hilang', { aduan, nama_user: req.user.nama_user, success: req.flash('success'), foto_user: req.user.foto_user })
    } else if (req.user.RoleId === 7) {
        const aduan = await Aduan_Hilang.findAll({
            include: [{ model: User }]
        });
        res.render('satpam/aduan_hilang/verifikasi_aduan_barang_hilang', { aduan, success: req.flash('success'), error: req.flash('error'), foto_user: req.user.foto_user })
    } else if (req.user.RoleId === 2) {
        const aduan = await Aduan_Hilang.findAll({
            include: [{ model: User }]
        });
        res.render('admin/aduan_hilang/verifikasi_aduan_barang_hilang', { aduan, success: req.flash('success'), error: req.flash('error'), foto_user: req.user.foto_user, nama_user: req.user.nama_user, })
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
    res.render('karyawan/aduan_hilang/aduan_hilang_konfirmasi_contact', { user, nama_user: req.user.nama_user, foto_user: req.user.foto_user })
};

exports.createAduanHilang = async (req, res) => {
    const { judul_aduan, deskripsi_aduan, lokasi_aduan, foto_barang } = req.body;
    if (!req.body) {
        res.status(200).send({
            msg: 'Harap isi semua kolom form yang tersedia'
        })
    } else if (judul_aduan && deskripsi_aduan) {
        const aduan = await Aduan_Hilang.create({
            judul_aduan,
            deskripsi_aduan,
            lokasi_aduan,
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
        res.redirect('/satpam/aduan_hilang');
    }

    await aduan.update({ status_aduan: "menunggu validasi admin / kasubbag" });
    req.flash('success', 'Aduan berhasil divalidasi');
    res.redirect('/satpam/aduan_hilang');
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
    res.redirect('/admin/aduan_hilang');
}

exports.validasi