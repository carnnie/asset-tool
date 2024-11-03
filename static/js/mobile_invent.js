var items;
var item;
var stores=[];
var store
var users;
var to_user_check = false
var item_id = '';
var locations=[];
var search_attrs;
var card_attrs;
var search_temp = '';
var time = 0;
var actions = {'Сдать': '/mobile/takeback', 'Выдать': '/mobile/giveaway', "Переслать": '/mobile/send', 'Выдать_IT': '/mobile/giveaway_it'}
var msg = false;
const search = document.getElementById('floatingInput')

search.addEventListener("keyup", searchItems);

// searchbar
async function searchItems() {
    let resp_time = time
    let action = document.getElementById("floatingSelect").value;
    let url = actions[action];
    let searchIt = search.value;
    if (url=='/mobile/send') {
        var tmp = {};
        for (let id in items) {
            let item = items[id]   // ?
            if (item["INV No"].includes(searchIt.toUpperCase()) | item["Serial No"].toUpperCase().includes(searchIt.toUpperCase())) {
                tmp[id] = item
            }
        }
        return renderSearchReslts(tmp, msg, time, action);
    } else if (searchIt.length < 4) {
        time += 1
        resp_time = time
        msg = ''    
        items = {}
    } else if (searchIt.length > 3 & search_temp != searchIt) {
        time = time + 1
        spinner =  document.getElementById("spinner");
        spinner.classList.remove("hidden");
        let response = await fetch(`${url}?search=${searchIt}&time=${time}`);
        if (response.ok) {
            data = await response.json();
            if (data['time'] == time){   
                items = data["items"];
                msg = data["msg"];
                search_attrs = data["search_attrs"];
                card_attrs = data["card_attrs"];
                resp_time = data["time"];
            }
            }
        }
        document.getElementById("spinner").classList.add("hidden");
        renderSearchReslts(items, msg, resp_time, action);

}

async function getUsers() {
    let user = document.getElementById("find-user-field").value;
    if (user.length > 2) {
        let response = await fetch(`/mobile/giveaway_it/users?user=${user}&time=${time}`);
        if (response.ok) {
            data = await response.json();
            if (data['time'] == time){   
                users = data["users"];
                dataset = ''
                for (i=0;i<users.length;i++) {
                    dataset += `<option value="${[users[i]['Store Insight']]} | ${users[i]['ФИО']} | ${users[i]['Email']}">`
                    }
                document.getElementById("users-list").innerHTML = dataset;
                }
            }
    }
}

async function checkUser() {
    let user = document.getElementById("find-user-field").value.split(' | ')[2];
    let response = await fetch(`/mobile/giveaway_it/users?user=${user}&time=${time}`);
        if (response.ok) {
            data = await response.json();
            if (data["users"].length == 1) {
                to_user_check = true;
            } else {
                to_user_check = false;
            }
        }
    checkButton();
}

function filterLoc(store) {
    let locs = []
    for (i=0;i < locations.length;i++) {
        for (s=0;s < locations[i]["Store"].length; s++) {
            if (locations[i]["Store"][s] == store) {
                locs.push(locations[i]['Name'])
            }
        }
    }
    return locs
}

function makeDataset(items) {
    for (i=0;i<items.length;i++) {
        dataset += `<option value="${items[i]}">`
        }
    return dataset
}

// Make them one
function getStores() {
    field = document.getElementById("find-store-field");
    if (field.value) {
        for (i=0; i<stores.length; i++) {
            if (stores[i]["Name"] == field.value) {
                store = stores[i]["Name"]
                field.classList.remove('is-invalid');
                document.getElementById("find-location-field").disabled = false;
                let locs = filterLoc(store)
                document.querySelector('#loc-list').innerHTML = makeDataset(locs)
                checkButton()
                return undefined
                }
            }
        document.getElementById("find-location-field").disabled = true;
        field.classList.add('is-invalid');
        checkButton()
    }
}


function getLocations() {
    field = document.getElementById("find-location-field");
    if (field.value) {
        for (i=0; i<stores.length; i++) {
            if (locations[i]["Name"] == field.value || field.value == "Operator Room") {
                field.classList.remove('is-invalid');
                checkButton()
                return undefined
                }
            }
        field.classList.add('is-invalid');
        checkButton()
    }
}

