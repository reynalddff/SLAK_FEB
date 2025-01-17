const { User, Role, Notifications } = require("./../models");
const bcrypt = require("bcryptjs");
const Op = require("sequelize").Op;
require("express-async-errors");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: Role,
      where: {
        [Op.not]: [{ id: req.user.id }],
      },
      attributes: {
        exclude: ["password"],
      },
      order: [["RoleId", "DESC"]],
    });

    const notifications = await Notifications.findAll({
      where: {
        [Op.or]: [{ tujuan_notif: "3" }, { tujuan_notif: "7" }],
      },
      order: [["createdAt", "DESC"]],
    });

    res.render("admin/manajemen_user/manajemen_user", {
      notifications,
      users,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      error: req.flash("error"),
      foto_user: req.user.foto_user,
    });
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};

exports.formCreateUser = async (req, res) => {
  const roles = await Role.findAll({});
  const notifications = await Notifications.findAll({
    where: {
      [Op.or]: [{ tujuan_notif: "3" }, { tujuan_notif: "7" }],
    },
    order: [["createdAt", "DESC"]],
  });
  res.render("admin/manajemen_user/manajemen_user_tambah", {
    roles,
    notifications,
    nama_user: req.user.nama_user,
    foto_user: req.user.foto_user,
    error: req.flash("error"),
    foto_user: req.user.foto_user,
  });
};

exports.createUser = async (req, res) => {
  try {
    const {
      nama_user,
      email,
      username,
      password,
      telp_user,
      RoleId,
    } = req.body;
    const user = await User.create({
      nama_user,
      email,
      username,
      password,
      telp_user,
      foto_user: req.file === undefined ? "" : req.file.filename,
      isValid: "dibuat oleh admin",
      RoleId,
    });
    if (!email && !telp_user) {
      res.flash("/admin/manajemen_user/tambah");
    }
    req.flash("success", "User berhasil ditambahkan");
    res.redirect("/admin/manajemen_user");
  } catch (error) {
    if (error.errors[0].message === "Duplicate username!") {
      req.flash(
        "error",
        "NIP / NIK telah digunakan! Silahkan gunakan yang lain."
      );
      res.redirect("/admin/manajemen_user/tambah");
    }
    // res.send(error.errors[0].message)
  }
};

exports.getProfileById = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({
    where: { id },
    include: Role,
  });
  const roles = await Role.findAll({});
  // const passwordNotHash = bcrypt.
  if (!user) {
    return res.status(404).json({
      status: "Failed",
      msg: "User is not found",
    });
  }

  const notifications = await Notifications.findAll({
    where: {
      [Op.or]: [{ tujuan_notif: "3" }, { tujuan_notif: "7" }],
    },
    order: [["createdAt", "DESC"]],
  });

  res.render("admin/manajemen_user/manajemen_user_edit", {
    notifications,
    user,
    roles,
    nama_user: req.user.nama_user,
    foto_user: req.user.foto_user,
  });
};

