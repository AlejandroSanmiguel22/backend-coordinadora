"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RegisterController_1 = require("../controllers/RegisterController");
const LoginController_1 = require("../controllers/LoginController");
const router = (0, express_1.Router)();
router.post('/register', (req, res) => RegisterController_1.RegisterController.handle(req, res));
router.post('/login', (req, res) => LoginController_1.LoginController.handle(req, res));
exports.default = router;
