import { Router } from 'express';

import {
  loginController,
  refreshController,
  registerController,
} from '../controllers/authControllers.js';
import { loginValidate, registerValidate } from '../middleware/auth.js';

const router = Router();

router.post('/auth/register', registerValidate, registerController);
router.post('/auth/login', loginValidate, loginController);
router.post('/auth/refresh', refreshController);

export default router;
