const { ipcRenderer } = require('electron')

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

function nextRowId(tableName) {
  const { DatabaseSync } = require('node:sqlite')
  const db = new DatabaseSync('database.db')
  const sql = `SELECT * FROM ${tableName}`
  const result = db.prepare(sql).all().length
  db.close()

  return result + 1
}

function mobileInput(selector) {
  selector.addEventListener('keydown', e => {
    e.preventDefault()

    let value = e.target.value
    let length = value.length
    let selectionStart = e.target.selectionStart
    let selectionEnd = e.target.selectionEnd

    let chunk1 = value.slice(0, selectionStart)
    let chunk2 = value.slice(selectionEnd, length)

    if (e.key >= '0' && e.key <= '9') {
      if (e.target.value.length >= 12) return
      if (e.target.value.length === 0 && e.key !== '0') return
      if (e.target.value.length === 1 && e.key !== '1') return
      if (e.target.value.length === 5 && e.key !== '-') {
        e.target.value = chunk1 + '-' + e.key + chunk2
        e.target.selectionStart = chunk1.length + 2
        e.target.selectionEnd = chunk1.length + 2
        return
      }

      e.target.value = chunk1 + e.key + chunk2
      e.target.selectionStart = chunk1.length + 1
      e.target.selectionEnd = chunk1.length + 1
    }

    if (e.key === '-' && e.target.value.length === 5) {
      e.target.value = chunk1 + e.key + chunk2
      e.target.selectionStart = chunk1.length + 1
      e.target.selectionEnd = chunk1.length + 1
    }

    if (e.key === 'Backspace') {
      if (selectionStart === selectionEnd) {
        selectionStart =
          e.target.selectionStart - 1 >= 0 ? e.target.selectionStart - 1 : 0
      }

      let chunk1 = value.slice(0, selectionStart)
      let chunk2 = value.slice(selectionEnd, length)

      e.target.value = chunk1 + chunk2
      e.target.selectionStart = chunk1.length
      e.target.selectionEnd = chunk1.length
    }
  })
}

function intInput(element) {
  element.addEventListener('keydown', e => {
    e.preventDefault()

    let value = '' + (Number(e.target.value) > 0 ? Number(e.target.value) : '')

    if (e.key >= '0' && e.key <= '9') {
      if (
        e.key === '0' &&
        e.target.value.length === 1 &&
        e.target.value === '0'
      )
        return
      e.target.value = Number(value + e.key)
    } else if (e.key === 'ArrowUp') {
      let current = Number(value)
      current++
      e.target.value = current
    } else if (e.key === 'ArrowDown') {
      let current = Number(value)
      current = current - 1 >= 0 ? current - 1 : 0
      e.target.value = current
    } else if (e.key === 'Backspace') {
      e.target.value =
        Number(value.slice(0, e.target.value.length - 1)) > 0
          ? Number(value.slice(0, e.target.value.length - 1))
          : ''
    }
  })
}

function focus(element) {
  if (element.type === 'date') {
    element.focus()
  } else {
    element.selectionStart = 0
    element.selectionEnd = element.value.length
    element.focus()
  }
}

function clear() {
  patientCardNo.value = ''
  patientName.value = ''
  patientMobile.value = ''
  patientNid.value = ''
  patientAddress.value = ''
  patientSave.value = ''
  patientCardNo.value = ''
}

function enterToNextInput(inputList) {
  for (let i = 0; i < inputList.length - 1; i++) {
    inputList[i].addEventListener('keyup', e => {
      if (e.key === 'Enter') {
        if (inputList[i + 1].type === 'date') {
          focus(inputList[i + 1])
        } else {
          inputList[i + 1].selectionStart = 0
          inputList[i + 1].selectionEnd = inputList[i + 1].value.length
          focus(inputList[i + 1])
        }
      }
    })
  }
}

