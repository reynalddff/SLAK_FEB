const { User, Role } = require('./../models');
const bcrypt = require('bcryptjs');
const Op = require("sequelize").Op;
require('express-async-errors');


exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            include: Role,
            where: {
                [Op.not]: [
                    { id: req.user.id }
                ]
            },
            attributes: {
                exclude: ['password']
            },
            order: [['RoleId', 'ASC']]
        });
        res.render('admin/manajemen_user/manajemen_user', {
            users: users,
            nama_user: req.user.nama_user,
            success: req.flash('success'),
            foto_user: req.user.foto_user
        })
    } catch (error) {
        res.send(error);
        console.log(error)
    }
}

exports.formCreateUser = async (req, res) => {
    const roles = await Role.findAll({});
    res.render('admin/manajemen_user/manajemen_user_tambah', { roles, nama_user: req.user.nama_user, foto_user: req.user.foto_user, error: req.flash('error'), foto_user: req.user.foto_user });
}

exports.createUser = async (req, res) => {
    try {
        const { nama_user, email, username, password, telp_user, RoleId } = req.body;
        const user = await User.create({
            nama_user,
            email,
            username,
            password,
            telp_user,
            foto_user: req.file === undefined ? '' : req.file.filename,
            RoleId,
        });
        if (!email && !telp_user) {
            res.flash('/admin/manajemen_user/tambah')
        }
        req.flash('success', 'User berhasil ditambahkan')
        res.redirect('/admin/manajemen_user')
    } catch (error) {
        res.send(error)
    }
}

exports.getProfileById = async (req, res) => {
    const { id } = req.params;
    const user = await User.findOne({
        where: { id },
        include: Role
    });
    const roles = await Role.findAll({});
    // const passwordNotHash = bcrypt.
    if (!user) {
        return res.status(404).json({
            status: 'Failed',
            msg: 'User is not found'
        })
    }
    res.render('admin/manajemen_user/manajemen_user_edit', {
        user,
        roles,
        nama_user: req.user.nama_user,
        foto_user: req.user.foto_user
    })
}

exports.getAccountById = async (req, res) => {
    if (req.user.RoleId === 2) {
        const { id } = req.params;
        const user = await User.findOne({
            where: { id },
            include: Role
        });
        const roles = await Role.findAll({});
        // const passwordNotHash = bcrypt.
        if (!user) {
            return res.status(404).json({
                status: 'Failed',
                msg: 'User is not found'
            })
        }
        res.render('admin/manajemen_user/manajemen_user_edit_pass', {
            user,
            nama_user: req.user.nama_user,
            foto_user: req.user.foto_user
        })
    }
}

exports.updateProfile = async (req, res) => {
    const { nama_user, email, username, password, telp_user, foto_user, RoleId } = req.body;
    const { id } = req.params;
    const user = await User.findOne({
        where: { id }
    });
    if (!user) {
        return res.status(404).json({
            status: 'Failed',
            msg: 'User is not found'
        })
    } else {
        await user.update({
            nama_user,
            email,
            username,
            telp_user,
            foto_user,
            RoleId
        })
        req.flash('success', 'User berhasil diupdate')
        res.redirect('/admin/manajemen_user')
    }
}

exports.updateAccount = async (req, res) => {

    const { username, password } = req.body;
    const { id } = req.params;
    const user = await User.findOne({
        where: { id }
    });
    if (!user) {
        return res.status(404).json({
            status: 'Failed',
            msg: 'User is not found'
        })
    }
    const salt = await bcrypt.genSaltSync(10);
    const passwordHash = await bcrypt.hashSync(password, salt);

    await user.update({
        username,
        password: passwordHash,
    });

    req.flash('success', 'User berhasil diupdate')
    res.redirect('/admin/manajemen_user')
}

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findOne({
        where: {
            id: id
        }
    });
    try {
        if (!user) {
            res.status.json({ err })
            return;
        };

        await user.destroy();
        res.json({ success: true })
    } catch (error) {
        res.json({ error })
    }
}

// buat edit profile di setiap user nya
exports.getProfile = async (req, res) => {
    const { id } = req.user;
    const user = await User.findOne({
        where: { id }
    });
    // const passwordNotHash = bcrypt.
    if (!user) {
        return res.status(404).json({
            status: 'Failed',
            msg: 'User is not found'
        })
    }
    if (req.user.RoleId === 1) {
        res.render('karyawan/edit_profile', {
            user,
            nama_user: req.user.nama_user,
            success: req.flash('success'),
            error: req.flash('error'),
            foto_user: req.user.foto_user
        })
    } else if (req.user.RoleId === 2) {
        res.render('admin/edit_profile', {
            user,
            nama_user: req.user.nama_user,
            success: req.flash('success'),
            error: req.flash('error'),
            foto_user: req.user.foto_user
        })
    } else if (req.user.RoleId === 3) {
        res.render('operator/edit_profile', {
            user,
            nama_user: req.user.nama_user,
            success: req.flash('success'),
            error: req.flash('error'),
            foto_user: req.user.foto_user
        })
    } else if (req.user.RoleId === 4) {
        res.render('operator/edit_profile', {
            user,
            nama_user: req.user.nama_user,
            success: req.flash('success'),
            error: req.flash('error'),
            foto_user: req.user.foto_user
        })
    } else if (req.user.RoleId === 5) {
        res.render('operator/edit_profile', {
            user,
            nama_user: req.user.nama_user,
            success: req.flash('success'),
            error: req.flash('error'),
            foto_user: req.user.foto_user
        })
    } else if (req.user.RoleId === 6) {
        res.render('operator/edit_profile', {
            user,
            nama_user: req.user.nama_user,
            success: req.flash('success'),
            error: req.flash('error'),
            foto_user: req.user.foto_user
        })
    } else if (req.user.RoleId === 7) {
        res.render('satpam/edit_profile', {
            user,
            nama_user: req.user.nama_user,
            success: req.flash('success'),
            error: req.flash('error'),
            foto_user: req.user.foto_user
        })
    }
}

