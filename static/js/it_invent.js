const ignored_attrs = ["link", "id", "Key", "SAP number", "ITRequest", "Initial price", "Maintenance Agreement", 
                        "Supplier Agreement", "Invoice date", "Store", "Invoice No", "Department", "Supplier",
                        "Commissioning date", "Branch", "Created", "Updated", "Name", "Service_Status", "Inventory No", 
                        "run-on", "Planned Replace Date", 'HWUserUpdate']

var filtrs = new Map();
var items = [];
var attrs = new Set();
var selected_attrs = new Set();
var tmp_items = [];
var printers = {};
var invent = '';
var store = ''





function resetVars() {
    attrs.clear();
    selected_attrs.clear();
    filtrs.clear();
    items = [];
}


window.addEventListener('load', setInvent)

getDataButton.addEventListener('click', get_invet_data)
getAttrsButton.addEventListener('click', showAttrs)
printButton.addEventListener('click', renderPrint)
toExcelButton.addEventListener('click', excelIt)
printBox.addEventListener('change', printCol)
invents.addEventListener('change', setInvent)


console.log(document.cookie)

function setInvent() {
    let sel = document.getElementById("invents");
    store = sel.options[sel.selectedIndex].text;
    invent = sel.value;
}

async function loadItems(){
    let response = await fetch(`/invent/api_inv?store=${store}&inventory=${invent}`);
    let data = await response.json();
    items = data["items"];
}

async function get_invet_data() {
    s = new Date
    spinner =  document.getElementById("spinner_ppl");
    spinner.classList.remove("hidden");
    await Promise.all([get_printers(), loadItems()]);
    console.log(123)
    spinner.classList.add("hidden");
    e = new Date
    tmp_items = [...items];
    if (items) {
        getAttrs()
        document.querySelector('#getAttrsButton').disabled = false;
        document.querySelector('#reports').disabled = false;
        document.querySelector('#toExcelButton').disabled = false;
        document.querySelector('#printBox').disabled = false;
        setSelectedAttrs();
        renderHeader();
        renderTable(tmp_items);
    }
    document.querySelector('#report-name').innerText = 'Всё оборудование ТЦ';
    document.querySelector('#total_all').innerText = `Всего найдено: ${items.length} , время поиска составило ${(e - s)/1000} сек`;
}


function printCol() {
    button = document.querySelector('#printButton');
    label = document.querySelector('#printBoxLabel');
    if (this.checked) {
        label.innerText = "On";
        button.disabled = false;
        selected_attrs.add("Print");
        
    } else {
        label.innerText = "Off"
        button.disabled = true;
        selected_attrs.delete("Print")     
    }
    renderHeader();
    renderTable(tmp_items);
}

function getAttrs() {
    attrs.clear();
    for (let i=0; i<items.length; i++) {
        for (d in items[i]) {
            if (!ignored_attrs.includes(d)) {
                attrs.add(d)
            }
        }
    }
    if (isAdmin) {
        attrs.add('Delete_card')
    }
    attrs = new Set(Array.from(attrs).sort())
    renderFilter()
}

function renderFilter() {
    let attrs_tosee = '<button type="button" class="btn-close position-absolute top-0 end-0" aria-label="Close" onclick="showAttrs()"></button>'
    let button = document.createElement('button')
    for (let attr of attrs) {
        attrs_tosee +=  `<div id="single_attr">
                            <input type="checkbox" class="single_attr" onchange='selectFilter(this,"${attr}")' ${selected_attrs.has(attr) ? "checked" : ''}/>
                            <label class="${(attr=='Print'|| attr=='Delete_card' ? 'text-warning' : 'text-dark')}">${attr}</label>
                        </div>` 
            }
    document.getElementById("tosee").innerHTML = attrs_tosee;
}


function filterTable() {
    filterAttrs(filtrs);
    renderHeader();
    renderTable();
}

function showReports() {
    attr_btns = document.getElementById("tosee");
    renderReports()
    if (attr_btns.hidden) {
        attr_btns.hidden=false;
    } else {
        attr_btns.hidden=true;
    }
}

function showAttrs() {
    attr_btns = document.getElementById("tosee");
    renderFilter();
    if (attr_btns.hidden) {
        attr_btns.hidden=false;
    } else {
        attr_btns.hidden=true;
    }
    if (selected_attrs.size) {
        renderHeader()
    }
}

function selectFilter(check, attr) {
    if (check.checked &&  !(attr in ignored_attrs)) {
        selected_attrs.add(attr)
    } else {
        selected_attrs.delete(attr)
    }
    renderHeader();
    renderTable(tmp_items);
}



