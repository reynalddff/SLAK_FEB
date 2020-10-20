const express = require('express');
const router = express.Router();
const { Aduan_Lapor, User, Komentar, Notifications } = require('./../models')
const db = require('./../models');

const moment = require('moment')

//middleware auth
const check = require('./../middlewares/rolePermission');
// upload multer
const { upload } = require('./../config/multer');

// controller
const { getAduanByTujuan, getAduan, tanggapAduan, getAduanByMonth } = require('./../controllers/aduan_lapor.controller');
const { findKomentarByAduan } = require('./../controllers/komentar.controller');
const { getProfile, getAccount, editAccount, editProfile } = require('./../controllers/user.controller');

router.use(check.isOperator, check.isLoggedIn)

// dashboard
router.get('/', async (req, res, next) => {
    const notifications = await Notifications.findAll({
        where: {
            tujuan_notif: req.user.RoleId.toString()
        },
        order: [
            ['createdAt', 'DESC']
        ]
    });


    let tahun = req.query.tahun //|| new Date().getFullYear().toString();
    let bulan = req.query.bulan //|| new Date().getMonth() + 1;
    if (bulan) {
        if (bulan.length > 2) {
            bulan = "0" + bulan
        }
    }

    if (tahun) {
        if (tahun === "semua") {
            const allAduanLapor = await Aduan_Lapor.findAll({
                where: {
                    tujuan_aduan: req.user.RoleId.toString()
                }
            });

            const allAduanLaporBelum = allAduanLapor.filter((aduan) => {
                return aduan.status_aduan === "belum";
            });

            return res.render("operator/dashboard", {
                notifications,
                user: 6,
                data_bulan_ini: bulan ? moment(bulan).format('MMMM') : "", //moment().format('MMMM'),
                data_tahun_ini: tahun ? moment(tahun).year() : "", //moment().year(),
                nama_user: req.user.nama_user,
                foto_user: req.user.foto_user,
                aduan_lapor: {
                    total: allAduanLapor.length,
                    belum: allAduanLaporBelum.length,
                    sudah: allAduanLapor.length - allAduanLaporBelum.length
                },
            });
        } if (tahun !== "semua") {
            const aduanLaporPerBulan = await db.sequelize.query(
                `SELECT * FROM "Aduan_Lapors" AS "Aduan_Lapor" WHERE date_trunc('month', "Aduan_Lapor"."createdAt")::date = '${tahun}-${bulan}-01'::date, "Aduan_Lapor"."tujuan_aduan" = ${req.user.RoleId.toString()} `,
                {
                    replacements: ["active"],
                    type: db.sequelize.QueryTypes,
                }
            );

            const aduanLaporPerBulanBelum = aduanLaporPerBulan.filter((aduan) => {
                return aduan.status_aduan === "belum";
            });

            return res.render("operator/dashboard", {
                notifications,
                user: 6,
                data_bulan_ini: bulan ? moment(bulan).format('MMMM') : "", //moment().format('MMMM'),
                data_tahun_ini: tahun ? moment(tahun).year() : "", //moment().year(),
                nama_user: req.user.nama_user,
                foto_user: req.user.foto_user,
                aduan_lapor: {
                    total: aduanLaporPerBulan.length,
                    belum: aduanLaporPerBulanBelum.length,
                    sudah: aduanLaporPerBulan.length - aduanLaporPerBulanBelum.length
                },
            });
        }
    }

    const allAduanLapor = await Aduan_Lapor.findAll({
        where: {
            tujuan_aduan: req.user.RoleId.toString()
        }
    });

    const allAduanLaporBelum = allAduanLapor.filter((aduan) => {
        return aduan.status_aduan === "belum";
    });

    return res.render("operator/dashboard", {
        notifications,
        user: 6,
        data_bulan_ini: bulan ? moment(bulan).format('MMMM') : "", //moment().format('MMMM'),
        data_tahun_ini: tahun ? moment(tahun).year() : "", //moment().year(),
        nama_user: req.user.nama_user,
        foto_user: req.user.foto_user,
        aduan_lapor: {
            total: allAduanLapor.length,
            belum: allAduanLaporBelum.length,
            sudah: allAduanLapor.length - allAduanLaporBelum.length
        }
    });
});

// edit profile
router.get('/edit_profile', getProfile);
router.get('/edit_account', getAccount);
router.post('/edit_profile', upload.single('foto_user'), editProfile);
router.post('/edit_account', editAccount);

// Aduan Lapor
router.get('/aduan_lapor', getAduanByTujuan);
router.get('/aduan_lapor/:id/edit_aduan', getAduan);
router.post('/aduan_lapor/:id/edit_aduan', upload.single('tanggapan_foto'), tanggapAduan);

// komentar
router.get('/komentar/:id', findKomentarByAduan)

module.exports = router;
