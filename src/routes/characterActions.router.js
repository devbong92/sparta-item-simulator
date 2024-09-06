import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import { Prisma } from '@prisma/client';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * 게임머니 증가
 */
router.patch('/work/:characterId', authMiddleware, async (req, res, next) => {
  try {
    const { user } = req;
    const { characterId } = req.params;
    const workMoney = 10000;

    const character = await prisma.characters.findFirst({
      where: {
        characterId: +characterId,
        userId: user.userId,
      },
    });
    if (!character) return res.status(400).json({ message: '잘못된 캐릭터 정보입니다.' });

    await prisma.characters.update({
      data: {
        money: character.money + workMoney,
      },
      where: {
        characterId: character.characterId,
      },
    });

    return res.status(200).json({
      message: `[${character.characterName}]가 [${workMoney.toLocaleString('ko-KR')}]의 급여를 받았습니다.`,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 아이템 구입 API
 */
router.post('/buy/:characterId/:itemCode', authMiddleware, async (req, res, next) => {
  const { user } = req;
  const { itemCode, characterId } = req.params;

  try {
    const character = await prisma.characters.findFirst({
      where: {
        characterId: +characterId,
        userId: user.userId,
      },
    });
    if (!character) return res.status(400).json({ message: '잘못된 캐릭터 정보입니다.' });

    const item = await prisma.items.findFirst({
      where: { itemCode: +itemCode },
    });
    if (!item) return res.status(404).json({ message: '아이템 정보가 존재하지 않습니다.' });

    await prisma.$transaction(
      async (tx) => {
        // 소지금 감소
        await tx.characters.update({
          data: {
            money: character.money - item.itemPrice,
          },
          where: {
            characterId: character.characterId,
          },
        });
        // 인벤토리에 아이템 추가
        await tx.inventories.create({
          data: {
            characterId: character.characterId,
            itemCode: item.itemCode,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );

    return res.status(201).json({ message: `[${item.itemName}]를 구매하였습니다.` });
  } catch (err) {
    next(err);
  }
});

/**
 * 아이템 판매 API
 */
router.post('/sell/:characterId/:invenId', authMiddleware, async (req, res, next) => {
  const { user } = req;
  const { invenId, characterId } = req.params;

  try {
    const character = await prisma.characters.findFirst({
      where: {
        characterId: +characterId,
        userId: user.userId,
      },
    });
    if (!character) return res.status(400).json({ message: '잘못된 캐릭터 정보입니다.' });

    const myInven = await prisma.inventories.findFirst({
      select: {
        invenId: true,
        item: {
          select: {
            itemCode: true,
            itemName: true,
            itemPrice: true,
          },
        },
      },
      where: { invenId: +invenId },
    });
    if (!myInven) return res.status(404).json({ message: '아이템 정보가 존재하지 않습니다.' });

    // 판매대금은 원가에 60%
    const cellPrice = Math.floor(myInven.item.itemPrice * 0.6);

    await prisma.$transaction(
      async (tx) => {
        // 소지금 증가
        await tx.characters.update({
          data: {
            money: character.money + cellPrice,
          },
          where: {
            characterId: character.characterId,
          },
        });
        // 인벤토리에 아이템 추가
        await tx.inventories.delete({
          where: {
            invenId: myInven.invenId,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );

    return res
      .status(201)
      .json({ message: `[${myInven.item.itemName}]를 [${cellPrice}]에 판매하였습니다.` });
  } catch (err) {
    next(err);
  }
});

/**
 * 인벤토리 목록 조회
 */
router.get('/:characterId/inventory', authMiddleware, async (req, res, next) => {
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

    const myInventory = await prisma.inventories.findMany({
      select: {
        invenId: true,
        item: {
          select: {
            itemCode: true,
            itemName: true,
            itemPrice: true,
          },
        },
        wearYn: true,
      },
      where: {
        characterId: character.characterId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({ data: myInventory });
  } catch (err) {
    next(err);
  }
});

/**
 * 아이템 장착
 */
router.post('/dress/:characterId/:invenId', authMiddleware, async (req, res, next) => {
  const { user } = req;
  const { invenId, characterId } = req.params;

  try {
    const myCharacter = await prisma.characters.findFirst({
      where: {
        characterId: +characterId,
        userId: user.userId,
      },
    });
    if (!myCharacter) return res.status(400).json({ message: '잘못된 캐릭터 정보입니다.' });

    const myInven = await prisma.inventories.findFirst({
      select: {
        invenId: true,
        wearYn: true,
        item: {
          select: {
            itemCode: true,
            itemName: true,
            itemPrice: true,
            itemStat: true,
          },
        },
      },
      where: { invenId: +invenId },
    });
    if (!myInven) return res.status(404).json({ message: '아이템 정보가 존재하지 않습니다.' });
    else if (myInven.wearYn === 'Y')
      return res.status(400).json({ message: '이미 착용하고 있는 아이템입니다.' });

    console.log('myInven.item => ', myInven.item);

    const myItemStat = myInven.item.itemStat;

    await prisma.$transaction(
      async (tx) => {
        // 인벤 수정
        await tx.inventories.update({
          data: {
            wearYn: 'Y',
          },
          where: {
            invenId: myInven.invenId,
          },
        });

        // 인벤토리에 아이템 추가
        await tx.equipments.create({
          data: {
            characterId: myCharacter.characterId,
            invenId: myInven.invenId,
          },
        });

        const updateHealth = myCharacter.health + (myItemStat.health || 0);
        const updatePower = myCharacter.power + (myItemStat.power || 0);
        // 캐릭터 능력치 증가
        await tx.characters.update({
          data: {
            health: updateHealth,
            power: updatePower,
          },
          where: {
            characterId: myCharacter.characterId,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );

    return res.status(200).json({ message: '착용완료' });
  } catch (err) {
    next(err);
  }
});

/**
 * 아이템 탈착
 */
router.post('/unDress/:characterId/:invenId', authMiddleware, async (req, res, next) => {
  const { user } = req;
  const { invenId, characterId } = req.params;

  try {
    const myCharacter = await prisma.characters.findFirst({
      where: {
        characterId: +characterId,
        userId: user.userId,
      },
    });
    if (!myCharacter) return res.status(400).json({ message: '잘못된 캐릭터 정보입니다.' });

    const myInven = await prisma.inventories.findFirst({
      select: {
        invenId: true,
        wearYn: true,
        item: {
          select: {
            itemCode: true,
            itemName: true,
            itemPrice: true,
            itemStat: true,
          },
        },
      },
      where: { invenId: +invenId },
    });
    if (!myInven) return res.status(404).json({ message: '아이템 정보가 존재하지 않습니다.' });

    const myEquip = await prisma.equipments.findFirst({
      where: {
        characterId: myCharacter.characterId,
        invenId: myInven.invenId,
      },
    });
    if (!myEquip || myInven.wearYn === 'N')
      return res.status(404).json({ message: '이미 착용 해제된 아이템입니다.' });

    const myItemStat = myInven.item.itemStat;

    await prisma.$transaction(
      async (tx) => {
        // 인벤 수정
        await tx.inventories.update({
          data: {
            wearYn: 'N',
          },
          where: {
            invenId: myInven.invenId,
          },
        });

        // 장비 테이블에서 아이템 제거
        await tx.equipments.delete({
          where: {
            equipmentId: myEquip.equipmentId,
          },
        });

        const updateHealth = myCharacter.health - (myItemStat.health || 0);
        const updatePower = myCharacter.power - (myItemStat.power || 0);
        // 캐릭터 능력치 감소
        await tx.characters.update({
          data: {
            health: updateHealth,
            power: updatePower,
          },
          where: {
            characterId: myCharacter.characterId,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );

    return res.status(200).json({ message: `[${myInven.item.itemName}]가 착용 해제되었습니다.` });
  } catch (err) {
    next(err);
  }
});

/**
 * 캐릭터가 보유한 인벤토리 내 아이템 목록 조회
 */
router.get('/dressed/:characterId', authMiddleware, async (req, res, next) => {
  //
  const { user } = req;
  const { characterId } = req.params;

  try {
    const myCharacter = await prisma.characters.findFirst({
      where: {
        characterId: +characterId,
        userId: user.userId,
      },
    });
    if (!myCharacter) return res.status(400).json({ message: '잘못된 캐릭터 정보입니다.' });

    const myEquip = await prisma.equipments.findMany({
      select: {
        equipmentId: true,
        invenId: true,
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

    return res.status(200).json({ data: myEquip });
  } catch (err) {
    next(err);
  }
});

export default router;
