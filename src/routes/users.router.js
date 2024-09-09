import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import joi from 'joi';

const router = express.Router();

/**
 * 회원가입
 */
router.post('/sign-up', async (req, res, next) => {
  /**
   * #swagger.tags = ['회원가입']
   * #swagger.description = '회원가입 - 유저'
   * #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/signUp"
                }  
            }
        }
    } 
   */

  try {
    const signupSchema = joi.object({
      email: joi.string().email().required(),
      password: joi.string().required(),
      name: joi.string().min(2).max(5).required(),
    });

    const validation = await signupSchema.validateAsync(req.body);
    const { email, password, name } = validation;

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
 * 로그인
 */
router.post('/sign-in', async (req, res, next) => {
  /**
   * #swagger.tags = ['로그인']
   * #swagger.description = '로그인 - 유저'
   * #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/signIn"
                }  
            }
        }
    } 
   */
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

  // 로그인 페이지용
  res.cookie('accessToken', 'Bearer ' + accessToken);

  return res.status(200).json({
    message: '로그인에 성공하였습니다.',
    accessToken: accessToken,
  });
});

export default router;
