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

  res.status(500).json({
    message: `서버에서 오류가 발생했습니다. [${err.name}]`,
  });
}