function getData(sortBy) {
  const { DatabaseSync } = require('node:sqlite')
  let db = new DatabaseSync('database.db')
  let stmt

  if (sortBy === 'name')
    stmt = db.prepare(`SELECT * from Patients ORDER BY UPPER(name) ASC`)
  else if (sortBy === 'name_rev') {
    stmt = db.prepare(`SELECT * from Patients ORDER BY UPPER(name) DESC`)
  } else if (sortBy === 'id') {
    stmt = db.prepare(`SELECT * from Patients ORDER BY id ASC`)
  } else if (sortBy === 'id_rev') {
    stmt = db.prepare(`SELECT * from Patients ORDER BY id DESC`)
  } else if (sortBy === 'card_no') {
    stmt = db.prepare(`SELECT * from Patients ORDER BY card_no ASC`)
  } else if (sortBy === 'card_no_rev') {
    stmt = db.prepare(`SELECT * from Patients ORDER BY card_no DESC`)
  }

  const datas = stmt.all()
  db.close()
  return datas
}

function sanitize(searchTerm, datas) {
  let niddle
  const startsWith = new Set()
  const possibleNameMatch = new Set()

  try {
    niddle = new RegExp(searchTerm, 'i')
  } catch (err) {
    niddle = new RegExp('')
  }

  datas.forEach(data => {
    if (data.id == searchTerm) {
      startsWith.add(data)
      return
    }

    if (String(data.card_no) == searchTerm) {
      startsWith.add(data)
      return
    }

    if (data.name.toUpperCase().startsWith(searchTerm.toUpperCase())) {
      startsWith.add(data)
      return
    }

    if (
      String(data.card_no).toUpperCase().startsWith(searchTerm.toUpperCase())
    ) {
      startsWith.add(data)
      return
    }

    if (niddle.test(data.name)) {
      possibleNameMatch.add(data)
      return
    }

    if (niddle.test(String(data.card_no))) {
      possibleNameMatch.add(data)
      return
    }
  })

  const sanitized = [...startsWith, ...possibleNameMatch]

  return sanitized
}

function render() {
  patientId.value = nextRowId('Patients')
  let searchTerm = search.value.trim()
  let display_per_page = Number(displayPerPage.value) || 100
  let goto_page = Number(gotoPage.value) || 1
  let sort_by = sortBy.value

  const allSortedData = sanitize(searchTerm, getData(sort_by))
  const possiblePage = Math.ceil(allSortedData.length / display_per_page)
  totalPage.innerHTML = possiblePage

  const toRenderData = allSortedData.slice(
    (goto_page - 1) * display_per_page,
    allSortedData.length <= goto_page * display_per_page
      ? allSortedData.length
      : goto_page * display_per_page
  )

  let htmlString = ''
  toRenderData.forEach(list => {
    htmlString += `
        <tr data-id=${list.id}>
          <td>${list.id}</td>
          <td>${list.card_no}</td>
          <td>${list.name}</td>
          <td>${list.address}</td>
          <td>${list.mobile}</td>
          <td>${list.nid}</td>
        </tr>
      `
  })

  document.querySelector('tbody').innerHTML = ''
  document.querySelector('tbody').innerHTML = htmlString
}

function edit(id) {
  editPatient.showModal()
  const { DatabaseSync } = require('node:sqlite')
  const db = new DatabaseSync('database.db')
  let data = db.prepare('select * from Patients where id = ?').get(id)

  editPatientId.value = data.id
  editPatientCardNo.value = data.card_no
  editPatientName.value = data.name
  editPatientMobile.value = data.mobile
  editPatientNid.value = data.nid
  editPatientAddress.value = data.address
}

patientSave.addEventListener('click', e => {
  if (patientName.value !== '') {
    const { DatabaseSync } = require('node:sqlite')
    const db = new DatabaseSync('database.db')

    db.prepare(
      `INSERT INTO Patients(card_no, name, mobile, nid, address) VALUES (?, ?, ?, ?, ?)`
    ).run(
      patientCardNo.value.trim(),
      patientName.value.trim(),
      patientMobile.value.trim(),
      patientNid.value.trim(),
      patientAddress.value.trim()
    )
    showMessege(
      'Successfully Created',
      `CardNo: ${patientCardNo.value.trim()}, Name: ${patientName.value.trim()}`
    )
    clear()
    render()
  }
})

