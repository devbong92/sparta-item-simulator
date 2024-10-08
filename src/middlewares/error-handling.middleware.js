/**
 * 에러 핸들러
 * @param {*} err
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export default function (err, req, res, next) {
  // TODO: 에러메시지 커스텀 예정
  // PrismaClientValidationError : 400 으로 ㄱㄱ?

  console.error('[ERROR 1] ', err.name);
  console.error('[ERROR 2] ', err.message);
  console.error('[ERROR 3] ', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: `${err.message}`,
    });
  } else if (err.message === 'jwt expired' || err.message === 'TokenExpiredError') {
    return res.status(401).json({
      message: `만료된 토큰입니다.`,
    });
  } else if (
    err.message === 'invalid token' ||
    err.message === 'jwt malformed' ||
    err.message === 'invalid signature'
  ) {
    console.error('[ JWT ERR ]', err.name, err.message);
    return res.status(401).json({
      message: `잘못된 토큰입니다.`,
    });
  }
  return res.status(500).json({
    message: `서버에서 오류가 발생했습니다. `,
  });
}
