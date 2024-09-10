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

  console.error('[ERROR] ', err.name);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: `입력값을 다시 확인해주세요. [${err.name}]`,
    });
  }

  return res.status(500).json({
    message: `서버에서 오류가 발생했습니다. [${err.name}]`,
  });
}
