import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import joi from 'joi';
import asyncHandler from 'express-async-handler';

const router = express.Router();

/**
 * 회원가입 API
 */
router.post(
  '/sign-up',
  asyncHandler(async (req, res, next) => {
    /**
     * #swagger.summary = '회원가입 API'
     * #swagger.description = '신규 유저를 추가한다.'
     * #swagger.tags = ['Users: 회원관련'] 
     * 
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

    // 영어 소문자 + 숫자
    const emailRegExp = /^[0-9a-z]*@[0-9a-z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
    // /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;

    const signupSchema = joi.object({
      email: joi.string().regex(emailRegExp).required().messages({
        'string.base': 'Email은 문자열이어야 합니다.',
        'any.required': 'Email을 입력해주세요.',
        'string.pattern.base': 'Email이 형식에 맞지 않습니다.[영어 소문자 + 숫자 조합]',
      }),
      password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).min(6).required().messages({
        'string.base': '비밀번호는 문자열이어야 합니다.',
        'string.min': `비밀번호의 길이는 최소 {#limit}자 이상입니다.`,
        'any.required': '비밀번호를 입력해주세요.',
      }),
      passwordCheck: joi.any().valid(joi.ref('password')).required().messages({
        'any.only': '비밀번호와 일치해야합니다.',
      }),
      name: joi.string().min(2).max(10).required().messages({
        'string.base': '이름은 문자열이어야 합니다.',
        'string.min': `이름의 길이는 최소 {#limit}자 이상입니다.`,
        'string.max': `이름의 길이는 최대 {#limit}자 이하입니다.`,
      }),
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
  }),
);

/**
 * 로그인 API
 */
router.post(
  '/sign-in',
  asyncHandler(async (req, res, next) => {
    /**
     * #swagger.summary = '로그인 API'
     * #swagger.description = '유저 정보를 확인한다.'
     * #swagger.tags = ['Users: 회원관련'] 
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
      { expiresIn: '5m' },
    );

    // 로그인 페이지용
    res.cookie('accessToken', 'Bearer ' + accessToken);

    return res.status(200).json({
      message: '로그인에 성공하였습니다.',
      accessToken: accessToken,
    });
  }),
);

export default router;