async function checkButton() {
    var button = document.querySelector("#upload_button");
    let action = document.getElementById("floatingSelect").value;
    if (action==="Выдать_IT"){
        let ureq_num = document.getElementById("itreq-form").value;
        if (document.getElementById("find-location-field").classList.contains('is-invalid') || document.getElementById("find-store-field").classList.contains('is-invalid') || 
            document.querySelector("#formFileSm").classList.contains('is-invalid') || !document.getElementById("find-location-field").value || !document.getElementById("find-store-field").value ||
            !to_user_check || !ureq_num || document.querySelector("#itreq-form").value.length != 6 || !document.querySelector("#formFileSm").files.length) {
            button.disabled = true;
        } else {
            button.disabled = false;
        }
    } else {
        if (document.querySelector("#formFileSm").classList.contains('is-invalid')) {
            button.disabled = true;
        } else {
            button.disabled = false;
        }
    }

    

}


async function renderSearchBar() {
    time = time + 1
    let resp_time = time
    items = {}
    let action = document.getElementById("floatingSelect").value;
    let text = '';
    if (action === 'Сдать') {
        text = 'Введите инвентарный, серийный номер или фамилию пользователя(на английском)';
    } else if (action === 'Выдать') { 
        text = 'Введите номер реквеста вида ITREQ-000000';
    }  else if (action === 'Выдать_IT') {
        document.getElementById("spinner").classList.remove("hidden");
        text = 'Введите инвентарный, серийный номер';
        let response = await fetch(`/mobile/giveaway_it/data?time=${time}`);
        if (response.ok) {
            data = await response.json();              
            locations = data["locations"];
            stores = data["stores"];
            document.getElementById("spinner").classList.add("hidden");
            }
    } else if (action === 'Переслать') {
        document.getElementById("spinner").classList.remove("hidden");
        text = 'Введите инвентарный, серийный номер';
        let response = await fetch(`${actions[action]}?time=${time}`);
        if (response.ok) {
            data = await response.json();
            if (data['time'] == time){                
                items = data["items"];
                stores = items['stores'];
                delete items['stores'];
                msg = data["msg"];
                search_attrs = data["search_attrs"];
                card_attrs = data["card_attrs"];}
            }
            document.getElementById("spinner").classList.add("hidden");
        }
    renderSearchReslts(items, msg, resp_time, action)
    document.getElementById("result-card").innerHTML = '';
    document.getElementById('floatingInput').disabled = false;
    document.getElementById('floatingInput').value = '';
    document.getElementById('search-label').innerText = text;

}
    

function renderSearchReslts(items, msg, resp_time, action) {
    let searchIt = search.value;
    var searchResultList = '';
    if (msg && Object.keys(msg).length) {
        document.getElementById("spinner").classList.add("hidden");
        document.getElementById("result-card").innerHTML = `
                        <div id="empty"><p>По запросу ${search_temp} не найденно оборудования.<br>
                        Пожалуйста проверьте правильность введенных данных и если всё верно, обратитесь к 
                        <a href=# onclick="send_mail_to_mcc('${action}', '${searchIt}')" id="send_it_mcc" >MCC RU SLS Coordinators</a></p></div>
        `   
    } else if (resp_time == time | action == "Переслать") {
        document.getElementById("spinner").classList.add("hidden");
        document.getElementById("result-card").innerHTML = ''
        for (let id in items) {
            let item = items[id];
            let row  = '';
            for (let i=0; i < search_attrs.length; i++) {
                if (i==0){
                    row += `<tr>
                                <th colspan="2" class="search-th th-header"">${item[search_attrs[i]]}</th>
                            </tr>`
                } else {
                    row += `<tr>
                                <td class="name-in-card">${search_attrs[i]}:</td>
                                <td>${item[search_attrs[i]]}</td>
                            </tr>`
                }

            }
            searchResultList += `
            <tr>
                <td class="result-hover" onclick="itemCard('${id}')">
                    <table class="search-result">
                        ${row}
                    </table>
                </td>
            </tr>`
    }
    document.getElementById("search-results").innerHTML = '<table class="table ">' + searchResultList + '</table>';
    msg = '';
    }
}


