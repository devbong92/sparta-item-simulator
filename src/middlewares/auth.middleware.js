import { prisma } from '../utils/prisma/index.js';
import Utils from '../utils/Utils.js';

/**
 * 인증 핸들러
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
export default async function (req, res, next) {
  try {
    const userId = Utils.verify(req.headers.authorization);
    if (!userId) throw new Error('로그인이 필요합니다.');

    // 가장 최근 로그인 된 userId와 토큰값을 비교
    if (
      req.session.userId === userId &&
      req.session.accessToken !== req.headers.authorization.split(' ')[1]
    ) {
      throw new Error('신규 발급된 토큰이 아닙니다. 신규 발급된 토근을 사용하세요.');
    }

    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });
    if (!user) {
      throw new Error('토큰 사용자가 존재하지 않습니다.');
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}