editPatientSave.addEventListener('click', e => {
  if (editPatientName.value !== '') {
    const { DatabaseSync } = require('node:sqlite')
    const db = new DatabaseSync('database.db')

    db.prepare(
      `update Patients set card_no = ?, name = ?, mobile = ?, nid = ?, address = ? where id = ?`
    ).run(
      editPatientCardNo.value.trim(),
      editPatientName.value.trim(),
      editPatientMobile.value.trim(),
      editPatientNid.value.trim(),
      editPatientAddress.value.trim(),
      editPatientId.value.trim()
    )

    showMessege(
      'Successfully Updated',
      `CardNo: ${editPatientCardNo.value.trim()}`
    )
    clear()
    render()
    editPatient.close()
  }
})

editPatientCancel.addEventListener('click', e => {
  editPatient.close()
})

document.querySelector('tbody').addEventListener('click', e => {
  edit(e.target.closest('tr').dataset['id'])
})

sortBy.addEventListener('input', render)
gotoPage.addEventListener('keyup', render)
search.addEventListener('input', () => {
  gotoPage.value = 1
  render()
})

displayPerPage.addEventListener('input', () => {
  gotoPage.value = 1
  render()
})

changePassword.addEventListener('click', () => {
  editPassword.showModal()
  const { DatabaseSync } = require('node:sqlite')
  const db = new DatabaseSync('database.db')
  const stmt = db.prepare('select * from Users where id = ?')

  try {
    const user = stmt.get(1)
    username.value = user.name || ''
  } catch (err) {
    username.value = ''
  }

  db.close()
})

editPasswordCancel.addEventListener('click', () => {
  username.value = ''
  oldPassword.value = ''
  newPassword.value = ''

  editPassword.close()
})

editPasswordOk.addEventListener('click', () => {
  const { DatabaseSync } = require('node:sqlite')
  const db = new DatabaseSync('database.db')
  const stmt = db.prepare('select * from Users where id = ?')

  const user = stmt.get(1)
  if (!user) {
    db.prepare('insert into Users(name, password) values(?, ?)').run(
      username.value.trim(),
      newPassword.value.trim()
    )
    username.value = ''
    oldPassword.value = ''
    newPassword.value = ''
    editPassword.close()
  } else if (user.password === oldPassword.value) {
    db.prepare('update Users set name = ?, password = ?').run(
      username.value.trim(),
      newPassword.value.trim()
    )
    editPassword.close()
  } else showMessege('Error', 'Your passoword is not match')

  db.close()
})

backup.addEventListener('click', () => {
  ipcRenderer.send('open:dialog')
})

ipcRenderer.on('open:dialog', (e, d) => {
  const path = require('node:path')
  const { backup, DatabaseSync } = require('node:sqlite')
  const db = new DatabaseSync('database.db')
  let date = new Date()

  backup(
    db,
    path.resolve(
      d[0],
      `database.${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()} ${date.getHours()}.${date.getMinutes()}.db`
    )
  )
    .then(() => {
      showMessege(
        'Successfully Backuped',
        `Location: ${path.resolve(
          d[0],
          `database.${date.getDate()}-${
            date.getMonth() + 1
          }-${date.getFullYear()} ${date.getHours()}.${date.getMinutes()}.db`
        )}`
      )
    })
    .catch(err => {
      showMessege('Error', `Error: ${err.name}`)
    })
})

enterToNextInput([search, gotoPage, search])

enterToNextInput([
  patientCardNo,
  patientName,
  patientMobile,
  patientNid,
  patientAddress,
  patientSave,
  patientCardNo
])

enterToNextInput([
  editPatientCardNo,
  editPatientName,
  editPatientMobile,
  editPatientNid,
  editPatientAddress,
  editPatientSave
])

enterToNextInput([username, oldPassword, newPassword, editPasswordOk])

intInput(gotoPage)
intInput(patientCardNo)
intInput(editPatientCardNo)
intInput(patientNid)
intInput(editPatientNid)

mobileInput(patientMobile)
mobileInput(editPatientMobile)

render()
focus(patientCardNo)