function selectField(field, value) {
    fields = {'User': {"id": 'find-user-field', 'list': "users-list", 'placeholder': 'Введите имя', 'func': 'getUsers()', 'df': []},
              "Store": {"id": 'find-store-field','list': "store-list", 'placeholder': v, 'func': 'getStores()', 'df': stores},
              "Location": {"id": 'find-location-field','list': "loc-list", 'placeholder': v, 'func': 'getLocations()', "df": locations}
             }
    f = fields[field]
    dataset = ''
    let show_loc = ''
    for (i=0;i<f['df'].length;i++) {
        dataset += `<option value="${f['df'][i]['Name']}">`
        }
    return  `<div class="input-group has-validation">
                <input type="input" class="form-control form-control-sm" id="${f['id']}" placeholder="${f['placeholder']}" list=${f["list"]} onkeyup='${f['func']}' ${field=="User" ? 'onchange="checkUser()"' : ''} ${field=="Location" ? 'disabled': ''}>
                                    <datalist id="${f['list']}"> ${dataset}
                                    </datalist>
                <div class="invalid-feedback">
                    Введены не корректные данные!
                </div>   
            </div>`;
}

// card
function renderCard(item) {
    action = document.getElementById("floatingSelect").value;
    let resultCard = `<tr><th colspan="2">${item["Name"]}</th></tr>`;
    for (let i=0; i < card_attrs.length; i++) {
        if (item[card_attrs[i]] || card_attrs[i] == "User") {
            if (action === 'Выдать_IT' && ['User', 'Store', "Location"].includes(card_attrs[i]) ){
                v = item[card_attrs[i]] ? item[card_attrs[i]] : ''
                select = selectField(card_attrs[i], v)
                resultCard += `<tr>
                                    <td class='card-left'>${card_attrs[i]}</td>
                                    <td class='card-right'>${select}</td>
                                </tr>`
            } else  {
                resultCard += `<tr>
                                    <td class='card-left'>${card_attrs[i]}</td>
                                    <td class='card-right'>${item[card_attrs[i]]}</td>
                                </tr>`
                }
            }
    }
    let close = '<button type="button" class="btn-close position-absolute top-0 end-0" aria-label="Close" onclick="closeCard()"></button>'
    let dload_params = ''
    if (action === "Сдать" || action === "Выдать_IT" ) {
        dload_params = `serial=${item["Serial No"]}&inv=${item["INV No"]}&model=${item["Model"]}&type=${item["Type"]}`
    } else if (action === "Выдать") {
        dload_params = `hardware=${item['inv.']}`
    }
    let form = '';
    if (action === 'Сдать' || action === 'Выдать'){
                form = `<tr>
                        <td>
                            <a
                            href="blanks/?action=${action}&${dload_params}">
                            Скачать бланк 
                            </a>
                        </td>
                        <td>
                                <input class="form-control form-control-sm disable-it"
                                    id="formFileSm" type="file" name='blank'
                                    required form="user-form" onchange="checkFile()">
                            <p id="err_msg"></p>
                            
                        </td>
                        <td>
                            <input type="submit" value="${action}" form="user-form" id="upload_button" onclick="uploadBlank()" disabled>
                        </td>
                    </tr>
                    `
    } else if (action === 'Выдать_IT'){   
        resultCard += `<tr>
                            <td class='card-left'>ITREQ-</td>
                            <td class='card-right'>
                                <input type="number" class="form-control form-control-sm" id="itreq-form" onchange="checkButton()" min="100000" max="999999">
                            </td>
                        </tr>`             
                form = `<tr>
                            <td>
                                <a
                                href="blanks/?action=${action}&${dload_params}">
                                Скачать бланк 
                                </a>
                            </td>
                            <td>
                                    <input class="form-control form-control-sm disable-it"
                                        id="formFileSm" type="file" name='blank'
                                        required form="user-form" onchange="checkFile()">
                                <p id="err_msg"></p>
                                
                            </td>
                            <td>
                                <input type="submit" value="${action}" form="user-form" id="upload_button" onclick="uploadBlank()" disabled>
                            </td>
                        </tr>
                        `
    } else if (action === 'Переслать') {
            form = `<tr>
                        <td>
                            <input class="form-control form-control-sm" id="store" type="text" placeholder="Номер ТЦ" list="stores_list" onkeyup="checkStore()">
                            <datalist id="stores_list">
                        `
                        for (let i =0; i < stores.length; i++) {
                            form += `<option value="${stores[i]['Name']}"></option>`
                        }
                        
                        form += `
                        </datalist> 
                        </td>
                        <td>
                            <input class="form-control form-control-sm" type="text" placeholder="Трек номер если есть" id="track">
                            <p id="err_msg"></p>
                            
                        </td>
                        <td>
                            <input type="submit" value="${action}" form="user-form" id="upload_button" onclick="sendItem()" disabled>
                        </td>
                    </tr>
                    `
        }
        
    document.getElementById("result-card").innerHTML = '<table id="item-card" class="table table-borderless">' + resultCard + form  + '</table>' + close;
}

