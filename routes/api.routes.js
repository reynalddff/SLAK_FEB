const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');
const sequelize = require('sequelize');
const QRcode = require('qrcode')

const { User, Aduan_Lapor, Role, Komentar, Kunci, Peminjaman_Kunci, Aduan_Hilang, Notifications } = require('../models');
const { Op } = require('sequelize')

const moment = require('moment')

require('express-async-errors');

router.get('/geolocation', async (req, res) => {
    const url = "http://localhost:3000/karyawan";
    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json({ data });
    } catch (error) {
        console.log(error);
    }
})

router.get('/roles', async (req, res) => {
    const role = await Role.findAll({});
    res.status(200).json({
        role: role[1].id
    });
});

// Notification
router.get('/notifications', async (req, res) => {
    const notifications = await Notifications.findAll({
        where: {
            [Op.or]: [{ tujuan_notif: '3' }, { tujuan_notif: '7' }]
        }
    })
    res.status(200).json({
        notifications
    });
});

router.delete('/notifications', async (req, res) => {
    const notif = await Notifications.destroy({ truncate: true });
    res.status(200).json({
        success: 'success',
        notif
    })
})

// api users
router.get('/users', async (req, res) => {
    const user = await Role.findAll({
        include: User
    })
    res.status(200).json({
        user
    })
});

router.post('/users', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(200).json({
            user
        })
    } catch (error) {
        res.send({
            error
        })
    }
});

router.delete('/user/:id', async (req, res) => {
    const user = await User.findOne({
        where: {
            id: req.params.id
        }
    });

    if (user) {
        const deleted = await user.destroy();
        if (deleted) {
            res.status(200).json({
                msg: 'User berhasil di hapus'
            })
        }
    }

    res.status(404).json({
        msg: 'User tidak ditemukan'
    })
});
router.patch('/user/:id', async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({
            where: {
                id: req.params.id
            }
        });
        if (user) {
            const salt = bcrypt.genSaltSync(10);
            const passwordHash = bcrypt.hashSync(password, salt);
            const userUpdated = await user.update({
                username,
                password: passwordHash
            })
            res.status(200).json({
                msg: 'berhasil update',
                userUpdated
            })
        }
    } catch (error) {
        res.json({ error: error.errors[0].message })
    }
});

// router.get('/:id', (req, res) => { });

// api aduan lapor
router.get('/aduan', async (req, res) => {
    const aduan = await Aduan_Lapor.findAll({
        include: [
            { model: User }, { model: Komentar }
        ]
    });
    if (!aduan.length) {
        return res.status(200).json({
            msg: 'success',
            aduan: 'Data aduan is empty'
        })
    }
    res.status(200).send({
        msg: 'Success',
        aduan
    })
});

// get aduan by month
router.get('/aduanByMonth/:id', async (req, res) => {
    const aduan = await Aduan_Lapor.findAll({
        attributes: [
            [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'date'],
            [sequelize.fn('count', '*'), 'count']
        ],
        group: [
            sequelize.col('date')
        ],
        where: {
            tujuan_aduan: req.params.id
        }
    })

    const dataByMonth = {
        july: aduan[0]
    }

    res.send({ dataByMonth })
});

// get aduan by month - admin
router.get('/aduanByTujuan', async (req, res) => {
    const aduanOperatorUmum = await Aduan_Lapor.findAndCountAll({
        where: {
            tujuan_aduan: 3
        }
    });

    const aduanOperatorAkademik = await Aduan_Lapor.findAndCountAll({
        where: {
            tujuan_aduan: 4
        }
    });

    const aduanOperatorKeuangan = await Aduan_Lapor.findAndCountAll({
        where: {
            tujuan_aduan: 5
        }
    });

    const aduanOperatorKemahasiswaan = await Aduan_Lapor.findAndCountAll({
        where: {
            tujuan_aduan: 6
        }
    });

    res.send({ umum: aduanOperatorUmum.count, akademik: aduanOperatorAkademik.count, keuangan: aduanOperatorKeuangan.count, kemahasiswaan: aduanOperatorKemahasiswaan.count })
});