exports.getAccountById = async (req, res) => {
  if (req.user.RoleId === 2) {
    const { id } = req.params;
    const user = await User.findOne({
      where: { id },
      include: Role,
    });
    const roles = await Role.findAll({});
    // const passwordNotHash = bcrypt.
    if (!user) {
      return res.status(404).json({
        status: "Failed",
        msg: "User is not found",
      });
    }

    const notifications = await Notifications.findAll({
      where: {
        [Op.or]: [{ tujuan_notif: "3" }, { tujuan_notif: "7" }],
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("admin/manajemen_user/manajemen_user_edit_pass", {
      user,
      notifications,
      nama_user: req.user.nama_user,
      foto_user: req.user.foto_user,
      error: req.flash("error"),
    });
  }
};

exports.updateProfile = async (req, res) => {
  const {
    nama_user,
    email,
    username,
    password,
    telp_user,
    foto_user,
    RoleId,
  } = req.body;
  const { id } = req.params;
  const user = await User.findOne({
    where: { id },
  });
  try {
    if (!user) {
      return res.status(404).json({
        status: "Failed",
        msg: "User is not found",
      });
    } else {
      await user.update({
        nama_user,
        email,
        username,
        telp_user,
        foto_user,
        RoleId,
      });
      req.flash("success", "User berhasil diupdate");
      res.redirect("/admin/manajemen_user");
    }
  } catch (error) {
    req.flash(
      "error",
      "Username telah dipakai, silahkan gunakan username yang lain!"
    );
    // res.json({ error: error.errors[0].message })
  }
};

exports.updateAccount = async (req, res) => {
  const { username, password } = req.body;
  const { id } = req.params;
  try {
    const user = await User.findOne({
      where: { id },
    });
    if (!user) {
      return res.status(404).json({
        status: "Failed",
        msg: "User is not found",
      });
    }
    const salt = await bcrypt.genSaltSync(10);
    const passwordHash = await bcrypt.hashSync(password, salt);

    await user.update({
      username,
      password: passwordHash,
    });

    req.flash("success", "User berhasil diupdate");
    res.redirect("/admin/manajemen_user");
  } catch (error) {
    // res.json({ error: error.errors[0].message })
    req.flash(
      "error",
      "Username telah dipakai, silahkan gunakan username yang lain!"
    );
    res.redirect(`/admin/manajemen_user/edit/credentials/${id}`);
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({
    where: {
      id: id,
    },
  });
  try {
    if (!user) {
      res.status.json({ err });
      return;
    }

    await user.destroy();
    req.flash("success", "User berhasil dihapus");
    res.redirect("/admin/manajemen_user");
  } catch (error) {
    res.json({ error });
  }
};

// buat edit profile di setiap user nya
exports.getProfile = async (req, res) => {
  const { id } = req.user;
  const user = await User.findOne({
    where: { id },
  });
  // const passwordNotHash = bcrypt.
  if (!user) {
    return res.status(404).json({
      status: "Failed",
      msg: "User is not found",
    });
  }
  if (req.user.RoleId === 1) {
    const notifications = await Notifications.findAll({
      where: {
        tujuan_notif: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("karyawan/edit_profile", {
      user: req.user,
      notifications,
      user,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      error: req.flash("error"),
      foto_user: req.user.foto_user,
    });
  } else if (req.user.RoleId === 2) {
    const notifications = await Notifications.findAll({
      where: {
        [Op.or]: [{ tujuan_notif: "3" }, { tujuan_notif: "7" }],
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("admin/edit_profile", {
      user,
      notifications,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      error: req.flash("error"),
      foto_user: req.user.foto_user,
    });
  } else if (req.user.RoleId === 3) {
    const notifications = await Notifications.findAll({
      where: {
        tujuan_notif: req.user.RoleId.toString(),
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("operator/edit_profile", {
      user,
      notifications,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      error: req.flash("error"),
      foto_user: req.user.foto_user,
    });
  } else if (req.user.RoleId === 4) {
    const notifications = await Notifications.findAll({
      where: {
        tujuan_notif: req.user.RoleId.toString(),
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("operator/edit_profile", {
      user,
      notifications,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      error: req.flash("error"),
      foto_user: req.user.foto_user,
    });
  } else if (req.user.RoleId === 5) {
    const notifications = await Notifications.findAll({
      where: {
        tujuan_notif: req.user.RoleId.toString(),
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("operator/edit_profile", {
      user,
      notifications,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      error: req.flash("error"),
      foto_user: req.user.foto_user,
    });
  } else if (req.user.RoleId === 6) {
    const notifications = await Notifications.findAll({
      where: {
        tujuan_notif: req.user.RoleId.toString(),
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("operator/edit_profile", {
      user,
      notifications,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      error: req.flash("error"),
      foto_user: req.user.foto_user,
    });
  } else if (req.user.RoleId === 7) {
    const notifications = await Notifications.findAll({
      where: {
        tujuan_notif: "7",
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("satpam/edit_profile", {
      notifications,
      user,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      error: req.flash("error"),
      foto_user: req.user.foto_user,
    });
  }
};

exports.getAccount = async (req, res) => {
  const { id } = req.user;
  const user = await User.findOne({
    where: { id },
  });
  // const passwordNotHash = bcrypt.
  if (!user) {
    return res.status(404).json({
      status: "Failed",
      msg: "User is not found",
    });
  }
  if (req.user.RoleId === 1) {
    const notifications = await Notifications.findAll({
      where: {
        tujuan_notif: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("karyawan/edit_pass", {
      user: req.user,
      notifications,
      user,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      foto_user: req.user.foto_user,
    });
  } else if (req.user.RoleId === 2) {
    const notifications = await Notifications.findAll({
      where: {
        [Op.or]: [{ tujuan_notif: "3" }, { tujuan_notif: "7" }],
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("admin/edit_pass", {
      user,
      notifications,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      foto_user: req.user.foto_user,
    });
  } else if (req.user.RoleId === 3) {
    const notifications = await Notifications.findAll({
      where: {
        tujuan_notif: req.user.RoleId.toString(),
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("operator/edit_pass", {
      notifications,
      user,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      foto_user: req.user.foto_user,
    });
  } else if (req.user.RoleId === 4) {
    const notifications = await Notifications.findAll({
      where: {
        tujuan_notif: req.user.RoleId.toString(),
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("operator/edit_pass", {
      notifications,
      user,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      foto_user: req.user.foto_user,
    });
  } else if (req.user.RoleId === 5) {
    const notifications = await Notifications.findAll({
      where: {
        tujuan_notif: req.user.RoleId.toString(),
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("operator/edit_pass", {
      notifications,
      user,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      foto_user: req.user.foto_user,
    });
  } else if (req.user.RoleId === 6) {
    const notifications = await Notifications.findAll({
      where: {
        tujuan_notif: req.user.RoleId.toString(),
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("operator/edit_pass", {
      notifications,
      user,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      foto_user: req.user.foto_user,
    });
  } else if (req.user.RoleId === 7) {
    const notifications = await Notifications.findAll({
      where: {
        tujuan_notif: "7",
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("satpam/edit_pass", {
      notifications,
      user,
      nama_user: req.user.nama_user,
      success: req.flash("success"),
      foto_user: req.user.foto_user,
    });
  }
};

exports.editProfile = async (req, res) => {
  const { nama_user, email, username, telp_user } = req.body;
  const { id } = req.user;
  const user = await User.findOne({
    where: { id },
  });
  if (!user) {
    return res.status(404).json({
      status: "Failed",
      msg: "User is not found",
    });
  } else {
    if (req.fileValidationError) {
      req.flash("error", "Foto harus memiliki format JPG/JPEG/PNG");
      if (req.user.RoleId === 1) {
        res.redirect("/karyawan/edit_profile");
      } else if (req.user.RoleId === 2) {
        res.redirect("/admin/edit_profile");
      } else if (req.user.RoleId === 3) {
        res.redirect("/operator/edit_profile");
      } else if (req.user.RoleId === 4) {
        res.redirect("/operator/edit_profile");
      } else if (req.user.RoleId === 5) {
        res.redirect("/operator/edit_profile");
      } else if (req.user.RoleId === 6) {
        res.redirect("/operator/edit_profile");
      } else if (req.user.RoleId === 7) {
        res.redirect("/satpam/edit_profile");
      }
    }
    if (user.foto_user) {
      if (!req.file) {
        //kalo foto nya ga ada
        const updated = await user.update({
          nama_user,
          email,
          username,
          telp_user,
        });
        req.flash("success", "Profile berhasil diupdate");
      } else {
        const updated = await user.update({
          nama_user,
          email,
          username,
          telp_user,
          foto_user: req.file === undefined ? "" : req.file.filename,
        });
        req.flash("success", "Profile berhasil diupdate");
      }
    } else {
      const updated = await user.update({
        nama_user,
        email,
        username,
        telp_user,
        foto_user: req.file === undefined ? "" : req.file.filename,
      });
      req.flash("success", "Profile berhasil diupdate");
    }
    if (req.user.RoleId === 1) {
      res.redirect("/karyawan/edit_profile");
    } else if (req.user.RoleId === 2) {
      res.redirect("/admin/edit_profile");
    } else if (req.user.RoleId === 3) {
      res.redirect("/operator/edit_profile");
    } else if (req.user.RoleId === 4) {
      res.redirect("/operator/edit_profile");
    } else if (req.user.RoleId === 5) {
      res.redirect("/operator/edit_profile");
    } else if (req.user.RoleId === 6) {
      res.redirect("/operator/edit_profile");
    } else if (req.user.RoleId === 7) {
      res.redirect("/satpam/edit_profile");
    }
  }
};

exports.editAccount = async (req, res) => {
  const { username, password } = req.body;
  const { id } = req.user;
  const user = await User.findOne({
    where: { id },
  });
  if (!user) {
    return res.status(404).json({
      status: "Failed",
      msg: "User is not found",
    });
  }
  const salt = await bcrypt.genSaltSync(10);
  const passwordHash = await bcrypt.hashSync(password, salt);

  await user.update({
    username,
    password: passwordHash,
  });

  req.flash("success", "User berhasil diupdate");
  if (req.user.RoleId === 1) {
    res.redirect("/karyawan/edit_account");
  } else if (req.user.RoleId === 2) {
    res.redirect("/admin/edit_account");
  } else if (req.user.RoleId === 3) {
    res.redirect("/operator/edit_account");
  } else if (req.user.RoleId === 4) {
    res.redirect("/operator/edit_account");
  } else if (req.user.RoleId === 5) {
    res.redirect("/operator/edit_account");
  } else if (req.user.RoleId === 6) {
    res.redirect("/operator/edit_account");
  } else if (req.user.RoleId === 7) {
    res.redirect("/satpam/edit_account");
  }
};

exports.validasiUser = async (req, res) => {
  const user = await User.findOne({
    where: {
      id: req.body.user_id,
    },
  });

  if (!user) {
    req.flash("error", "Gagal melakukan validasi, silahkan coba kembali");
    res.redirect("/admin/manajemen_user");
    return;
  }

  const userValidated = await user.update({
    isValid: "sudah divalidasi",
  });

  req.flash("success", `${user.nama_user} telah berhasil divalidasi`);
  res.redirect("/admin/manajemen_user");
};

const redirectByRole = (req, res) => {
  if (req.user.RoleId === 1) {
    res.redirect("/karyawan/edit_account");
  } else if (req.user.RoleId === 2) {
    res.redirect("/admin/edit_account");
  } else if (req.user.RoleId === 3) {
    res.redirect("/operator/edit_account");
  } else if (req.user.RoleId === 4) {
    res.redirect("/operator/edit_account");
  } else if (req.user.RoleId === 5) {
    res.redirect("/operator/edit_account");
  } else if (req.user.RoleId === 6) {
    res.redirect("/operator/edit_account");
  } else if (req.user.RoleId === 7) {
    res.redirect("/satpam/edit_account");
  }
};