function itemCard(id) {
    item = items[id]
    item_id = id
    renderCard(item)
}

function closeCard() {
    item_id = ''
    document.getElementById("result-card").innerHTML = '';
}


function checkFile() {
    var file = document.querySelector("#formFileSm");
    var button = document.querySelector("#upload_button");
    var msg = document.querySelector("#err_msg");
    regex = new RegExp("(.*?)\.(pdf|jpeg|jpg|png)$");
    if (regex.test(file.files[0].name) === false ) {
          file.classList.add("is-invalid");
          msg.innerText = "Не корректный формат файла, допустимы pdf, jpg, png!";
    } else if ((file.files[0].size / 1024) > 780 ) {
          file.classList.add("is-invalid");
          msg.innerHTML = "К сожалению приложенный файл слишком большой<br>Максимальный размер вложения 500кб";
    }  else {
        file.classList.remove("is-invalid");
        msg.innerText = "";
        }
    checkButton()
}

async function send_mail_to_mcc(act, search) {
    document.getElementById("send_it_mcc").disable = true;
    spinner =  document.getElementById("spinner");
    spinner.classList.remove("hidden");
    let response = await fetch(`mcc-mail?action=${act}&search=${search}`);
    if (response.ok) {
        resp = await response.json();
        }
    spinner.classList.add("hidden");
    document.getElementById("result-card").innerHTML = `<h3> Письмо отправленно <h3>`
}



async function uploadBlank() {
    document.getElementById("spinner").classList.remove("hidden");
    file = document.querySelector("#formFileSm");
    document.querySelector("#upload_button").disabled = true;
    let action = document.getElementById("floatingSelect").value;
    let data = new FormData()
    data.append('blank', file.files[0])
    data.append('action', action)
    if (action == 'Выдать_IT') {
        let to_user = document.getElementById("find-user-field").value;
        let to_store = store;
        let to_location = document.getElementById("find-location-field").value;
        let itreq_num = document.getElementById("itreq-form").value;
        data.append('to_user', to_user)
        data.append('store', to_store)
        data.append('location', to_location)
        data.append('itreq', itreq_num)
    }
    
    data.append('item', JSON.stringify(item))
    data.append('csrfmiddlewaretoken', CSRF_TOKEN)
    await fetch(`/mobile/upload/blank`, {
                method: 'POST',
                body: data
                }).then(response => response.json())
                  .then((resp) => {
                    delete items[item_id]
                    document.getElementById("result-card").innerHTML = `<h3> ${resp['msg']} <h3>`
                    renderSearchReslts(items, false, time, action);
                    item_id = 0;
                  })
                  .catch(() => {
                    document.getElementById("result-card").innerHTML = `<h3>Что то пошло не так, попробуйте ${action} оборудование позже.<h3>`
                  })
                  .finally(() => {
                    document.getElementById("spinner").classList.add("hidden");
                  })
}


function checkStore() {
    var store = document.querySelector("#store").value;
    var button = document.querySelector("#upload_button");

    for (let i =0; i < stores.length; i++) {
        if (store == stores[i]['Name']) {
            button.disabled = false;
            return ''
        }
        button.disabled = true;
    }

    
}

async function sendItem() {
    let to_store = ''
    spinner =  document.getElementById("spinner");
    spinner.classList.remove("hidden");
    let store = document.getElementById("store").value;
    let track = document.getElementById("track").value;
    var button = document.querySelector("#upload_button");
    button.disabled = true;
    for (let i =0; i < stores.length; i++) {
        if (store == stores[i]['Name']) {
            to_store = stores[i]
            break
        }
    }
    var data = new FormData()
    data.append('item', JSON.stringify(item));
    data.append('store', JSON.stringify(to_store));
    data.append('track', track);
    data.append('csrfmiddlewaretoken', CSRF_TOKEN)
    let response = await fetch(`/mobile/send`, {
                                method: 'POST',
                                body: data
                                });

    if (response.ok) {
        data = await response.json();
        }
    spinner.classList.add("hidden");
    delete items[item_id]
    renderSearchReslts(items);
    document.getElementById("result-card").innerHTML = `<div id="empty">${data['msg']}</div>`;
    item_id = 0; 

}