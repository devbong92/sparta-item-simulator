import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authPageMiddleware from '../middlewares/authPage.middleware.js';
import Utils from '../utils/Utils.js';

const router = express.Router();

/**
 * 대시보드
 */
router.get('/index', authPageMiddleware, async (req, res, next) => {
  const { user } = req;

  const characterCount = await prisma.users.findMany({
    select: {
      _count: {
        select: { characters: true },
      },
    },
    where: {
      userId: user.userId,
    },
  });

  console.log('characterCount =>> ', characterCount);
  console.log('characterCount =>> ', characterCount[0]);
  console.log('characterCount =>> ');

  return res.render('template/view', {
    pageName: `../index`,
    user: user,
    characterCount: characterCount[0]['_count']['characters'] || 0,
    itemCount: 0,
  });
});

/**
 * 페이지 이동 : 캐릭터 목록
 */
router.get('/characterList', authPageMiddleware, async (req, res, next) => {
  //
  const { user } = req;

  console.log('characterList =>>> ', user);

  const list = await prisma.characters.findMany({
    where: {
      userId: user.userId,
    },
  });

  console.log('list => ', list);

  return res.render('template/view', {
    pageName: `../characterList`,
    user: user,
    list: list,
  });
});

/**
 * 페이지 이동 : 아이템 목록
 */
router.get('/itemList', authPageMiddleware, async (req, res, next) => {
  //
  const { user } = req;

  console.log('itemList =>>> ', user);

  const list = await prisma.items.findMany({});

  console.log('list => ', list);

  return res.render('template/view', {
    pageName: `../itemList`,
    user: user,
    list: list,
  });
});

/**
 * 캐릭터 인벤토리 페이지
 */
router.get('/inventories', authPageMiddleware, async (req, res, next) => {
  //
  const { user } = req;
  const { characterId } = req.query;

  const myCharacter = await prisma.characters.findUnique({
    where: {
      characterId: +characterId,
      userId: user.userId,
    },
  });
  if (!myCharacter) return res.status(400).json({ message: '잘못된 캐릭터 정보입니다.' });

  const list = await prisma.inventories.findMany({
    select: {
      invenId: true,
      wearYn: true,
      createdAt: true,
      updatedAt: true,
      item: {
        select: {
          itemCode: true,
          itemName: true,
          itemPrice: true,
          itemStat: true,
        },
      },
    },
    where: {
      characterId: myCharacter.characterId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return res.render('template/view', {
    pageName: `../inventories`,
    user: user,
    list: list,
  });
});

/**
 * 장비 목록 페이지
 */
router.get('/equipments', authPageMiddleware, async (req, res, next) => {
  //
  const { user } = req;
  const { characterId } = req.query;

  const myCharacter = await prisma.characters.findUnique({
    where: {
      characterId: +characterId,
      userId: user.userId,
    },
  });
  if (!myCharacter) return res.status(400).json({ message: '잘못된 캐릭터 정보입니다.' });

  const list = await prisma.equipments.findMany({
    select: {
      equipmentId: true,
      inven: true,
      createdAt: true,
      updatedAt: true,
      inven: {
        select: {
          item: {
            select: {
              itemCode: true,
              itemName: true,
              itemPrice: true,
              itemStat: true,
            },
          },
        },
      },
    },
    where: {
      characterId: myCharacter.characterId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return res.render('template/view', {
    pageName: `../equipments`,
    user: user,
    list: list,
  });
});

/**
 * 캐릭터 생성 페이지
 */
router.get('/newCharacter', authPageMiddleware, async (req, res, next) => {
  //
  const { user } = req;

  return res.render('template/view', {
    pageName: `../addCharacter`,
    user: user,
  });
});

/**
 * 아이템 생성 페이지
 */
router.get('/newItem', authPageMiddleware, async (req, res, next) => {
  //
  const { user } = req;

  return res.render('template/view', {
    pageName: `../addItem`,
    user: user,
  });
});

export default router;
