import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: '1.0.0',
    title: 'Item Simulator',
    description: 'Chapter 3, 개인과제 - 아이템 시뮬레이터 ',
  },
  servers: [
    {
      url: '/api/',
      description: '',
    },
    // { ... }
  ],
  tags: [
    {
      name: '', // Tag name
      description: '', // Tag description
    },
  ],
  components: {
    schemas: {
      signUp: {
        $email: 'user@email.com',
        $password: 'qwer1234',
        $name: '김유저',
      },
      signIn: {
        $email: 'user@email.com',
        $password: 'qwer1234',
      },
      getItems: {
        $data: [
          {
            $itemCode: 8,
            $itemName: '망가진 노트북2',
            $itemType: 'ACCESSORY',
            $itemStat: {
              $power: '10',
              $health: '20',
            },
            $itemPrice: 500,
          },
        ],
      },
      getItem: {
        $data: {
          $itemCode: 8,
          $itemName: '망가진 노트북',
          $itemType: 'ACCESSORY',
          $itemStat: {
            $power: '10',
            $health: '20',
          },
          $itemPrice: 500,
        },
      },
      addItem: {
        $itemName: '대나무 회초리',
        $itemType: 'WEAPON',
        $itemStat: {
          $power: '10',
          $health: '20',
        },
        $itemPrice: 500,
      },
      editItem: {
        $itemName: '대나무 회초리',
        $itemStat: {
          $power: '10',
          $health: '20',
        },
      },
      addCharacterReq: {
        $characterName: '노래하는오징어',
      },
      addCharacterRes: {
        $characterName: '노래하는오징어',
      },
    },
  }, // by default: empty object
};

const outputFile = './swagger-output.json';
const routes = [
  './src/routes/users.router.js',
  './src/routes/items.router.js',
  './src/routes/character.router.js',
  './src/routes/characterActions.router.js',
];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen({ openapi: '3.1.0' })(outputFile, routes, doc).then(async () => {
  await import('../app.js'); // Your project's root file
});
