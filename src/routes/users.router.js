import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * 회원가입 API
 */
router.post('/sign-up', async (req, res, next) => {
  const { email, password, name } = req.body;

  try {
    const isExistUser = await prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (isExistUser) {
      return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (err) {
    next(err);
  }
});

/**
 * 로그인 API
 */
router.post('/sign-in', async (req, res, next) => {
  const { email, password } = req.body;

  const user = await prisma.users.findFirst({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: '잘못된 계정 정보 입니다.' });
  } else if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
  }

  const accessToken = jwt.sign(
    {
      userId: user.userId,
    },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: '1d' },
  );

  console.log('accessToken ===>>> ', accessToken);

  return res.status(200).json({
    message: '로그인에 성공하였습니다.',
    accessToken: accessToken,
  });
});

export default router;
