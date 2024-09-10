import { prisma } from '../utils/prisma/index.js';
import Utils from '../utils/Utils.js';

export default async function (req, res, next) {
  try {
    // const previousUrl = req.headers.referer || req.headers.referrer; // 이전 URL
    // if (!previousUrl) return res.redirect('/login');

    const userId = Utils.verify(req.cookies.accessToken);

    if (!userId) throw new Error('로그인이 필요합니다.');

    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });
    if (!user) {
      throw new Error('토큰 사용자가 존재하지 않습니다.');
    }

    req.user = user;

    next();
  } catch (error) {
    return res.redirect('/login');
  }
}