function renderHeader() {
    table = ''
    for (let attr of selected_attrs) {
        if (attr=='Print') {
            table +=    `<th class='print-column'>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="massAddToPrint()">+</button>
                        </th>`
        } else if (attr=='Delete_card') {
            table +=    `<th>
                            <p>Del</p>
                        </th>`
        }else{
            table +=    `
                        <th>
                            <div  class="input-group input-group-sm mb-3">
                                <input type="text" class="form-control" placeholder="${attr}" value="${filtrs.get(attr)?filtrs.get(attr):''}" aria-label="Example text with button addon" aria-describedby="button-addon1" onkeyup="setFilter(this)">
                                <button class="btn btn-outline-secondary" type="button" id="sort-button-${attr}" onclick="sortTableBy('${attr}')">▼</button>
                            </div>
                        </th>`
        }
    }
    document.getElementById('content_header').innerHTML = table;
}



function createRow(item) {
    let row = `<tr class="${item['Invented'] == 'Yes'? 'table-success': 'table-danger'}" id="${item["id"]}">
                    ${innerRow(item)}
                </tr>`
    return row

}

function innerRow(item) {
    let row = ''

    for (let attr of selected_attrs) {
        if (attr=='Print') {
            if (!printList.has(item)) {
                row += `<td id='${item["INV No"]}' class='print-column'><button type="button" class="btn btn-primary btn-sm" onclick="addToPrint(${item["INV No"]})" >+</button></td>`
            } else {
                row += `<td id='${item["INV No"]}' class='print-column'><button type="button" class="btn btn-danger btn-sm" onclick="removeFromPrint(${item["INV No"]})">-</button></td>`
            }
        } else if (attr =='Delete_card') {
            if (item["Invented"] == "No") {
                row += `<td class='print-column'>...</td>`
            } else {
                row += `<td class='print-column' id="${item["id"]}btn"><button type="button" class="btn btn-danger btn-sm" onclick="aproveDelete(${item["id"]})" >D</button></td>`
            }
        }else {
            row += `<td>${item[attr]? item[attr]: ''}</td>`
        }
    }
    return row
}

function createTable(data) {
    let table = ''
    for (let i=0; i<data.length;i++){
        table += createRow(data[i])
    }
    return table
}

function renderTable(data) {
    document.getElementById('content_table').innerHTML = createTable(data);
    document.querySelector('#total_sown').innerText = `Результатов отображено ${data.length}`;
    
}

function updateTable() {
    let ids = [...document.querySelectorAll('#content_table tr')].map((tr) => tr.id)
    for (i=0;i< ids.length;i++) {
        console.log(ids[i])
    }
}

function setFilter(f) {
    data_string = f.value
    if (data_string.includes("&")) {
        data = data_string.split('&')
        filtrs.set(f.placeholder, data)
    } else {
        filtrs.set(f.placeholder, data_string)
    }
    filterAttrs(filtrs)

}

function customInclude(attr, filter) {
    if (!attr ||
        (filter[0] == '!' && attr.toLowerCase().includes(filter.slice(1).toLowerCase())) || 
        (filter[0] != '!' && !attr.toLowerCase().includes(filter.toLowerCase()))) {
        return false
        }
    return true;
}

// Уродивая абберация переделай ее
function filterAttrs(attr) {
    tmp_items = []
    for (let i=0; i<items.length;i++){
        let show = new Set();
        for (const [key, value] of attr) {
            if (typeof value === "object") {
                results = new Set([...value].map((val) => customInclude(items[i][key], val)))
                if (!results.has(true)) {
                    show.add(false)
                }
            } else if (value == "?" && items[i][key]) {
                show.add(true);
                break
            } else if ((value && (selected_attrs.has(key))) || (value && key == 'Invented')) {
                show.add(customInclude(items[i][key], value))
            }
        }
        if (!show.size || (show.size == 1 && show.has(true))) {
            tmp_items.push(items[i])
        }
    }
    renderTable(tmp_items);
}


function sortTableBy(prop) {
    let idx = Array.from(selected_attrs).indexOf(prop)
    let table = document.getElementById("content_table");
    let trs = table.rows;
    if (document.getElementById(`sort-button-${prop}`).innerText == '▼') {
        Array.from(trs)
                .sort((a, b) => a.cells[idx].textContent > b.cells[idx].textContent ? 1 : -1)
                .forEach(tr => table.appendChild(tr));
        document.getElementById(`sort-button-${prop}`).innerText = '▲';
        } else {
            Array.from(trs)
                .sort((a, b) => a.cells[idx].textContent > b.cells[idx].textContent ? -1 : 1)
                .forEach(tr => table.appendChild(tr));
                document.getElementById(`sort-button-${prop}`).innerText = '▼';
        }
}

