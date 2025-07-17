function messeging() {
  Messege.querySelector('svg').addEventListener('click', e => {
    Messege.classList.add('hidden')
  })
}

function showMessege(header, messege) {
  Messege.querySelector('h1').innerHTML = header
  Messege.querySelector('p').innerHTML = messege
  Messege.classList.remove('hidden')

  clearTimeout(messegeTimeOutId)
  messegeTimeOutId = setTimeout(() => {
    Messege.classList.add('hidden')
  }, 3000)
}

let messegeTimeOutId
messeging()

username.addEventListener('keyup', ev => {
  if (ev.key === 'Enter') password.focus()
})

password.addEventListener('keyup', ev => {
  if (ev.key === 'Enter') login.focus()
})

togglePassword.addEventListener('input', ev => {
  if (ev.target.checked) password.type = 'text'
  else password.type = 'password'
})

login.addEventListener('click', e => {
  const { ipcRenderer } = require('electron')
  const { DatabaseSync } = require('node:sqlite')
  const db = new DatabaseSync('database.db')
  const stmt = db.prepare('select * from Users where id = ?')
  const user = stmt.get(1)
  db.close()

  if (!user) {
    ipcRenderer.send('open:mainWindow')
    close()
  }
  //
  else if (
    user.name === username.value.trim() &&
    user.password === password.value.trim()
  ) {
    ipcRenderer.send('open:mainWindow')
    close()
  }
  //
  else {
    showMessege('Error', 'Username or password does not match')
    username.focus()
  }
})

username.focus()