exports.getAccount = async (req, res) => {
    const { id } = req.user;
    const user = await User.findOne({
        where: { id }
    });
    // const passwordNotHash = bcrypt.
    if (!user) {
        return res.status(404).json({
            status: 'Failed',
            msg: 'User is not found'
        })
    }
    if (req.user.RoleId === 1) {
        res.render('karyawan/edit_pass', {
            user,
            nama_user: req.user.nama_user,
            success: req.flash('success'),
            foto_user: req.user.foto_user
        })
    } else if (req.user.RoleId === 2) {
        res.render('admin/edit_pass', {
            user,
            nama_user: req.user.nama_user,
            success: req.flash('success'),
            foto_user: req.user.foto_user
        })
    } else if (req.user.RoleId === 3) {
        res.render('operator/edit_pass', {
            user,
            nama_user: req.user.nama_user,
            success: req.flash('success'),
            foto_user: req.user.foto_user
        })
    } else if (req.user.RoleId === 4) {
        res.render('operator/edit_pass', {
            user,
            nama_user: req.user.nama_user,
            success: req.flash('success'),
            foto_user: req.user.foto_user
        })
    } else if (req.user.RoleId === 5) {
        res.render('operator/edit_pass', {
            user,
            nama_user: req.user.nama_user,
            success: req.flash('success'),
            foto_user: req.user.foto_user
        })
    } else if (req.user.RoleId === 6) {
        res.render('operator/edit_pass', {
            user,
            nama_user: req.user.nama_user,
            success: req.flash('success'),
            foto_user: req.user.foto_user
        })
    } else if (req.user.RoleId === 7) {
        res.render('satpam/edit_pass', {
            user,
            nama_user: req.user.nama_user,
            success: req.flash('success'),
            foto_user: req.user.foto_user
        })
    }
}

exports.editProfile = async (req, res) => {
    const { nama_user, email, username, telp_user } = req.body;
    const { id } = req.user;
    const user = await User.findOne({
        where: { id }
    });
    if (!user) {
        return res.status(404).json({
            status: 'Failed',
            msg: 'User is not found'
        })
    } else {
        if (req.fileValidationError) {
            req.flash('error', 'Foto harus memiliki format JPG/JPEG/PNG');
            if (req.user.RoleId === 1) {
                res.redirect('/karyawan/edit_profile')
            } else if (req.user.RoleId === 2) {
                res.redirect('/admin/edit_profile');
            } else if (req.user.RoleId === 3) {
                res.redirect('/operator/edit_profile');
            } else if (req.user.RoleId === 4) {
                res.redirect('/operator/edit_profile');
            } else if (req.user.RoleId === 5) {
                res.redirect('/operator/edit_profile');
            } else if (req.user.RoleId === 6) {
                res.redirect('/operator/edit_profile');
            } else if (req.user.RoleId === 7) {
                res.redirect('/satpam/edit_profile');
            }
        }
        const updated = await user.update({
            nama_user,
            email,
            username,
            telp_user,
            foto_user: req.file === undefined ? '' : req.file.filename,
        })
        req.flash('success', 'Profile berhasil diupdate');
        console.log(updated.foto_user)
        if (req.user.RoleId === 1) {
            res.redirect('/karyawan/edit_profile')
        } else if (req.user.RoleId === 2) {
            res.redirect('/admin/edit_profile');
        } else if (req.user.RoleId === 3) {
            res.redirect('/operator/edit_profile');
        } else if (req.user.RoleId === 4) {
            res.redirect('/operator/edit_profile');
        } else if (req.user.RoleId === 5) {
            res.redirect('/operator/edit_profile');
        } else if (req.user.RoleId === 6) {
            res.redirect('/operator/edit_profile');
        } else if (req.user.RoleId === 7) {
            res.redirect('/satpam/edit_profile');
        }
    }
}

exports.editAccount = async (req, res) => {
    const { username, password } = req.body;
    const { id } = req.user;
    const user = await User.findOne({
        where: { id }
    });
    if (!user) {
        return res.status(404).json({
            status: 'Failed',
            msg: 'User is not found'
        })
    }
    const salt = await bcrypt.genSaltSync(10);
    const passwordHash = await bcrypt.hashSync(password, salt);

    await user.update({
        username,
        password: passwordHash,
    });

    req.flash('success', 'User berhasil diupdate')
    if (req.user.RoleId === 1) {
        res.redirect('/karyawan/edit_account')
    } else if (req.user.RoleId === 2) {
        res.redirect('/admin/edit_account');
    } else if (req.user.RoleId === 3) {
        res.redirect('/operator/edit_account');
    } else if (req.user.RoleId === 4) {
        res.redirect('/operator/edit_account');
    } else if (req.user.RoleId === 5) {
        res.redirect('/operator/edit_account');
    } else if (req.user.RoleId === 6) {
        res.redirect('/operator/edit_account');
    } else if (req.user.RoleId === 7) {
        res.redirect('/satpam/edit_account');
    }
}