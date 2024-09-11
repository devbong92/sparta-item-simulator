import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import Utils from '../utils/Utils.js';
import joi from 'joi';
import asyncHandler from 'express-async-handler';

const router = express.Router();

/**
 * 캐릭터 생성 API
 */
router.post(
  '/character',
  authMiddleware,
  asyncHandler(async (req, res, next) => {
    /**
   * #swagger.summary = '캐릭터 생성 API'
   * #swagger.description = '[인증] 신규 캐릭터를 생성한다.'
   * #swagger.tags = ['Characters: 캐릭터관련'] 
   * #swagger.security = [{
        "Bearer Token": []
    }] 
   * #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/addCharacterReq"
                }  
            }
        }
      }
   */

    const joiSchema = joi.object({
      characterName: joi.string().required().messages({
        'string.base': '캐릭터명은 문자열이어야 합니다.',
        'any.required': '캐릭터명을 입력해주세요.',
      }),
    });

    const validation = await joiSchema.validateAsync(req.body);

    const { user } = req;
    const { characterName } = validation;

    const isExistCharacter = await prisma.characters.findFirst({
      where: {
        characterName: characterName,
      },
    });
    if (isExistCharacter) {
      return res.status(409).json({ message: '이미 존재하는 캐릭터명입니다.' });
    }

    const character = await prisma.characters.create({
      data: {
        userId: user.userId,
        characterName: characterName,
      },
    });

    return res.status(201).json({
      characterId: character.characterId,
      data: character,
    });
  }),
);

/**
 * 캐릭터 삭제 API
 */
router.delete(
  '/character/:characterId',
  authMiddleware,
  asyncHandler(async (req, res, next) => {
    /**
   * #swagger.summary = '캐릭터 삭제 API'
   * #swagger.description = '[인증] 특정 캐릭터를 삭제한다.'
   * #swagger.tags = ['Characters: 캐릭터관련'] 
   * #swagger.security = [{
        "Bearer Token": []
    }] 
   * 
   */

    const { user } = req;
    const { characterId } = req.params;

    const character = await prisma.characters.findFirst({
      where: {
        characterId: +characterId,
        userId: user.userId,
      },
    });
    if (!character) return res.status(400).json({ message: '잘못된 캐릭터 정보입니다.' });

    const del = await prisma.characters.delete({
      where: {
        characterId: +characterId,
        userId: user.userId,
      },
    });

    console.log('del =>> ', del);

    return res
      .status(200)
      .json({ message: `[${del.characterName}] 캐릭터 삭제가 완료되었습니다.` });
  }),
);

/**
 * 캐릭터 상세 조회 API
 */
router.get(
  '/character/:characterId',
  asyncHandler(async (req, res, next) => {
    /**
   * #swagger.summary = '캐릭터 상세 조회 API'
   * #swagger.description = '[인증] 특정 캐릭터를 조회한다. / [비인증] 게임머니 미출력'
   * #swagger.tags = ['Characters: 캐릭터관련'] 
   * #swagger.security = [{
        "Bearer Token": []
    }] 
   */

    const { characterId } = req.params;
    let userId;

    try {
      userId = Utils.verify(req.headers.authorization);
    } catch (err) {
      userId = null;
    }

    const character = await prisma.characters.findFirst({
      where: {
        characterId: +characterId,
      },
    });
    if (!character) return res.status(400).json({ message: '잘못된 캐릭터 정보입니다.' });

    let result;
    if (+userId === character.userId) {
      result = {
        name: character.characterName,
        health: character.health,
        power: character.power,
        money: character.money,
      };
    } else {
      result = {
        name: character.characterName,
        health: character.health,
        power: character.power,
      };
    }

    return res.status(200).json({ data: result });
  }),
);

/**
 * 캐릭터 목록 조회 API
 */
router.get(
  '/character',
  authMiddleware,
  asyncHandler(async (req, res, next) => {
    /**
   * #swagger.summary = '캐릭터 목록 조회 API'
   * #swagger.description = '[인증] 유저의 캐릭터 목록을 조회한다.'
   * #swagger.tags = ['Characters: 캐릭터관련']
   * 
   * #swagger.security = [{
        "Bearer Token": []
    }] 
   */

    const { user } = req;

    const characters = await prisma.characters.findMany({
      select: {
        characterId: true,
        characterName: true,
        health: true,
        power: true,
        money: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        userId: user.userId,
      },
    });

    return res.status(200).json({ data: characters });
  }),
);

export default router;
