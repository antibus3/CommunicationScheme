//  Класс участка сети
class sectionsOfNetwork {

    constructor(number, type, year){
        this.number = number;
        this.type = type;
        this.year = year;
        this.sections = [];
    }
    
    //  Добавление линий в список элементов комуницаций
    addSection(x, y, color) {
        this.sections.push(new Section(x, y, color));
    }
    
    drawSections(context) { 
        let beginPoint = this.sections[0];
        for (var i = 1; i < this.sections.length; i++) {
            context.beginPath();
            context.strokeStyle = this.sections[i].color;
            context.lineWidth = 10;
            context.moveTo(beginPoint.x, beginPoint.y);
            context.lineTo(this.sections[i].x, this.sections[i].y);
            context.stroke();
            beginPoint = this.sections[i];
        }
    }
    
}

//  Класс отображаемой линин
class Section {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
}
//  Класс для здания (прямоугольник)
class Room {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    GetPointsInRoom(e) {
        if ((e.x > this.x1) && (e.x > this.x2) || (e.x < this.x1) && (e.x < this.x2) || (e.y > this.y1) && (e.y > this.y2) || (e.y < this.y1) && (e.y < this.y2))
            return false;
        return true;
    }
}

//  Глобальные переменные

//  Массив коммуникаций
var communications = [];

//  тереторрия помещения
var areaOfRoom = [];

//  вводится ли коммуникация
var communicationAddition = false;

//  Вводится ли помещение
var roomAddition = false;

//  Временная переменная для хранения новой коммуникации
let addSectionsOfNetwork;

//  Временная переменная для хранения сегмента
let selectPoints = null;

//  Временная переменная для хранения територии здания
let beginRect = null;

//  Переменная холста
var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");

//  ссылка на изменяемый оьъект
let transformCommunication = null;


//  Подключение событий к холсту
canvas.onmousedown = function (e) {
    beginRect = new Section(e.pageX, e.pageY, null);

    //  Выбор участка
    var selectCom = redraw(e);
    if (selectCom != null)
        OpenTransform(selectCom);
}

canvas.onmouseup = function (e) {
    if (communicationAddition == true) {
        var location = document.getElementById("location");
        var color;
        if (location.value == "underground") color = "green"; else color = "blue";
        if (GetPointsInRoom(e)) color = "red";
        addSegment(e, color);
    }

    //  Добавление прямоугольника здания
    if ((roomAddition == true) && (beginRect != null))
        addRoom(e);

    redraw(e);
}

canvas.onmousemove = function (e) {

    selectPoints = new Section(e.pageX, e.pageY);
    redraw(e);
}

//  Переменные и метод для добавления новой коммуникации
function addCommunication() {
    communicationAddition = true;
    roomAddition = false;
    var newNumber = document.getElementById("number");
    if (newNumber.value == "") { alert("Введите номер"); return; }
    var newType = document.getElementById("type");
    if (newType.value == "") { alert("Введите тип покрытия"); return; }
    var newYear = document.getElementById("year");
    if (newYear.value == "") { alert("Введите год"); return; }
    newNumber.disabled = true;
    newType.disabled = true;
    newYear.disabled = true;
    addSectionsOfNetwork = new sectionsOfNetwork(newNumber.value, newType.value, newYear.value);

    //  Показать кнопку завершения ввода
    var endButton = document.getElementById("endEnter");
    endButton.style.display = "block";

}

//  Метод добавления секции
function addSegment(e, color) {
    addSectionsOfNetwork.addSection(e.pageX, e.pageY, color);
}

//  Метод ищет, входит ли точка в область здания
function GetPointsInRoom(e) {
    for (var i = 0; i < areaOfRoom.length; i++) {
        if (areaOfRoom[i].GetPointsInRoom(e) == true) return true;      
    }
    return false;
}

//  Метод добавления здания
function addRoom(e) {
    areaOfRoom.push(new Room(beginRect.x, beginRect.y, e.pageX, e.pageY));
    beginRect = null;
}

//  Метод закрытия и сохранения коммуникации
function endCommunication() {
    communicationAddition = false;
    //  проверка на вводимые точки. Если их меньше 2, то секций нет
    //  Скрыть кнопку завершения ввода
    var endButton = document.getElementById("endEnter");
    endButton.style.display = "none";

    //Активировать поля для ввода
    var newNumber = document.getElementById("number");
    var newType = document.getElementById("type");
    var newYear = document.getElementById("year");
    newNumber.disabled = false;
    newType.disabled = false;
    newYear.disabled = false;

    if (addSectionsOfNetwork.sections.length <= 1)
    {
        alert('Нужно выбрать хотябы 2 точки');
        addSectionsOfNetwork = null;
        return;
    }
    communications.push(addSectionsOfNetwork);
    addSectionsOfNetwork = null;
    redraw(null);
}


