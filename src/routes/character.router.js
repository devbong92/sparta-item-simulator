import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import Utils from '../utils/Utils.js';

const router = express.Router();

/**
 * 캐릭터 생성 API
 */
router.post('/character', authMiddleware, async (req, res, next) => {
  console.log('   header => ', req.headers);

  const { user } = req;
  const { characterName } = req.body;

  try {
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

    return res.status(201).json({ data: character });
  } catch (err) {
    next(err);
  }
});

/**
 * 캐릭터 삭제
 */
router.delete('/character/:characterId', authMiddleware, async (req, res, next) => {
  const { user } = req;
  const { characterId } = req.params;

  try {
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
  } catch (err) {
    next(err);
  }
});

/**
 * 캐릭터 상세 조회
 */
router.get('/character/:characterId', async (req, res, next) => {
  const { characterId } = req.params;
  let userId;

  try {
    userId = Utils.verify(req.headers.authorization);
  } catch (err) {
    userId = null;
  }

  try {
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
  } catch (err) {
    next(err);
  }
});

/**
 * 캐릭터 목록 조회
 */
router.get('/character', authMiddleware, async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
});

export default router;
