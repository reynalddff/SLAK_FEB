require('express-async-errors');

const isLoggedIn = (req, res, next) => {
    // console.log(req.isAuthenticated())
    console.log(req.user)
    if (req.isAuthenticated()) {
        return next()
    };
    if (req.user.RoleId === undefined) {
        req.flash('error_msg', 'Please login first before using the system');
        return res.redirect('/login');
    }
    // req.flash('error_msg', 'Please login first before using the system');
    // res.redirect('/login');
}

const isAdmin = (req, res, next) => {
    if (req.user.RoleId === 2) {
        return next();
    }

    res.render('error/403')
}

const isKaryawan = (req, res, next) => {
    if (req.user.RoleId === 1) {
        return next();
    }

    res.render('error/403')
}

const isOperator = (req, res, next) => {
    if (req.user.RoleId === 4) {
        return next();
    } else if (req.user.RoleId === 3) {
        return next();
    } else if (req.user.RoleId === 5) {
        return next();
    } else if (req.user.RoleId === 6) {
        return next();
    } else {
        res.render('error/403')
    }
}

const isSatpam = (req, res, next) => {
    if (req.user.RoleId === 7) {
        return next();
    } else {
        res.render('error/403')
    }
}

const check = {
    isLoggedIn,
    isAdmin,
    isOperator,
    isKaryawan,
    isSatpam
}

module.exports = check