// reports
const till_types = ["BARCODE HANDHELD SCANNER", "BARCODE RADIO BASE", "BARCODE RADIO SCANNER", 
                            "BARCODE TABLE SCANNER", "CR CASH DRAW", "CR CUSTOMER MONITOR", 
                            "CR FISCAL REGISTER", "CR MONITOR", "CR SYSTEM BASE"]

const till_location_ex = ["EDP Service", "EDP Storage", "EDP Storage (Virtual)"]

const free_stat = ['Free', "Stock OK"]
const free_loc = ['WANTED!!!']
const free_type = ["CR PRINTER", 'JETDIRECT', "MODEM EXTERNAL", "VPN MODULE", "PHONE GARNITURE", "USB Wi-Fi Adapter", 'Tape']
const free_model = ["DS4308-HD7U2100AZW", "SYMBOL LS2208", "PSC HS1250", "PSC MAGELLAN 8200", "DVD-RW", "CHS9000 (without ethernet ports)", "CRD9000-411CR (w pwr supply & DC cbl)", "SIEMENS OptiPoint 500 ADVANCE", "SIEMENS OPTIPOINT 500", "3COM SWITCH", "HP EliteDesk 800 G1 SFF", "HP t510 Smart Zero ES WF Flex TC", "Zebra ZXP3", "HP t5335z"]


function setSelectedAttrs() {
    selected_attrs = new Set(['INV No', 'Serial No', 'Type', 'Model', 'Location', 'State']);
    if (document.querySelector('#printBoxLabel').innerText == 'On') {
        selected_attrs.add('Print')
    }
}


function tillData() {
    tmp_items = []
    let tills_report = new Map()
    for (let i=0; i<items.length; i++) {
        if (till_types.includes(items[i]["Type"]) && !till_location_ex.includes(items[i]["Location"])) {
            tmp_items.push(items[i])
            key = items[i]['Unit_Eq'] ? 'Unit_Eq' : 'Location'
            tills_report[items[i][key]] = tills_report[items[i][key]] ? tills_report[items[i][key]] : {}
            tills_report[items[i][key]][items[i]['Type']] = tills_report[items[i][key]][items[i]['Type']] ? tills_report[items[i][key]][items[i]['Type']] : []
            if (items[i]['Name']) {
                tills_report[items[i][key]][items[i]['Type']].push({'item': items[i]['Name'], 'invented': items[i]['Invented']})
            } else {
                tills_report[items[i][key]][items[i]['Type']].push({"item":'Нет имени', 'invented': items[i]['Invented']})  
            }
            
            tills_report[items[i][key]]['count'] = tills_report[items[i][key]]['count'] ? tills_report[items[i][key]]['count'] + 1 : 1;
        }
    }
    for (const [key, value] of Object.entries(tills_report)) {
        if (key.includes("Till")) {
            for (let i=0; i<till_types.length; i++) {
                if (!tills_report[key][till_types[i]] && till_types[i]!="BARCODE HANDHELD SCANNER"){
                    tills_report[key][till_types[i]] =  []
                }
            }
        }
    }
    return tills_report;
}

function reportTills() {
    data = new Map([...Object.entries(tillData())].sort());
    table = '';
    for (const [key, value] of data) {
        table += `<tr class="" onclick="showInner('${key.replace(/ /g,"")}')">
                    <td><b>${key}</b></td><td>${value["count"]}</td>
                  </tr>`
        for (const [k, v] of Object.entries(value)) {
            if (k != 'count') {
                  table += `<tr class='${key.replace(/ /g,"")}' onclick="showInner('${(key+k).replace(/ /g,"")}')" id='${(key+k).replace(/ /g,"")}' hidden>
                                <td>⮡&emsp;${k}</td><td>${v.length}</td>
                            </tr>`
                for (i=0;i<v.length;i++) {
                    table += `<tr class='${(key+k).replace(/ /g,"")}' hidden>
                                <td>&emsp;&emsp;⮡&emsp;${v[i]['item']}</td>
                                <td>${v[i]['invented']}</td>
                            </tr>`
                }
                }
            }
        }
    document.querySelector('#total_sown').innerText = `Результатов отображено ${tmp_items.length}`;
    document.querySelector('#report-name').innerText = `Отчет по кассам`;
    document.getElementById('content_header').innerHTML = '';
    document.getElementById('content_table').innerHTML = table;
}

