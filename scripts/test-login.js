// Test admin login functionality
console.log('Testing admin login...')

const loginData = {
  email: 'admin@rupomoti.com',
  password: 'admin123'
}

fetch('http://localhost:3001/api/auth/callback/credentials', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    email: loginData.email,
    password: loginData.password,
    redirect: 'false',
    json: 'true'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Login response:', data)
})
.catch(err => {
  console.error('Login error:', err)
})
