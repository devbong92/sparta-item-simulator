import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: '1.0.0', // by default: '1.0.0'
    title: 'Item Simulator', // by default: 'REST API'
    description: '개인과제', // by default: ''
  },
  servers: [
    {
      url: 'http://localhost:3020', // by default: 'http://localhost:3000'
      description: '', // by default: ''
    },
    // { ... }
  ],
  tags: [
    // by default: empty Array
    {
      name: '', // Tag name
      description: '', // Tag description
    },
    // { ... }
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
    },
  }, // by default: empty object
};

const outputFile = './swagger-output.json';
const routes = ['./src/routes/users.router.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen({ openapi: '3.1.0' })(outputFile, routes, doc).then(async () => {
  await import('../app.js'); // Your project's root file
});
