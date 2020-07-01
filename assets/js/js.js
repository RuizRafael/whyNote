/**********************************************************************************
		SERVICE WORKER
***********************************************************************************/

//Validación ruta Dev-Prod
var url = window.location.href;
var swLocation = '/whyNote/sw.js';

// Install
if (navigator.serviceWorker) {
	console.log('Navegador acepta SW')
	if (url.includes('localhost') || url.includes('127.0.0.1')) {
		swLocation = '/sw.js';
	}
	navigator.serviceWorker.register(swLocation);
} else {
	console.log('Navigator NO acepta SW')
}


/**********************************************************************************
		READY STATE
***********************************************************************************/

document.addEventListener("readystatechange", eventController);
function eventController() {
	if ( document.readyState == "interactive" ) {
		let container = document.getElementById("container");
		let notesContainer = document.getElementById("notesContainer");

		document.getElementById("buttonCreateNote").addEventListener("click", createNoteInButton, false);
 		//document.getElementById("addNewNote").addEventListener("click", addNewNote, false);
		document.body.addEventListener("click", targetClicked, false);

		document.getElementById('menu').addEventListener('click', showMenu);

		document.getElementById('createFolder').addEventListener('click', createFolder1);

		document.getElementById('changeView').addEventListener('click', changeView);

		document.getElementById('notesView').addEventListener('click', paintNotes);

		document.getElementById('deleteBignote').addEventListener('click', deleteNote);

		// chargeGroups();
		chargeNotes("rafa");
	}
}


//Inutilizar click derecho y la tecla 123 = F12
/*
$(document).bind("contextmenu",function(e) {
 e.preventDefault();
});

$(document).keydown(function(e){
    if(e.which === 123){
       return false;
    }
});
*/