router.post('/aduan', async (req, res) => {
    const { judul_aduan, deskripsi_aduan, lokasi_aduan, tujuan_aduan, foto_aduan, UserId } = req.body

    if (!req.body) {
        res.status(200).send({
            msg: 'Harap isi semua kolom form yang tersedia'
        })
    }

    const aduan = await Aduan_Lapor.create({
        judul_aduan,
        deskripsi_aduan,
        lokasi_aduan,
        tujuan_aduan,
        foto_aduan,
        status_aduan: "belum",
        UserId
    });

    const notification = await Notifications.create({
        jenis_notif: 'aduan layanan',
        deskripsi_notif: 'Telah masuk pengajuan aduan layanan dari "nama user"',
        UserId
    })

    res.status(201).send({
        msg: 'Berhasil menambahkan aduan',
        aduan,
        notification
    });

});

router.get('/aduan/:id', async (req, res) => {
    const aduan = await Aduan_Lapor.findOne({
        include: User,
        where: {
            id: req.params.id
        }
    });
    if (!aduan) {
        res.status(200).send({
            msg: 'Aduan tidak ditemukan'
        })
    }

    res.status(201).send({
        msg: 'Aduan ditemukan',
        aduan
    })
});

router.patch('/aduan/:id/selsai', async (req, res) => {
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
        status_aduan: "sudah"
    });
    res.status(200).send({
        msg: 'Berhasil update',
        aduan: updateAduan
    })

});

router.delete('/aduan/:id', async (req, res) => {
    const aduan = await Aduan_Lapor.findOne({
        where: {
            id: req.params.id
        }
    });

    if (aduan) {
        const deleted = await aduan.destroy();
        if (deleted) {
            res.status(200).json({
                msg: 'Aduan berhasil di hapus'
            })
        }
    }

    res.status(404).json({
        msg: 'Aduan tidak ditemukan'
    })
})

// api komentar
router.get('/komentar', async (req, res) => {
    const komentar = await Komentar.findAll({
        include: [
            { model: User }, { model: Aduan_Lapor }
        ]
    });

    if (!komentar.length) {
        return res.status(200).json({
            msg: 'success',
            aduan: 'Data Komentar is empty'
        })
    }

    res.status(200).send({
        msg: 'Success',
        data: komentar.length,
        komentar
    });
});

router.get('/komentar/:id', async (req, res) => {
    const komentar = await Komentar.findOne({
        where: {
            AduanLaporId: req.params.id
        }
    });
    if (!komentar) {
        res.status(200).json({
            msg: 'Aduan tidak ditemukan'
        })
    }

    res.status(200).json({
        komentar
    });
})

router.post('/komentar', async (req, res) => {
    const { deskripsi_komentar, nilai_komentar, UserId, AduanLaporId } = req.body;
    if (!req.body) {
        res.status(200).send({
            msg: 'Harap isi semua kolom form yang tersedia'
        })
    }

    const komentar = await Komentar.create({
        deskripsi_komentar, nilai_komentar, UserId, AduanLaporId
    })

    res.status(201).send({
        msg: 'Berhasil menambahkan aduan',
        komentar
    });
});

router.delete('/komentar/:id', async (req, res) => {
    const komentar = await Komentar.findOne({
        where: {
            id: req.params.id
        }
    });

    const deleted = await komentar.destroy();

    if (deleted) {
        res.status(200).json({
            msg: 'Aduan berhasil di hapus'
        })
    }

    res.status(404).json({
        msg: 'User tidak ditemukan'
    })
})

// api kunci
router.get('/kunci', async (req, res) => {
    const kunci = await Kunci.findAll({
        order: [
            ['status_kunci', 'ASC']
        ],
        include: Peminjaman_Kunci
    });

    if (!kunci.length) {
        return res.status(200).json({
            msg: 'success',
            aduan: 'Data kunci is empty'
        })
    }

    res.status(200).send({
        msg: 'Success',
        data: kunci.length,
        kunci
    });
});

router.post('/kunci', async (req, res) => {
    const { nama_ruangan, status_kunci } = req.body
    if (!req.body) {
        res.status(200).send({
            msg: 'Harap isi semua kolom form yang tersedia'
        })
    }
    const kunci = await Kunci.create({
        nama_ruangan,
        status_kunci
    });

    res.status(201).send({
        msg: 'Berhasil menambahkan Kunci',
        kunci
    });
});

