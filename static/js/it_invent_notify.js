header = new Set(["User", "Location", "Model"])

var items = [];
var store ='';
var mobile = [];


function setStore() {
    store = document.querySelector("#invents").value;
}

function loadText(el) {
    textField = document.querySelector("#msg-text");
    textField.value = mailText[el.value]
    if (el.value == "mobile") {
        getMobile()
    }
}


async function getMobile() {
    mobile = fetch(`/invent/api_inv/notify/?store=${store}`)
                        .then(response => response.json())
                        .then((r) => {return r})
}




// text data

const mailText = {
    'open': `
    Уважаемые коллеги,
    C __ по __ месяц в вашем ТЦ будет проводится инвентаризация ИТ оборудования.
    Просьба быть готовым предоставить ИТ оборудование отдела для проверки.
    Заранее благодарим.`,
    'start': `
    Уважаемые коллеги,
    Инвентаризация ИТ оборудования в вашем ТЦ началась. 
    Просьба быть готовым предоставить ИТ оборудование отдела для проверки.`,
    'mobile': `
    Уважаемые коллеги,
    В четверг, 22.09.2020, в вашем ТЦ будет проводиться инвентаризация мобильного ИТ оборудования.
    По системе учета ИТ оборудования за сотрудниками ТЦ числится следующее оборудование:



    Просьба прислать в ответ на это письмо фотографии вашего мобильного оборудования с изображением серийного либо инвентарного номера устройства.
    Заранее спасибо.
`,
    'now': `4`,
    'close': `5`,
}