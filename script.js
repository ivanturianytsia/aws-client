var sections = {}
var sectionNames = ['profile', 'login', 'register', 'confirm']
sectionNames.forEach(item => {
  sections[item] = document.getElementById(item)
  sections[item].style.display = 'none'
})

document.getElementById('login__btn').addEventListener('click', function (event) {
  showError()
  event.preventDefault()
  var email = document.getElementById('login__email').value
  var password = document.getElementById('login__password').value

  if (!email || !password) return

  Cognito.logIn(email, password)
    .then(result => {
      if (result.idToken && result.idToken.jwtToken) {
        window.localStorage.setItem('i-token', result.idToken.jwtToken)
      }
      return getUser()
    })
    .catch(err => {
      showError(err)
    })
})

document.getElementById('register__btn').addEventListener('click', function (event) {
  showError()
  event.preventDefault()
  var email = document.getElementById('register__email').value
  var password = document.getElementById('register__password').value

  if (!email || !password) return

  Cognito.signUp(email, password)
    .then(result => {
      showSection('confirm')
    })
    .catch(err => {
      showError(err)
    })
})

document.getElementById('confirm__btn').addEventListener('click', function (event) {
  showError()
  event.preventDefault()
  var email = document.getElementById('confirm__email').value
  var code = document.getElementById('confirm__code').value

  if (!email || !code) return

  Cognito.confirm(email, code)
    .then(result => {
      showSection('login')
    })
    .catch(err => {
      showError(err)
    })
})

function logout() {
  Cognito.signOut()
    .then(result => {
      showSection('login')
    })
    .catch(err => {
      console.log(err)
      showSection('login')
    })
}

document.getElementById('profile__logout').addEventListener('click', function (event) {
  event.preventDefault()

  logout()
})

function getUser() {
  showError()
  return Cognito.getUser()
    .then(result => {
      if (result.email) {
        document.getElementById('profile__email').innerText = result.email
        showSection('profile')
      }
    })
    .catch(err => {
      showSection('login')
      console.log(err)
    })
}

function showSection(section) {
  showError()
  sectionNames.forEach(item => {
    sections[item].style.display = item === section ? 'block' : 'none'
  })
}

document.getElementById('login__to-register').addEventListener('click', function() {
  showSection('register')
})
document.getElementById('register__to-login').addEventListener('click', function() {
  showSection('login')
})
document.getElementById('confirm__to-login').addEventListener('click', function() {
  showSection('login')
})

document.getElementById('profile__file').addEventListener('change', function (event) {
  showError()
  document.getElementById('profile__result').style.display = 'none'
  if (event.target.files.length === 0) {
    return
  }
  var file = event.target.files[0]
  
  var token = window.localStorage.getItem('i-token')
  if (!token) {
    logout()
    return
  }

  // var baseUrl = 'https://f055zf4mrk.execute-api.us-east-1.amazonaws.com/lofino'
  var baseUrl = 'http://lofino-env.irjzvcqzqp.eu-central-1.elasticbeanstalk.com'
  // var baseUrl = 'http://localhost:3000'
  fetch(baseUrl + '/upload', {
    method: 'POST',
    body: file,
    headers: {
      'Content-Type': 'image/jpeg',
      'Authorization': token
    }
  })
  .then(res => res.json())
  .then(res => {
    document.getElementById('profile__result').style.display = 'inline'
    console.log(res)
  })
  .catch(err => {
    showError(err)
  })
})

function init () {
  getUser()
}

init()


function showError(text) {
  if (text) {
    console.log(text)
    document.getElementById('error__text').innerText = text
    document.getElementById('error').style.display = 'block'
  } else {
    document.getElementById('error__text').innerText = ''
    document.getElementById('error').style.display = 'none'
  }
}
