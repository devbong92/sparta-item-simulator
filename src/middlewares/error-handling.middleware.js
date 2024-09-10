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
  }

  return res.status(500).json({
    message: `서버에서 오류가 발생했습니다. `,
  });
}
