module.exports = (app, passport) => {

    app.get('/', redirectByRole, (req, res) => {
        if (!req.user) {
            res.redirect('/login')
        }
    });

    app.get('/login', redirectByRole, (req, res) => {
        res.render('auth-login', { message: req.flash('error_msg') })
    });

    app.post('/actionLogin',
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