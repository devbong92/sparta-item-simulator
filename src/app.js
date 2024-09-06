import express from 'express';
import UserRouter from './routes/users.router.js';
import ItemRouter from './routes/items.router.js';
import CharacterRouter from './routes/character.router.js';
import CharacterActionRouter from './routes/characterActions.router.js';
import errorHandlingMiddleware from './middlewares/error-handling.middleware.js';
import expressSession from 'express-session';
import expressMySQLSession from 'express-mysql-session';
import dotenv from 'dotenv';

// .env => process.env
dotenv.config();

const app = express();
const PORT = 3020;

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

app.get('/', (req, res, next) => {
  // session chcek
  res.redirect('/login');
});

/**
 * 페이지 이동
 */
app.get('/:pageName', (req, res, next) => {
  const { pageName } = req.params;

  if (pageName.toLowerCase() === 'login') {
    res.render('login', {});
  } else {
    res.render('template/view', {
      pageName: `../${pageName}`,
    });
  }
});

app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
