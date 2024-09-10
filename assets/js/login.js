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
  const pass = document.getElementById('signInPass').value;
  const email = document.getElementById('signInEmail').value;

  if (!pass || !email) {
    alert('값을 입력하세요.');
    return false;
  }

  let data = {
    email: email,
    password: pass,
  };

  fetch('/api/sign-in', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      const res = await response.json();
      alert(res.message);
      if (response.ok) {
        location.href = '/index';
      }
    })
    .catch((err) => {
      console.log('err => ', err.message);
      alert('오류가 발생했습니다.');
    });
});

document.getElementById('signUp_btn').addEventListener('click', () => {
  // 추후 암호화 처리 RSA?
  const pass = document.getElementById('signUpPass').value;

  let data = {
    name: document.getElementById('signUpName').value,
    email: document.getElementById('signUpEmail').value,
    password: pass,
  };

  fetch('/api/sign-up', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      const res = await response.json();
      alert(res.message);
      if (response.ok) signInButton.click();
    })
    .catch((err) => {
      console.log('err => ', err.message);
      alert('오류가 발생했습니다.');
    });
});
