const { upload } = require("./../config/multer");
const { User, Role } = require('./../models');
require('express-async-errors');
module.exports = (app, passport) => {

    app.get('/', redirectByRole, (req, res) => {
        if (!req.user) {
            res.redirect('/login')
        }
    });

    app.get('/login', redirectByRole, (req, res) => {
        res.render('auth-login', { message: req.flash('error_msg'), success: req.flash('success'), })
    });

    app.post('/login',
        passport.authenticate('local-signin', { failureRedirect: '/login', failureFlash: 'invalid username or pasword' }),
        (req, res, next) => {
            if (req.user.RoleId === 1) {
                return res.redirect('/karyawan')
            } else if (req.user.RoleId === 2) {
                return res.redirect('/admin')
            } else if (req.user.RoleId === 3) {
                return res.redirect('/operator')
            } else if (req.user.RoleId === 4) {
                return res.redirect('/operator')
            } else if (req.user.RoleId === 5) {
                return res.redirect('/operator')
            } else if (req.user.RoleId === 6) {
                return res.redirect('/operator')
            } else if (req.user.RoleId === 7) {
                return res.redirect('/satpam')
            }
        }
    );

    app.get('/logout', isLoggedIn, (req, res) => {
        req.session.destroy(err => {
            res.redirect('/login');
        });
    });

    app.get('/register', (req, res) => {
        res.render('register', {
            success: req.flash('success'),
            error: req.flash('error')
        })
    });

    app.post('/register', upload.single('foto_ktp'), async (req, res) => {
        const { nama_user, email, telp_user, username, password } = req.body;
        await User.create({
            nama_user,
            email,
            telp_user,
            username,
            password,
            foto_ktp: req.file === undefined ? '' : req.file.filename,
            foto_user: "",
            isValid: "belum divalidasi",
            RoleId: 1
        });

        if (!req.body) {
            req.flash('error', 'Harap mengisi form yang tersedia');
            res.redirect('/register');
            return;
        }

        req.flash('success', 'Registrasi berhasil! Silahkan menunggu 1 x 24 jam untuk validasi akun anda. Informasi lebih lanjut silahkan datang ke kantor PSIK FEB UB. Terimakasih');
        res.redirect('/login')
    })

    function isLoggedIn(req, res, next) {
        // console.log(req.isAuthenticated())
        console.log(req.user)
        if (req.isAuthenticated()) {
            return next()
        };
        res.redirect('/login')
    }

    function redirectByRole(req, res, next) {
        if (req.user) {
            if (req.user.RoleId === 1) {
                return res.redirect('/karyawan');
            } else if (req.user.RoleId === 2) {
                return res.redirect('/admin')
            } else if (req.user.RoleId === 3) {
                return res.redirect('/operator')
            }
        }
        next();
    }
}