//  Метод перерисовки холста
function redraw(selectPoint) {
    let result = null; //  Ссылка на объект, выделеный курсором
    //  Очистить холст
        context.clearRect(0, 0, canvas.width, canvas.height);
    //  Нарисовать постоянные элементы
    //  Нарисовать область здания
    for (var i = 0; i < areaOfRoom.length; i++) {
        context.beginPath();    
        context.fillStyle = "darkgray";
        context.fillRect(areaOfRoom[i].x1, areaOfRoom[i].y1, areaOfRoom[i].x2 - areaOfRoom[i].x1, areaOfRoom[i].y2 - areaOfRoom[i].y1);
        context.closePath();
        context.stroke();
    }
    //  И нарисовать временную область здания
    if (roomAddition && beginRect != null) {
        context.beginPath();
        context.fillStyle = "darkgray";
        context.rect(beginRect.x, beginRect.y, selectPoint.pageX - beginRect.x, selectPoint.pageY - beginRect.y);
        context.closePath();
        context.stroke();
    }

    //  Нарисовать коммуникации
    var isFound = false; // Для поиска(найден ли)
    for (var i = 0; i < communications.length; i++) {
        communications[i].drawSections(context);

        //  Поиск коммуникации, выделеной курсором
        if (selectPoint != null) {
            if (IsSection(selectPoint)) {
                if (!isFound) {
                    SelectInfo(communications[i]);
                    result = communications[i];
                    isFound = true;
                }
            }
            else
                SelectInfo(null);
        }
        }


    //  Если есть что рисовать у временного элемента, его тоже прорисовать
    if (addSectionsOfNetwork != null && addSectionsOfNetwork.sections.length > 1) {
        addSectionsOfNetwork.drawSections(context);
        var beginElement = addSectionsOfNetwork.sections[addSectionsOfNetwork.sections.length-1];
        context.beginPath();
        context.strokeStyle = "#000000";
        context.moveTo(beginElement.x, beginElement.y);
        context.lineTo(selectPoint.pageX, selectPoint.pageY);
        context.stroke();
    }
    return result;
}

//  Проверка, указывает ли курсор на участок сети
function IsSection(e) {
    var pixel = context.getImageData(e.x, e.y, 1, 1);
    if ((pixel.data[0] != 0 && pixel.data[0] != 169) || (pixel.data[1] != 0 && pixel.data[1] != 169) || (pixel.data[2] != 0 && pixel.data[2] != 169))
        return true; else return false;
}

//  Метод вывода информации о трассе
function SelectInfo(selectElement) {
    var outNumber = document.getElementById("outNumber");
    var outType = document.getElementById("outType");
    var outYear = document.getElementById("outYear");
    if (selectElement == null) {
        outNumber.textContent = "";
        outType.textContent = "";
        outYear.textContent = "";
    } else {
        outNumber.textContent = selectElement.number;
        outType.textContent = selectElement.type;
        outYear.textContent = selectElement.year;
    }
}

//  начало ввода помещения
function EnterRoom() {
    communicationAddition = false;
    addSectionsOfNetwork = null;
    roomAddition = true;
    beginRect = null;
    //  проверка на вводимые точки. Если их меньше 2, то секций нет
    //  Скрыть кнопку завершения ввода
    var endButton = document.getElementById("endEnter");
    endButton.style.display = "none";

    //Активировать поля для ввода
    var newNumber = document.getElementById("number");
    var newType = document.getElementById("type");
    var newYear = document.getElementById("year");
    newNumber.disabled = false;
    newType.disabled = false;
    newYear.disabled = false;
}

//  Открыть форму с изменением окна
function OpenTransform(communication) {
    transformCommunication = communication;
    var info = document.getElementById("transform");
    info.style.display = "block";
    var number = document.getElementById("infoNumber");
    var type = document.getElementById("infoType");
    var year = document.getElementById("infoYear");
    number.value = communication.number;
    type.value = communication.type;
    year.value = communication.year;
}

function CloseTransform() {
    var info = document.getElementById("transform");
    var number = document.getElementById("infoNumber");
    var type = document.getElementById("infoType");
    var year = document.getElementById("infoYear");
    number.value = "";
    type.value = "";
    year.value = "";
    info.style.display = "none";
    transformCommunication = null;
}

function EnterTransform() {
    var number = document.getElementById("infoNumber");
    var type = document.getElementById("infoType");
    var year = document.getElementById("infoYear");
    transformCommunication.number = number.value;
    transformCommunication.type = type.value;
    transformCommunication.year = year.value;
    CloseTransform();
}