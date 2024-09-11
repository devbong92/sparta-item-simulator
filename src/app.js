import express from 'express';
import UserRouter from './routes/users.router.js';
import ItemRouter from './routes/items.router.js';
import CharacterRouter from './routes/character.router.js';
import CharacterActionRouter from './routes/characterActions.router.js';
import errorHandlingMiddleware from './middlewares/error-handling.middleware.js';
import expressSession from 'express-session';
import expressMySQLSession from 'express-mysql-session';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './swagger/swagger-output.json' assert { type: 'json' };
import authPageMiddleware from './middlewares/authPage.middleware.js';
import cookieParser from 'cookie-parser';
import pagesRouter from './routes/pages.router.js';

// .env => process.env
dotenv.config();

const app = express();
const PORT = 3020;

// swagger-autogen
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// MySQLStore를 Express-Session을 이용해 생성합니다.
const MySQLStore = expressMySQLSession(expressSession);
const sessionStore = new MySQLStore({
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  expiration: 1000 * 60 * 60 * 24 * 1, // 세션의 만료 기간을 1일로 설정합니다.
  createDatabaseTable: true, // 세션 테이블을 자동으로 생성합니다.
});

// ejs setting
app.set('view engine', 'ejs');
app.use(express.static('assets'));

// api setting
app.use(express.json());
app.use(cookieParser());

// session setting
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 1, // 1일
    },
    store: sessionStore, // 외부 세션 스토리지를 MySQLStore로 설정한다.
  }),
);

// api
app.use('/api', [UserRouter, ItemRouter, CharacterRouter, CharacterActionRouter]);

app.use(errorHandlingMiddleware);

/**
 * 로그인 페이지
 */
app.get('/login', async (req, res, next) => {
  if (req.cookies.accessToken) {
    res.clearCookie('accessToken');
  }
  res.render('login', {});
});

/**
 * 루트 페이지
 */
app.get('/', authPageMiddleware, async (req, res, next) => {
  // session chcek

  // const previousUrl = req.headers.referer || req.headers.referrer; // 이전 URL
  // if (!previousUrl) return res.redirect('/login');

  const { user } = req;
  if (!user) return res.redirect('/login');

  return res.redirect('/index');
});

// 페이지 이동 라우터
app.use('/', [pagesRouter]);

/**
 * 페이지 이동
 */
app.get('/:pageName', authPageMiddleware, (req, res, next) => {
  const { pageName } = req.params;
  const { user } = req;

  if (pageName.toLowerCase() === 'login') {
    res.render('login', {});
  } else {
    res.render('template/view', {
      pageName: `../${pageName}`,
      user: user,
    });
  }
});

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