router.patch('/kunci/:id', async (req, res) => {
    const { nama_ruangan, status_kunci } = req.body
    const kunci = await Kunci.findOne({
        where: {
            id: req.params.id
        }
    });
    if (!kunci) {
        return res.status(200).send({
            msg: 'kunci yang dicari tidak ditemukan'
        })
    }

    const updateKunci = await kunci.update({
        nama_ruangan, status_kunci
    });

    res.status(200).send({
        msg: 'Berhasil update',
        aduan: updateKunci
    })
});

router.delete('/kunci/:id', async (req, res) => {
    const kunci = await Kunci.findOne({
        where: {
            id: req.params.id
        }
    });

    if (kunci) {
        const deleted = await kunci.destroy();
        if (deleted) {
            res.status(200).json({
                msg: 'Kunci berhasil di hapus'
            })
        }
    }

    res.status(404).json({
        msg: 'Kunci tidak ditemukan'
    })
});

// pinjam kunci
router.get('/cari_kunci_by_date', async (req, res) => {
    const pinjamKunci = await Peminjaman_Kunci.findAll({
        include: {
            model: Kunci,
            where: {
                // nama_ruangan: ['Ruang Pertemuan 1', 'Ruang Rapat 2'],
                status_kunci: 'tersedia'
            }
        },
    });

    const kunciDipinjam = await Kunci.findAll({
        include: {
            model: Peminjaman_Kunci,
            // where: {
            //     // [Op.not]: {
            //     //     tanggal_pinjam: '2020-07-19',
            //     //     status_peminjaman: 'dipinjam'
            //     // }
            //     tanggal_pinjam: '2020-07-19',
            // }
        },
        where: {
            status_kunci: 'dipinjam'
        }
    });

    const result = kunciDipinjam.map(kunci => ({ nama_ruangan: kunci.nama_ruangan }));
    console.log(result);
    res.json({ kunciDipinjam });

    // return result.forEach(async ({ nama_ruangan }) => {
    //     const arrayKunci = [];
    //     arrayKunci.push(nama_ruangan)
    //     // const kunciTersedia = await Kunci.findAll({
    //     //     where: {
    //     //         nama_ruangan: [result.nama_ruangan]
    //     //     },
    //     //     raw: true
    //     // });
    //     console.log(arrayKunci)
    //     res.json({ arrayKunci, kunciDipinjam });
    // })

})

router.get('/pinjam_kunci', async (req, res) => {
    const peminjaman_kunci = await Peminjaman_Kunci.findAll({
        include: [
            { model: User }, { model: Kunci }
        ],
        where: {
            [Op.not]: {
                tanggal_pinjam: '2020-07-19'
            }
        }
    });

    if (!peminjaman_kunci.length) {
        return res.status(200).json({
            msg: 'success',
            data: 'Data peminjaman is empty'
        })
    }

    res.status(200).send({
        msg: 'Success',
        data: peminjaman_kunci.length,
        peminjaman_kunci
    });
});

router.get('/pinjam_kunci/:id', async (req, res) => {
    const riwayatMinjamKunci = await Peminjaman_Kunci.findAll({
        where: {
            UserId: req.params.id,
        },
    });

    if (!riwayatMinjamKunci.length) {
        return res.status(200).json({
            msg: 'success',
            aduan: 'Data peminjaman is empty'
        })
    }

    res.status(200).send({
        msg: 'Success',
        data: riwayatMinjamKunci.length,
        riwayatMinjamKunci
    });
})

router.post('/pinjam_kunci', async (req, res) => {
    const { tanggal_pinjam, tanggal_kembali, status_peminjaman, KunciId, UserId } = req.body;
    if (!KunciId) {
        res.status(200).send({
            msg: 'Harap isi kunci untuk yang dipinjam'
        })
    };

    const kunci = await Kunci.findOne({
        where: { id: KunciId }
    });

    if (kunci.status_kunci === "tersedia") {
        // kunci.update({ status_kunci: "dipinjam" })
        const pinjam_kunci = await Peminjaman_Kunci.create({
            tanggal_pinjam: new Date(),
            tanggal_kembali: moment().add(1, "d"),
            status_peminjaman: "menunggu validasi",
            UserId,
            KunciId
        });

        res.status(201).send({
            msg: 'Silahkan menunggu validasi peminjaman dari satpam. Terimakasih!',
            pinjam_kunci
        })
    } else {
        res.status(200).send({
            status: 'Failed',
            msg: 'Kunci tidak bisa dipinjam',
        })
    }
});

