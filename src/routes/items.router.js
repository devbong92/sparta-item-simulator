import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import { Prisma } from '@prisma/client';

const router = express.Router();

/**
 * 아이템 목록 조회 API
 */
router.get('/items', async (req, res, next) => {
  try {
    const items = await prisma.items.findMany({
      select: {
        itemCode: true,
        itemName: true,
        itemType: true,
        itemStat: true,
        itemPrice: true,
      },
      orderBy: {
        createdAt: 'desc', // 게시글을 최신순으로 정렬합니다.
      },
    });

    return res.status(200).json({ data: items });
  } catch (err) {
    next(err);
  }
});

/**
 * 아이템 상세 조회 API
 */
router.get('/items/:itemCode', async (req, res, next) => {
  try {
    const { itemCode } = req.params;

    const items = await prisma.items.findFirst({
      select: {
        itemCode: true,
        itemName: true,
        itemType: true,
        itemStat: true,
        itemPrice: true,
      },
      where: {
        itemCode: +itemCode,
      },
    });

    return res.status(200).json({ data: items });
  } catch (err) {
    next(err);
  }
});

/**
 * 아이템 생성 API
 */
router.post('/items', async (req, res, next) => {
  const { itemName, itemType, itemStat, itemPrice } = req.body;

  try {
    const item = await prisma.items.create({
      data: {
        itemName,
        itemType,
        itemStat: itemStat,
        itemPrice: +itemPrice,
      },
    });

    return res.status(201).json({ data: item });
  } catch (err) {
    next(err);
  }
});

/**
 * 아이템 수정 API
 */
router.patch('/items/:itemCode', async (req, res, next) => {
  const { itemCode } = req.params;
  const { itemName, itemStat } = req.body;

  let item = await prisma.items.findFirst({
    where: { itemCode: +itemCode },
  });
  if (!item) return res.status(400).json({ message: '아이템 정보가 존재하지 않습니다.' });

  await prisma.$transaction(
    async (tx) => {
      item = await tx.items.update({
        data: {
          itemName,
          itemStat,
        },
        where: {
          itemCode: item.itemCode,
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    },
  );

  return res.status(201).json({ data: item });
});

export default router;
