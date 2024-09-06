const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
  container.classList.add('right-panel-active');
});

signInButton.addEventListener('click', () => {
  container.classList.remove('right-panel-active');
});

///

document.getElementById('signIn_btn').addEventListener('click', () => {
  alert('signIn_btn');
});

document.getElementById('signUp_btn').addEventListener('click', async () => {
  // 추후 암호화 처리 RSA?
  const pass = document.getElementById('signUpPass').value;

  let data = {
    name: document.getElementById('signUpName').value,
    email: document.getElementById('signUpEmail').value,
    password: pass,
  };

  const res = await fetch('/api/sign-up', {
    method: 'POST', // 또는 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => {
      console.log('err => ', err);
      alert('오류가 발생했습니다.');
    });

  alert(res.message);
  location.href = '/index';
});
