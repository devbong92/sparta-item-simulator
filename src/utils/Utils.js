import jwt from 'jsonwebtoken';

export default class Utils {
  constructor() {}

  /**
   * JWT 복호화
   * @param {*} req.headers.authorization
   * @returns
   */
  static verify(authorization) {
    try {
      const [tokenType, token] = authorization.split(' ');
      if (tokenType !== 'Bearer') throw new Error('토큰 타입이 일치하지 않습니다.');
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
      return decodedToken.userId;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}