function placeData() {
    tmp_items = []
    let place_report = new Map()
    for (let i=0; i<items.length; i++) {
        if (items[i]["Location"] && !items[i]["Location"].includes('EDP')) {
            tmp_items.push(items[i])
            key = 'Location'
            place_report[items[i][key]] = place_report[items[i][key]] ? place_report[items[i][key]] : {}
            place_report[items[i][key]][items[i]['Type']] = place_report[items[i][key]][items[i]['Type']] ? place_report[items[i][key]][items[i]['Type']] : []
            if (items[i]['Name']) {
                place_report[items[i][key]][items[i]['Type']].push({'item': items[i]['Name'], 'invented': items[i]['Invented']})
            } else {
                place_report[items[i][key]][items[i]['Type']].push({"item":'Нет имени', 'invented': items[i]['Invented']})  
            }
            place_report[items[i][key]]['ok'] = items[i]['Invented'] == "No" ? false : true;
            place_report[items[i][key]]['count'] = place_report[items[i][key]]['count'] ? place_report[items[i][key]]['count'] + 1 : 1;
        }
    }
    return place_report;
}


function reportPlace() {
    data = new Map([...Object.entries(placeData())].sort());
    table = '';
    for (const [key, value] of data) {
        color = value['ok'] ? 'table-info': "table-warning"
        table += `<tr class="border border-black ${color}" onclick="showInner('${key.replace(/ /g,"")}')">
                    <td><b>${key}</b></td><td>${value["count"]}</td>
                  </tr>`
        for (const [k, v] of Object.entries(value)) {
            if (k != 'count' && k != 'ok') {
                  table += `<tr class='${key.replace(/ /g,"")}' onclick="showInner('${(key+k).replace(/ /g,"")}')" id='${(key+k).replace(/ /g,"")}' hidden>
                                <td>⮡&emsp;${k}</td><td>${v.length}</td>
                            </tr>`
                for (i=0;i<v.length;i++) {
                    table += `<tr class='${(key+k).replace(/ /g,"")}' hidden>
                                <td>&emsp;&emsp;⮡&emsp;${v[i]['item']}</td>
                                <td>${v[i]['invented']}</td>
                            </tr>`
                }
                }
            }
        }
    document.querySelector('#total_sown').innerText = `Результатов отображено ${tmp_items.length}`;
    document.querySelector('#report-name').innerText = `Отчет по местам`;
    document.getElementById('content_header').innerHTML = '';
    document.getElementById('content_table').innerHTML = table;
}


function showInner(key) {
    els = document.getElementsByClassName(key)
    for (i=0; i<els.length; i++) {
        if (els[i].hidden) {
            els[i].hidden=false;
        } else {
            inner_els = document.getElementsByClassName(els[i].id)
            for (j=0; j<inner_els.length; j++) {
                inner_els[j].hidden=true;
            }
            els[i].hidden=true;
        }
    }
}

function excelIt() {
    toExcel(tmp_items)   
}

function baseReport(filter, report_name='') {
    filtrs.clear();
    filter.forEach((value, key) => filtrs.set(key, value))
    setSelectedAttrs();
    renderHeader();
    filterAttrs(filtrs);
    document.querySelector('#report-name').innerText = report_name;
}

function resetItems() {
    baseReport(new Map(), 'Всё оборудование ТЦ');
}

function findedReport() {
    baseReport(new Map([['Invented', 'Yes']]), 'Отчет по найденному оборудованию');
}

function notFindReport() {
    baseReport(new Map([['Invented', 'No']]), 'Отчет по не найденному оборудованию');
}

function freeReport() {
    baseReport(new Map([['State', free_stat],
                        ['Location', free_loc.map((item) => '!'+item)],
                        ['Model', free_model.map((item) => '!'+item)],
                        ['Type', free_type.map((item) => '!'+item)]]), 
                        'Отчет по Free оборудованию')
}

function utileizeReport() {
    baseReport(new Map([['State', 'To Discard']]), 'Отчет по оборудоавнию на списание')
}


async function toExcel(query)  {
    document.getElementById("spinner_ppl").classList.remove("hidden");
    var data = new FormData()
    data.append('data', JSON.stringify(query))
    data.append('csrfmiddlewaretoken', CSRF_TOKEN)
    await fetch('api_inv/report', {
                method: 'POST',
                body: data
                }).then(response => response.blob())
                  .then(blob => {downloadFile(blob)})
                  .finally(() => {document.getElementById("spinner_ppl").classList.add("hidden")})
}