/**********************************************************************************
		FIREBASE CONF
***********************************************************************************/
var firebaseConfig = {
    apiKey: "AIzaSyA4_HPSXsgO-ZH5fWu2k3ognj21PBOR9N4",
    authDomain: "whynote-3ee22.firebaseapp.com",
    databaseURL: "https://whynote-3ee22.firebaseio.com",
    projectId: "whynote-3ee22",
    storageBucket: "whynote-3ee22.appspot.com",
    messagingSenderId: "478732025394",
    appId: "1:478732025394:web:c583af96f9eaa94c8ac62b"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


/**********************************************************************************
		VARIABLES GLOB
***********************************************************************************/
let db = firebase.firestore();
let dbRef = db.collection('DBNotes');
let notes = dbRef.doc('Informatica').collection('notes');
let groups = dbRef.doc('Informatica').collection('groups');
let countNotes;
let notesArray, groupsArray;
let actualId, actualGroup;
let lastId;

/**********************************************************************************
		FUNCTIONS
***********************************************************************************/
// window.onload = chargeGroups();

function login() {
	document.getElementById('menu').style.opacity = "0";
	document.getElementById('notesContainer').style.padding = "0%";
				notesContainer.classList.add('opacityAnimation');
				notesContainer.innerHTML = `<div class='note-big animatedBG'>
					<p class="title center">whyNote!</p>
					<h2 class="center">
						<!-- TEXTS  -->
						<span id="typed"></span>
							<div id="typingEffect">
								<p class="typing">Hola!</p>
								<p>Hello!</p>
								<p>Salut!</p>
								<p>Ni hao!</p>
								<p>Olá!</p>
								<p>Privyét!</p>
								<p>Alô!</p>
								<p>Hi!</p>
								<p>By Rafa ♥</p>
							</div>
							<!-- TEXTS ENDS -->
					</h2>
					<input type="text" id="login" onkeyup="checkGroup()" placeholder="A que grupo quieres acceder?"><span class="bar"></span>

				</div>`;
				document.getElementById('notesView').style.visibility = "visible";

}

function checkGroup() {
	let group = document.getElementById('login').value;
 	if(group.length >= 4){

		for (var i = 0; i < groupsArray.length; i++) {
			if(group == groupsArray[i][0]) {
				actualGroup = group;
				chargeNotes(group);
				break;
			}
		}
		console.log("Aviso de que no existe ningun grupo con este name loco");

	}

}

function chargeGroups() {
	console.log('CARGANDO GRUPOS')
	groupsArray = [];
	groups.onSnapshot(groups => {
		groups.forEach(group => {
				groupsArray.push([group.data().group, group.data().pass]);
		});
	});
	login();
}

function chargeNotes(group) {
	console.log('CARGANDO NOTAS')
	notes.orderBy("id_note", "asc").onSnapshot(notes => {
		countNotes = 0;
		lastId = "id_note0";
		notesArray = [];
		notes.forEach(note => {
			//Muestra el ID, el contenido, title y array hashtags de cada nota
			//console.log(/*note.id,*/ " => ", note.data());
			if(note.data().groups == group){
				notesArray.push([note.id, note.data().title, note.data().content, note.data().hashtags, note.data().color]);
			}
			countNotes = countNotes + 1;
			if(substrNumberId(note.id) > substrNumberId(lastId)){
				lastId = note.id;
			}
		});

		document.getElementById('notesContainer').style.display = "flex";
		console.log(lastId);
		console.log(addLastNumberID(lastId));
		paintNotes();
	});
}


function substrNumberId(noteId){
	return parseInt(noteId.substr(7-noteId.length,noteId.length));
}
function addLastNumberID(noteId){
	return "note_id" + (parseInt(noteId.substr(7-noteId.length,noteId.length)) + 1);
}



function createNoteInButton(){
		let noteId = addLastNumberID(lastId);
		let randomColor = Math.trunc(Math.random() * (5 - 0) + 0);
		alert(noteId);
		notes.doc(noteId).set({
		color: randomColor,
		groups: actualGroup,
		id_note:noteId,
		title: noteId,
    hashtags: ["#Prueba", "#"+noteId],
		content: "Esta es la prueba del boton ("+noteId+")para añadir la notita" });
}


const targetClicked = (e) => {
	let idClicked = e.target.id;
	let classClicked = e.target.className;
	if(classClicked.includes("note_id")){
		viewNote(classClicked.substr(0,8));
	}
	if(classClicked == "deleteNote"){
		deleteNote();
	}
	if(classClicked.includes("hat-color-")){
		changeColor();
	}

	console.log("Id => (" + idClicked + ") \\ Clase => (" + classClicked + ")");
}

function viewNote(idClicked){

	for (var i = 0; i < notesArray.length; i++) {
		if(notesArray[i][0] == idClicked){
			actualId = idClicked;
			document.getElementById('menu').style.opacity = "0";
			document.getElementById('notesContainer').style.padding = "0%";
			let colorBackground = document.getElementById(notesArray[i][0]).classList[2];
			let hashtags = "";
			for(let j = 0 ; j < notesArray[i][3].length; j++){
				hashtags += "<h2>"+notesArray[i][3][j]+"</h2>";
			}
			var innerHTMLString = '<h1> I am H1 </h1>';
			notesContainer.classList.add('pre-animation');


			notesContainer.innerHTML = `<div class='note-big `+colorBackground+`'>
			<form>
						<img id="ss" class="deleteNote" src="assets/img/cross.png" alt="delete" >

						<input type="text" id="addTitleNote" value="`+notesArray[i][1]+`">
						<input type="text" id="addHashtagNote" value="`+notesArray[i][1]+`"><span class="bar"></span>

						<h1>`+notesArray[i][1]+`</h1>
					`+hashtags+`
						<p>`+notesArray[i][2]+`</p>
										<div class="colorPicker">
										  <input class="red" type="radio" name="colorSelected" value="red" id="colorSelected-red"/>
										  <label class="red" for="colorSelected-red">red</label>
										  <input class="orange" type="radio" name="colorSelected" value="orange" id="colorSelected-orange"/>
										  <label class="orange" for="colorSelected-orange">orange</label>
										  <input class="yellow" type="radio" name="colorSelected" value="yellow" id="`+notesArray[i][1]+` colorSelected-yellow"/>
										  <label class="yellow" for="colorSelected-yellow">yellow</label>
										  <input class="green" type="radio" name="colorSelected" value="green" id="colorSelected-green"/>
										  <label class="green" for="colorSelected-green">green</label>
										  <input class="blue" type="radio" name="colorSelected" value="blue" id="colorSelected-blue"/>
										  <label class="blue" for="colorSelected-blue">blue</label>
										  <input class="indigo" type="radio" name="colorSelected" value="indigo" id="colorSelected-indigo"/>
										  <label class="indigo" for="colorSelected-indigo">Dark Blue</label>
										  <input class="violet" type="radio" name="colorSelected" value="violet" id="colorSelected-violet"/>
										  <label class="violet" for="colorSelected-violet">violet</label>
										</div>
			</div>

				<div class="group">
				</div>
				<div class="group">
						<textarea id="addTextNote" placeholder="text"></textarea><span class="highlight"></span><span class="bar"></span>
				</div>
			</form>`;
			document.getElementById('notesView').style.visibility = "visible";

			setTimeout(function(){
				document.getElementById('notesView').style.opacity = "1";
				notesContainer.classList.remove('pre-animation');
			},500);
		}
	}
}



function paintNotes(){
	document.getElementById('notesContainer').style.padding = "7%";
	document.getElementById('menu').style.opacity = "1";
	document.getElementById('notesView').style.visibility = "hidden";
	document.getElementById('notesView').style.opacity = "0";

	notesContainer.innerHTML = "";
	for (var i = 0; i < notesArray.length; i++) {
		//console.log(notesArray[i]);
		createNote(notesArray[i][0],notesArray[i][1],notesArray[i][2],notesArray[i][3], notesArray[i][4]);
	}
}


function printColor(index){
	// Con el blanco background para las notas y el borde negro puesto:
	// let arrayColors = ["note-white","note-aqua","note-yellow","note-red","note-green","note-pink"];
	let arrayColors = ["note-aqua","note-yellow","note-red","note-green","note-pink"];
	// return arrayColors[Math.trunc(Math.random() * (5 - 0) + 0)];
	return arrayColors[index];
}

function createNote(id,title,content,arrayHashtags,color) {
		let hashtags = "";

		for(let i = 0 ; i < arrayHashtags.length; i++){
			hashtags += "<h5 class="+id+">"+arrayHashtags[i]+"</h5>";
		}
		if(content.length > 52){
			content = content.slice(0,51) + "...";
		}
		color = printColor(color);

		notesContainer.innerHTML += `
		<div id='${id}' class='${id} note ${color}'>
					<h3 class="${id}">${title}</h3>
					${hashtags}
					<p class="${id} note-content">`+content+`</p>
		</div>`;
}

function changeView(){
	if(document.getElementById('notesContainer').style.display == "block"){
		document.getElementById('notesContainer').style.display = "flex";
		document.getElementById('imgChangeView').style.transform = "rotate(90deg)";
		console.log("Cambio de Vista a flex");
	} else {
		document.getElementById('notesContainer').style.display = "block";
		document.getElementById('imgChangeView').style.transform = "rotate(360deg)";
		console.log("Cambio de Vista a block");
	}
}


function deleteNote(){

	actualId = "note_id"+prompt("Que numero de nota quieres borrar?");

	console.log("Ejecutado el borrado de nota con id: " + actualId);

	if(actualId != "note_idnull"){
		for (var i = 0; i < notesArray.length; i++) {
			if(actualId == notesArray[i][0]){
				notes
					.doc(actualId)
					.delete()
					.then( () => console.log('Borrado'))
					.catch( e => console.log('error',e))
			}
		}
	}
}


function addNewNote(){
	let title = document.getElementById('addTitleNote').value;
	let hash = document.getElementById('addHashtagNote').value.split(" ");
	let content = document.getElementById('addTextNote').value;
	let noteId = addLastNumberID(lastId);
	let randomColor = Math.trunc(Math.random() * (5 - 0) + 0);

	notes.doc(noteId).set({
	color: randomColor,
	groups: actualGroup,
	id_note:noteId,
	title: title,
	hashtags: hash,
	content: content });
	formNewNote();
}


/**********************************************************************************
		FORMULARIO
***********************************************************************************/


$(window, document, undefined).ready(function () {
    $("input").blur(function () {
        var $this = $(this);
        if ($this.val()) $this.addClass("used");
        else $this.removeClass("used");
    });
    var $ripples = $(".ripples");
    $ripples.on("click.Ripples", function (e) {
        var $this = $(this);
        var $offset = $this.parent().offset();
        var $circle = $this.find(".ripplesCircle");
        var x = e.pageX - $offset.left;
        var y = e.pageY - $offset.top;
        $circle.css({
            top: y + "px",
            left: x + "px"
        });
        $this.addClass("is-active");
    });
    $ripples.on(
        "animationend webkitAnimationEnd mozAnimationEnd oanimationend MSAnimationEnd",
        function (e) {
            $(this).removeClass("is-active");
        }
    );
});



/**********************************************************************************
		DISPLAYS
***********************************************************************************/
function showMenu() {
	// Mostrar menú
	console.log("Create note visibiliti = "+document.getElementById('createNote').style.visibility);

	if ( document.getElementById('createNote').style.opacity == "0" ) {
		document.getElementById('createNote').style.opacity = ".7";
		document.getElementById('changeView').style.opacity = ".7";
		document.getElementById('createFolder').style.opacity = ".7";
		document.getElementById('search').style.opacity = ".7";


		document.getElementById('createNote').style.zIndex = "1";
		document.getElementById('changeView').style.zIndex = "1";
		document.getElementById('createFolder').style.zIndex = "1";
		document.getElementById('search').style.zIndex = "1";

		document.getElementById('menu').style.height = '70px';
		document.getElementById('menu').style.width = '70px';

	// Ocultar menú
	} else {
		document.getElementById('createNote').style.opacity = "0";
		document.getElementById('changeView').style.opacity = "0";
		document.getElementById('createFolder').style.opacity = "0";
		document.getElementById('search').style.opacity = "0";

		document.getElementById('createNote').style.zIndex = "0";
		document.getElementById('changeView').style.zIndex = "0";
		document.getElementById('createFolder').style.zIndex = "0";
		document.getElementById('search').style.zIndex = "0";

		document.getElementById('menu').style.height = '70px';
		document.getElementById('menu').style.width = '70px';
	}

}

function dance(){
		for (var i = 0; i < notesArray.length; i++) {
			document.getElementById(notesArray[i][0]).classList.add("dance");
		}
}

function createNote1() {
	showMenu();
	formNewNote();
}

function createFolder1() {
	dance();
}
