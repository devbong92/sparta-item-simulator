import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import { Prisma } from '@prisma/client';
import joi from 'joi';

const router = express.Router();

/**
 * 아이템 목록 조회 API
 */
router.get('/items', async (req, res, next) => {
  /**
   * #swagger.tags = ['아이템 목록 조회 API']
   * #swagger.description = '모든 아이템을 조회한다.'
   * #swagger.responses[200] = {
          schema: {$ref: "#/components/schemas/getItems"}  
      }
   */
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
  /**
   * #swagger.tags = ['아이템 상세 조회 API']
   * #swagger.description = '특정 아이템을 조회한다.'
   * #swagger.responses[200] = {
          schema: {$ref: "#/components/schemas/getItem"}  
      }
   */
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
  /**
   * #swagger.tags = ['아이템 생성 API']
   * #swagger.description = '아이템을 생성한다.'
   * #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/addItem"
                }  
            }
        }
      }
   */

  try {
    const joiSchema = joi.object({
      itemName: joi.string().required().messages({
        'string.base': '아이템명은 문자열이어야 합니다.',
        'any.required': '아이템명을 입력해주세요.',
      }),
      itemType: joi.string().valid('WEAPON', 'ARMOR', 'ACCESSORY').required().messages({
        'string.base': '타입은 문자열이어야 합니다.',
        'any.required': '타입을 입력해주세요.',
        'any.only': '아이템 타입을 확인해주세요.',
      }),
      itemStat: joi.object().required().messages({
        'json.base': '아이템 능력은 JSON타입이어야 합니다.',
        'any.required': '아이템 능력을 입력해주세요.',
      }),
      itemPrice: joi.number().required().messages({
        'number.base': '아이템 가격은 숫자타입이어야 합니다.',
        'any.required': '아이템 가격을 입력해주세요.',
      }),
    });

    const validation = await joiSchema.validateAsync(req.body);

    const { itemName, itemType, itemStat, itemPrice } = validation;

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
  /**
   * #swagger.tags = ['아이템 생성 API']
   * #swagger.description = '아이템을 생성한다.'
   * #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/editItem"
                }  
            }
        }
      }
   */

  try {
    const joiSchema = joi.object({
      itemName: joi.string().required().messages({
        'string.base': '아이템명은 문자열이어야 합니다.',
        'any.required': '아이템명을 입력해주세요.',
      }),
      itemStat: joi.object().required().messages({
        'json.base': '아이템 능력은 JSON타입이어야 합니다.',
        'any.required': '아이템 능력을 입력해주세요.',
      }),
    });

    const validation = await joiSchema.validateAsync(req.body);

    const { itemCode } = req.params;
    const { itemName, itemStat } = validation;

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
  } catch (err) {
    next(err);
  }
});

export default router;
