const express = require("express");
const viewsController = require("../Controllers/viewsController");
const authController = require("../Controllers/authController");

const router = express.Router();

router.use(authController.isLoggedIn);

router.get("/search", viewsController.viewSearchedItems);
router.get("/login", viewsController.getLoginPage);
router.get("/signup", viewsController.getSignupPage);
router.get("/forgetPassword", viewsController.getForgetPasswordPage);
router.get("/users/resetPassword/:token", viewsController.getResetPasswordPage);
router.get("/item/:itemId", viewsController.getItemPage);
router.get("/profile/:userId", viewsController.getProfilePage);
router.get("/", viewsController.getHomePage);

module.exports = router;