router.patch('/validasi_kunci/:id', async (req, res) => {
    const pinjamKunci = await Peminjaman_Kunci.findOne({ where: { id: req.params.id } });
    const kunci = await Kunci.findOne({
        where: { id: pinjamKunci.KunciId }
    });
    if (pinjamKunci.status_peminjaman === 'menunggu validasi') {
        const update = await pinjamKunci.update({
            status_peminjaman: 'dipinjam'
        });
        await kunci.update({ status_kunci: "dipinjam" })
        res.status(201).send({
            msg: 'Peminjaman sudah divalidasi. Anda bisa ambil kunci di ruang satpam. Terimakasih!',
            update
        });
    } else {
        res.status(200).send({
            status: 'Failed',
            msg: 'Hanya bisa memvalidasi dengan status "menunggu validasi" ',
        })
    }
})

router.patch('/kembali_kunci/:id', async (req, res) => {
    const { status_peminjaman } = req.body;

    const peminjaman_kunci = await Peminjaman_Kunci.findOne({ where: { id: req.params.id } });

    const kunci = await Kunci.findOne({ where: { id: peminjaman_kunci.KunciId } });

    if (!peminjaman_kunci) {
        return res.status(200).send({
            msg: 'peminjaman kunci yang dicari tidak ditemukan'
        });
    }

    kunci.update({ status_kunci: "tersedia" })

    const pengembalian_kunci = await peminjaman_kunci.update({ status_peminjaman });

    res.status(200).send({
        msg: 'Pengembalian kunci berhasil',
        pengembalian: pengembalian_kunci
    })
});

// aduan hilang
router.get('/aduan_hilang', async (req, res) => {
    const aduan = await Aduan_Hilang.findAll({
        include: [{ model: User }]
    });
    if (!aduan.length) {
        return res.status(200).json({
            msg: 'success',
            aduan: 'Data aduan is empty'
        })
    }
    res.status(200).send({
        msg: 'Success',
        aduan
    })
});

router.post('/aduan_hilang', async (req, res) => {
    const { judul_aduan, deskripsi_aduan, lokasi_aduan, foto_barang } = req.body;
    if (!req.body) {
        res.status(200).send({
            msg: 'Harap isi semua kolom form yang tersedia'
        })
    };

    const aduan = await Aduan_Hilang.create({
        judul_aduan,
        deskripsi_aduan,
        lokasi_aduan,
        UserId: "c9336a1a-f5fd-40c1-adf6-425fb10a9470" //user naruto
    });

    res.status(201).send({
        msg: 'Berhasil mengisi aduan kehilangan',
        aduan
    })

});

router.patch('/validasi_aduan_satpam/:id', async (req, res) => {
    const { id } = req.params;
    const aduan = await Aduan_Hilang.findOne({ where: { id } });
    if (!aduan) {
        return res.status(200).send({
            msg: 'aduan yang dicari tidak ditemukan'
        })
    }
    const validasiSatpam = await aduan.update({
        status_aduan: "menunggu validasi admin / kasubbag"
    });

    res.status(200).send({
        msg: 'Aduan Hilang berhasil di validasi oleh satpam',
        aduan: validasiSatpam
    })
});

router.patch('/validasi_aduan_admin/:id', async (req, res) => {
    const { id } = req.params;
    const aduan = await Aduan_Hilang.findOne({ where: { id } });
    if (!aduan) {
        return res.status(200).send({
            msg: 'aduan yang dicari tidak ditemukan'
        })
    }
    const validasiAdmin = await aduan.update({
        status_aduan: "divalidasi"
    });

    res.status(200).send({
        msg: 'Aduan Hilang berhasil di validasi oleh Admin /  kasubbag',
        aduan: validasiAdmin
    })
});

// QR CODE
// router.post('/qrcode', async (req, res) => {
//     const { nama, website } = req.body;
//     const generateQR = async ({ nama, website }) => {
//         try {
//             console.log(await QRCode.toString(nama, website, { type: 'terminal' }))
//         } catch (error) {
//             console
//         }
//     }
// })

module.exports = router;