function changeMainCheckboxGroupEdit() {
  let mainCheckbox = document.getElementById("group-edit-main-checkbox")
  let cbs = document.querySelectorAll("#group-edit-table tbody tr:not([hidden]) input[type=checkbox]");
  let res = true;
  for (var i = 0; i < cbs.length; i++) {
    if (!cbs[i].checked) {
      res = false
    }
  }
  mainCheckbox.checked = res
}

function changeAllCheckboxes() {
  let mainCheckbox = document.getElementById("group-edit-main-checkbox");
  let cbs = document.querySelectorAll("#group-edit-table tr:not([hidden]) input[type=checkbox]");
  if (mainCheckbox.checked) {
    // ставим недостающие галочки
    for (var i = 0; i < cbs.length; i++) {
        cbs[i].checked = true
    }
  } else {
    // убираем все галочки
    for (var i = 0; i < cbs.length; i++) {
        cbs[i].checked = false
    }
  }
}

function changeGroupEditTableColumns() {
  if (document.getElementById("group-edit-table")) {
    let checkboxes = document.querySelectorAll("#group-search-columns-modal input[type='checkbox']");
    for (let cb of checkboxes) {
      let attr = cb.name.split("!")[1];
      let isChecked = cb.checked;
      let tableCells = document.querySelectorAll(`#group-edit-table [data-td-name="${attr}"]`);
      for (let cell of tableCells) {
          cell.hidden = !isChecked
      }
    }
  }
}

function searchTableGroupEdit(event) {
  let attr = event.currentTarget.name.split("!")[1];
  let tableCells = document.querySelectorAll(`#group-edit-table tbody [data-td-name="${attr}"]`);
  let toSearch = event.currentTarget.value.toLowerCase();
  for (let cell of tableCells) {
    if (cell.innerText.toLowerCase().match(toSearch)) {
      cell.parentElement.hidden = false
    } else {
      cell.parentElement.hidden = true
    }
  }
  changeMainCheckboxGroupEdit();
}

function enableDescriptionGroupEdit() {
  if (document.getElementById("group-edit-radio1").checked || document.getElementById("group-edit-radio2").checked) {
    document.getElementById("group-edit-description").disabled = false;
  }
}

function setInvOrSerialGroupEdit() {
  if (document.getElementById("group-search-radio1").checked) {
    document.getElementById("group-search-INV-Serial").name = "INV No";
    document.getElementById("label-group-search-INV-Serial").innerHTML = "Введите инвентарный номер";
  } else if (document.getElementById("group-search-radio2").checked) {
    document.getElementById("group-search-INV-Serial").name = "Serial No";
    document.getElementById("label-group-search-INV-Serial").innerHTML = "Введите серийный номер";
  }
}

function setButtonEnabledGroupEdit() {
    let elements = document.querySelectorAll("#group-edit-form select, textarea");
    let disabled = true;
    for(let el of elements) {
      if (el.value != "") {
        document.getElementById("group-edit-submit-button").disabled = false;
        disabled = false
      }
    }
    if (disabled) {
      document.getElementById("group-edit-submit-button").disabled = true;
    }
}

function setButtonEnabledSingleEdit() {
    document.getElementById("single-edit-submit-button").disabled = false;
}

function verifySingleEdit(event) {
  if (event.target.tagName === 'FORM') {
    let frm = event.currentTarget
    let clsName = 'bg-danger-subtle'
    let msg = frm.querySelector('div.alert')
    let text = msg.querySelector('strong')
    let use = msg.querySelector('use')

    if (frm.Location.value && frm.State.value) {
      frm.Location.classList.remove(clsName)
      frm.State.classList.remove(clsName)
    } else {
      if (!frm.Location.value && !frm.State.value) {
        frm.Location.classList.add(clsName)
        frm.State.classList.add(clsName)
      } else if (!frm.Location.value) {
        frm.Location.classList.add(clsName)
        frm.State.classList.remove(clsName)
      } else if (!frm.State.value) {
        frm.State.classList.add(clsName)
        frm.Location.classList.remove(clsName)
      } 
      msg.classList.add('alert-warning')
      text.innerHTML = 'Некорректно заполнены поля.'
      use.setAttribute('href', '#exclamation-triangle-fill')

      msg.hidden = false
      event.preventDefault()
    }
  }
}

function showSuccessAlertSingleEdit(event) {
  let frm = event.currentTarget
  let msg = frm.querySelector('div.alert')
  let text = msg.querySelector('strong')
  let use = msg.querySelector('use')

  msg.classList.add('alert-success')
  text.innerHTML = 'Данные об оборудовании обновлены.'
  use.setAttribute('href', '#check-circle-fill')
  msg.hidden = false
}

document.addEventListener('show.bs.modal', function(event) {
  if (event.target.id === 'group-edit-inputs-modal') {
    let cbsChecked = document.querySelectorAll('#group-edit-table input[type=checkbox]:checked');
    let btn = document.getElementById('group-edit-submit-button');
    if (cbsChecked.length === 0) {
      btn.dataset.bsTarget = '#group-edit-zero-items'
    } else {
      btn.dataset.bsTarget = '#group-edit-confirm'
    }
  } else if (event.target.id === 'group-edit-confirm') {
    let cbs = document.querySelectorAll('#group-edit-table input[type=checkbox]');
    let items = document.querySelectorAll('#group-edit-confirm li');
    for (let item of items) {
      let key = item.dataset.itemKey
      for (let cb of cbs) {
        if (cb.name.includes(key)) {
          item.hidden = !cb.checked
        }
      }
    }
  }
})