function downloadFile(blob, name = "report.xls") {
    const href = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href,
      style: "display:none",
      download: name,
    });
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(href);
    a.remove();
  }

///print
var printList =  new Set()


function  addToPrint(item) {
    for (let i=0; i<tmp_items.length; i++) {
        if (tmp_items[i]["INV No"] == item) {
            printList.add(tmp_items[i]);
            break
        } 
    }
    document.getElementById('print-count').innerText = printList.size;
    document.getElementById(item).innerHTML = `<button type="button" class="btn btn-danger btn-sm add-remove" onclick="removeFromPrint(${item})">-</button>`
}

function removeFromPrint(item_inv, print_table=false) {
    for (item of printList) {
        if (item["INV No"] == item_inv) {
            printList.delete(item)
        }
    }
    document.getElementById('print-count').innerText = printList.size;
    if (print_table) {
    } else {
        document.getElementById(item_inv).innerHTML = `<button type="button" class="btn btn-primary btn-sm add-remove" onclick="addToPrint(${item_inv})">+</button>`
    }
    

}

function massAddToPrint()  {
    for (let i=0; i<tmp_items.length; i++) {
        printList.add(tmp_items[i]);
    }
    document.getElementById('print-count').innerText = printList.size;
}



function clearPrint()  {
    printList.clear();
    document.getElementById('print-count').innerText = printList.size;
    renderPrint()
}


async function get_printers(store) {
    e = new Date
    await fetch(`/api/printer/run/?mask=*_Invent_IT${store ? store : ''}*`)
                .then(response => response.json())
                .then(data => {printers = data})
    s = new Date
}

async function sendToPrint() {
    let printer = document.getElementById("printers-list")
    let items = Array.from(printList)
    let data = new FormData()
    data.append('data', JSON.stringify(items))
    data.append('PrinterName', printer.options[printer.selectedIndex].text)
    data.append('ip', printer.value)
    fetch('/api/printlabel/run/smart/', {
            method:"POST",
            body: data
        }).then(response => response.json())
          .then(() => {
            clearPrint();
            document.getElementById('print-count').innerText = printList.size;
            renderTable(Array.from(printList));
          })
}

function renderPrintHeader() {
    document.querySelector('#content_header').innerHTML = ` <th colspan="${selected_attrs.length}">
                                                                <div id="printers-here">Подождите идет загрузка принтеров...</div>
                                                            </th>`
    loadPrint();
    
}

async function loadPrint() {
    if (!printers) {
        await get_printers();
    }

    let options = '';
    for ([key, value] of Object.entries(printers)) {

        options += `<option value='${value['ip']}' ${key.includes(store) ? 'selected' : ''}>${key}</option>`
    }
    document.querySelector('#report-name').innerText = '';
    document.querySelector('#printers-here').innerHTML = `<select class="form-select" aria-label="" id="printers-list">
                                                                ${options}
                                                          </select>
                                                          <button type="button" class="btn btn-primary btn-sm" onclick="sendToPrint()" disable >Печать</button>
                                                          <button type="button" class="btn btn-danger btn-sm" onclick="clearPrint()">Очистить</button>`
}

function renderPrint() {
    renderTable(Array.from(printList))
    renderPrintHeader()
}

// ereq
function closeIt() {
    attr_btns = document.getElementById("tosee").hidden=true;
}

function aproveDelete(id) {

    let attrs_tosee = '<button type="button" class="btn-close position-absolute top-0 end-0" aria-label="Close" onclick="closeIt()"></button>'
        attrs_tosee +=  `<button type="button" class="btn btn-danger" onclick="delete_ereq(${id})">УДАЛИТЬ!!!</button>` 
    
    document.getElementById("tosee").innerHTML = attrs_tosee;
    document.getElementById("tosee").hidden=false;
}


async function delete_ereq(id) {
    row = document.getElementById(id)
    let data = new FormData()
    data.append('id', id)
    data.append('invent', invent)
    data.append('csrfmiddlewaretoken', CSRF_TOKEN)
    let response = await fetch(`api_inv/replace`, {
        method: 'POST',
        body: data
        });
    if (response.ok) {
        data = await response.json();
        ok = data["ok"];
        if (ok) {
            row.classList.remove('table-success')
            row.classList.add('table-danger')
            document.getElementById(`${id}btn`).innerHTML = '...'
            attr_btns = document.getElementById("tosee").hidden=true;
        }
        }
    for (i=0;i<items.length;i++) {
        if (items[i] == id) {
            items[i]['Invented'] = 'No'
            break

        }
    }
}


