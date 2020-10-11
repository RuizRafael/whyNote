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

		document.body.addEventListener("click", targetClicked, false);
		document.addEventListener("backbutton", onBackKeyDown, false);



		document.getElementById('menu').addEventListener('click', showMenu);

		document.getElementById('iconNewnote').addEventListener('click', createAutoNote);

		document.getElementById('search').addEventListener('click', deleteAllNotes);

		document.getElementById('createFolder').addEventListener('click', createFolder);

		document.getElementById('changeView').addEventListener('click', changeView);

		document.getElementById('notesView').addEventListener('click', updateNoteInfo);

		document.getElementById('swap').addEventListener('click', activeSwap);

		 chargeGroups();
		 //actualGroup = "rafa";
		 //chargeNotes();

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
let boolSwap = false;
let firstId = "0";
let boolBlockNotes = false;
let arrayColors = ["note-aqua","note-yellow","note-red","note-green","note-pink","note-grey","note-darkblue","note-rainbow","note-diamond"];



/**********************************************************************************
		FUNCTIONS
***********************************************************************************/
// window.onload = chargeGroups();
function onBackKeyDown() {
    alert("Le diste atras wachin");
}
function login() {
	document.getElementById('menu').style.opacity = "0";
	document.getElementById('menu').style.zIndex = '-1';
	document.getElementById('notesContainer').style.padding = "0%";
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
					<input type="text" id="login" onkeyup="checkGroup()" autocomplete="off" placeholder="A que grupo quieres acceder?"><span class="bar"></span>

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
		console.log("No existe ningun grupo con este name ");

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

function updateNoteInfo() {
	let colorNumber = printColorNumber(document.getElementById("bigNote").classList[1]);

	notes.doc(actualId).update({
		title: document.getElementById("addTitleNote").value,
		content: document.getElementById("addTextNote").value,
		color: colorNumber
	});
	chargeNotes();
}
function chargeNotes(group = "rafa") {

	group = "rafa";
	console.log('CARGANDO NOTAS');
	actualId = "";

	notes.orderBy("id_note", "asc").onSnapshot(notes => {
		countNotes = 0;
		lastId = "id_note0";
		notesArray = [];
		notes.forEach(note => {
			//Muestra el ID, el contenido, title y array hashtags de cada nota
			//console.log(/*note.id,*/ " => ", note.data());
			if(note.data().groups == actualGroup){
				notesArray.push([note.id, note.data().title, note.data().content, note.data().hashtags, note.data().color, note.data().id_note]);
			}
			countNotes = countNotes + 1;
			if(substrNumberId(note.id) > substrNumberId(lastId)){
				lastId = note.id;
			}
		});

		document.getElementById('notesContainer').style.display = "flex";
		hideMenu("0","-1");
		document.getElementById('menu').style.opacity = "1";
		document.getElementById('menu').style.zIndex = '1';
		if(notesArray.length == 0) {
			paintDemo();
		} else {
			paintNotes();
		}
	});

}


function substrNumberId(noteId){
	return parseInt(noteId.substr(7-noteId.length,noteId.length));
}
function addLastNumberID(noteId){
	return "note_id" + (parseInt(noteId.substr(7-noteId.length,noteId.length)) + 1);
}
function searchId(string) {
	let id = string.split(" ");
	for (var i = 0; i < id.length; i++) {
		if(id[i].includes("note_id")){
			return id[i];
		}
	}
}



function createAutoNote(){
	let noteId = addLastNumberID(lastId);
	let randomColor = colorRandom();
	notes.doc(noteId).set({
	color: randomColor,
	groups: actualGroup,
	id_note: (notesArray.length +1),
	//title: noteId,
	title: "New!🤍",
	hashtags: [],
  	//hashtags: ["#Prueba", "#"+noteId, "#Dev", "#Tags"],
	//content: "Esta es la prueba del boton ("+noteId+") para añadir la notita. Ultimo update a las 14:20 del 02/07/2020" });
	content: "..." });
}


let idClicked, classClicked;
const targetClicked = (e) => {
	idClicked = e.target.id;
	classClicked = e.target.className;
	if(classClicked.includes("note_id")){
		actualId = searchId(classClicked);
	}
	if(classClicked.includes("tag-delete")){
		deleteTag();
	}



	if( (notesArray.length > 0) && ( document.getElementById(notesArray[0][0]) != undefined ) && ( document.getElementById(notesArray[0][0]).classList.value.includes("dance") ) ){
		deleteNote();
	}
	if(boolSwap) {

		swapCards(actualId);

	} else if(classClicked.includes("note_id")){
		viewNote(searchId(classClicked));
	} else if(classClicked == "deleteNote"){
		deleteNote();
	}
	if(idClicked.includes("colorSelected-")){
		changeColor(classClicked);
	}
	if(idClicked != "" || classClicked != "") {
		console.log("Id => (" + idClicked + ") \\ Clase => (" + classClicked + ")");
	}
}

function viewNote(idClicked){
	hideMenu("0","-1");

	for (var i = 0; i < notesArray.length; i++) {
		if(notesArray[i][0] == idClicked){
			actualId = idClicked;
			document.getElementById('menu').style.opacity = "0";
			document.getElementById('menu').style.zIndex = '-1';
			document.getElementById('notesContainer').style.padding = "0%";
			let colorBackground = document.getElementById(notesArray[i][0]).classList[2];
			let hashtags = "";
			for(let j = 0 ; j < notesArray[i][3].length; j++){

				hashtags += '<li><a href="#" class="tag '+notesArray[i][3][j]+'">'+notesArray[i][3][j]+'</a></li>';

			}
			var innerHTMLString = '<h1> I am H1 </h1>';
			notesContainer.classList.add('pre-animation');

			// <img id="ss" class="deleteNote" src="assets/img/cross.png" alt="delete" >

			notesContainer.innerHTML = `<div id="bigNote" class='note-big `+colorBackground+`'>
			<form>

						<input type="text" id="addTitleNote" value="`+notesArray[i][1]+`" autocomplete="off">
						<ul class="tags">
						  `+hashtags+`
						</ul>
						<p><textarea id="addTextNote" spellcheck="false" placeholder="Empieza tu nota!">`+notesArray[i][2]+`</textarea></p>

							<div class="colorPicker">
							  <input class="note-grey" type="radio" name="colorSelected" autocomplete="off" value="grey" id="colorSelected-grey"/>
							  <label class="note-grey" for="colorSelected-grey">grey</label>
							  <input class="note-yellow" type="radio" name="colorSelected" autocomplete="off" value="yellow" id="colorSelected-yellow"/>
							  <label class="note-yellow" for="colorSelected-yellow">yellow</label>
							  <input class="note-green" type="radio" name="colorSelected" autocomplete="off" value="green" id="colorSelected-green"/>
							  <label class="note-green" for="colorSelected-green">green</label>
							  <input class="note-aqua" type="radio" name="colorSelected" autocomplete="off" value="blue" id="colorSelected-blue"/>
							  <label class="note-aqua" for="colorSelected-blue">blue</label>
							  <input class="note-darkblue" type="radio" name="colorSelected" autocomplete="off" value="indigo" id="colorSelected-indigo"/>
							  <label class="note-darkblue" for="colorSelected-indigo">DarkBlue</label>
							  <input class="note-pink" type="radio" name="colorSelected" autocomplete="off" value="violet" id="colorSelected-violet"/>
							  <label class="note-pink" for="colorSelected-violet">violet</label>
								<input class="note-red" type="radio" name="colorSelected" autocomplete="off" value="red" id="colorSelected-red"/>
							 <label class="note-red" for="colorSelected-red">red</label>
							</div>
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



function paintNotes() {
	actualId = "";
	document.getElementById('notesContainer').style.padding = "6%";
	document.getElementById('menu').style.opacity = "1";
	document.getElementById('menu').style.zIndex = "2";
	document.getElementById('notesView').style.visibility = "hidden";
	document.getElementById('notesView').style.opacity = "0";

	notesContainer.innerHTML = "";
	for (var i = 0; i < notesArray.length; i++) {
		//console.log(notesArray[i]);
		createNote(notesArray[i][0],notesArray[i][1],notesArray[i][2],notesArray[i][3], notesArray[i][4]);
	}

	printChangeView();
}

function paintDemo() {
	document.getElementById('notesContainer').style.padding = "6%";
	document.getElementById('notesView').style.visibility = "hidden";
	document.getElementById('notesView').style.opacity = "0";
	document.getElementById('menu').style.opacity = "1";
	notesContainer.innerHTML = '<p class="demo">No tienes ninguna nota! <br />Para empezar a crear una haz click ahí.<img class="arrow1" src="assets/img/arrow1.gif" alt="createNote"><img class="arrow2" src="assets/img/arrow2.gif" alt="createNote">';
}

function changeColor(color) {
	document.getElementById("bigNote").className = '';
	document.getElementById("bigNote").classList.add("note-big");
	document.getElementById("bigNote").classList.add(color);
}

function printColorNumber(color) {
	for (var i = 0; i < arrayColors.length; i++) {
		if(arrayColors[i] == color) return i;
	}
}

function colorRandom() {
	let random = Math.trunc(Math.random() * (9 - 0) + 0);
	if(random == 8 || random == 7){
		console.log("SALIO DORADA POR PRIMERA VEZ")
		random = Math.trunc(Math.random() * (9 - 0) + 0);
		if(random == 8 || random == 7){
			console.log("¡¡¡¡¡¡SALIO DORADA POR SEGUNDA VEZ!!!!!!!!!!")
			random = Math.trunc(Math.random() * (9 - 0) + 0);
			if(random == 8 || random == 7){
				console.log("¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡SALIO DORADA POR TERCERA VEEZ!!!!!!!!!!!!!!!!!!!!!")
			}
		}
	}
	return random;
}




function createNote(id,title,content,arrayHashtags,color) {
		let hashtags = "";

		for(let i = 0 ; i < arrayHashtags.length; i++){
			hashtags += "<h5 class="+id+">"+arrayHashtags[i]+"</h5>";
		}

		color = arrayColors[color];

		notesContainer.innerHTML += `
		<div id='${id}' class='${id} note ${color}'>
					<h3 class="${id}">${title}</h3>
					${hashtags}
					<p class="${id} note-content">`+content+`</p>
		</div>`;
}

function changeView(){
	if(boolBlockNotes){
		boolBlockNotes = false;
	} else {
		boolBlockNotes = true;
	}
	printChangeView();
}

function printChangeView() {
	if(boolBlockNotes){
		for (var i = 0; i < notesArray.length; i++) {
			document.getElementsByClassName('note')[i].style.maxWidth = "100%";
		}
		document.getElementById('notesContainer').style.display = "block";
		document.getElementById('imgChangeView').style.transform = "rotate(360deg)";

	} else {
		document.getElementById('notesContainer').style.display = "flex";
		document.getElementById('imgChangeView').style.transform = "rotate(90deg)";
		for (var i = 0; i < notesArray.length; i++) {
			document.getElementsByClassName('note')[i].style.maxWidth = "46%";
		}

	}
}


function deleteNote(){

	console.log("Ejecutado el borrado de nota con id: " + actualId);

	if(classClicked.includes("note_id")){
		for (var i = 0; i < notesArray.length; i++) {
			if(actualId == notesArray[i][0]){
				notes
					.doc(actualId)
					.delete()
					.then( () => console.log('Nota borrada'))
					.catch( e => console.log('Error al borrat la nota: ',e))
			}
		}
		hideMenu(0,-1);
	} else {
		document.getElementById("danceImg").src = "assets/img/nodance.png";
	}

}

function deleteAllNotes() {
	for (var i = 0; i < notesArray.length; i++) {
			notes
				.doc(notesArray[i][0])
				.delete()
				.then( () => console.log('Nota borrada'))
				.catch( e => console.log('Error al borrat la nota: ',e))

	}
	hideMenu("0","-1");
}

function deleteTag() {
	alert(notesArray[1][3]);
	notesArray[1][3].splice( notesArray[1][3].indexOf( "#Java" ), 1 );
	alert(notesArray[1][3]);

	//
	// for (var i = 0; i < notesArray.length; i++) {
	// 	if(actualId == notesArray[i][1]){
	// 		let searchingTagname = classClicked.split(" ");
	// 		for (var j = 0; j < notesArray[i][3].length; j++) {
	// 			if(searchingTagname[2] != notesArray[i][3][j]){
	// 				newHashtags += notesArray[i][3][j]+" "
	// 			}
	//
	// 		}

			// if(searchingTagname[2])
			// 	notesArray[i][0]
			// 	notes.doc(actualId).set({
			// 	color: notesArray[i][4],
			// 	groups: actualGroup,
			// 	id_note: notesArray[i][0],
			// 	title: notesArray[i][1],
			// 	hashtags: notesArray[i][3],
			// 	content: notesArray[i][2] });
	// 	}
	// }
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
function showMenu(bool = false) {
	// Mostrar menú
	if ( document.getElementById('iconNewnote').style.zIndex == "-1" ) {
		document.getElementById("danceImg").src = "assets/img/dance.png";

		hideMenu("1","1");

		document.getElementById('menu').style.height = '70px';
		document.getElementById('menu').style.width = '70px';

	// Ocultar menú
	} else {
		hideMenu("0","-1");
		document.getElementById('menu').style.height = '70px';
		document.getElementById('menu').style.width = '70px';
	}
}

function hideMenu(opacity, zIndex) {
	document.getElementById('iconNewnote').style.opacity = opacity;
	document.getElementById('changeView').style.opacity = opacity;
	document.getElementById('createFolder').style.opacity = opacity;
	document.getElementById('search').style.opacity = opacity;
	document.getElementById('swap').style.opacity = opacity;

	document.getElementById('iconNewnote').style.zIndex = zIndex;
	document.getElementById('changeView').style.zIndex = zIndex;
	document.getElementById('createFolder').style.zIndex = zIndex;
	document.getElementById('search').style.zIndex = zIndex;
	document.getElementById('swap').style.zIndex = zIndex;

}

function dance(){
		if (document.getElementById(notesArray[0][0]).classList.value.includes("dance") ) {
			document.getElementById("danceImg").src = "assets/img/dance.png";
			for (var i = 0; i < notesArray.length; i++) {
				document.getElementById(notesArray[i][0]).classList.remove("dance");
			}
		} else {
			document.getElementById("danceImg").src = "assets/img/nodance.png";
			for (var i = 0; i < notesArray.length; i++) {
				document.getElementById(notesArray[i][0]).classList.add("dance");
			}
		}

}

function createNote1() {
	// showMenu();
	createAutoNote();
}

function createFolder() {
	dance();
}

function activeSwap() {
	if(boolSwap){
		boolSwap = false;

		} else {
		boolSwap = true;
	}
}
function swapCards(actualId) {
	if(actualId != ""){
		console.log(actualId);
		if(firstId == "0"){
			firstId = actualId;
			for (var i = 0; i < notesArray.length; i++) {
				document.getElementById(notesArray[i][0]).classList.remove("pulse-grow");
			}
			document.getElementById(firstId).classList.add("pulse-grow");
		} else {
			document.getElementById(firstId).classList.remove("pulse-grow");

			setTimeout(function(){ flippCard(firstId); }, 1);
			setTimeout(function(){ flippCard(actualId); }, 1);


			let position1, position2;
			for (var i = 0; i < notesArray.length; i++) {
				if(notesArray[i][0] == firstId){
					position1 = notesArray[i][5];
				}
				if(notesArray[i][0] == actualId){
					position2 = notesArray[i][5];
				}
			}
			setTimeout(function(){
				position1 = parseInt(position1);
				position2 = parseInt(position2);
				notes.doc(firstId).update({
					id_note: position2
				});
				notes.doc(actualId).update({
					id_note: position1
				});
			}, 400);

			boolSwap = false;
			setTimeout(function(){ firstId = 0; actualId = 0; }, 500);

		}
	} else {
		for (var i = 0; i < notesArray.length; i++) {
			document.getElementById(notesArray[i][0]).classList.add("pulse-grow");
		}
	}
}

function flippCard(id){
	if (document.getElementById(id).classList.value.includes("reverse") ) {

		document.getElementById(id).classList.remove("reverse");
		document.getElementById(id).classList.remove("back");
		document.getElementById(id).classList.add("flipped");

	} else {
		document.getElementById(id).classList.add("reverse");
		document.getElementById(id).classList.add("back");
		document.getElementById(id).classList.remove("flipped");

	}
}
