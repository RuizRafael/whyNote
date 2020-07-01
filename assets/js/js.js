/****************************
		SERVICE WORKER
*****************************/

Validación ruta Dev-Prod
var url = window.location.href;
var swLocation = '/whyNote/sw.js';

// Install
if (navigator.serviceWorker) {
	console.log('Navigator OK')
	if (url.includes('localhost') || url.includes('127.0.0.1')) {
		swLocation = '/sw.js';
	}
	navigator.serviceWorker.register(swLocation);
} else {
	console.log('Navigator NO')
}


/****************************
		READY STATE
*****************************/

document.addEventListener("readystatechange", eventController);
function eventController() {
	if (document.readyState == "interactive") {
		let container = document.getElementById("container");
		let notesContainer = document.getElementById("notesContainer");

		//EVENTOS
		document.getElementById("buttonCreateNote").addEventListener("click", createNoteInButton, false);
		document.getElementById("addNewNote").addEventListener("click", addNewNote, false);
		document.body.addEventListener("click", targetClicked, false);

		// (+) con sus funciones
		document.getElementById('menu').addEventListener('click', showMenu1);
		document.getElementById('createNote').addEventListener('click', createNote1);
		document.getElementById('createFolder').addEventListener('click', createFolder1);



		//Temporal para volver atras
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
// VARIABLES


/****************************
		FIREBASE CONF
*****************************/

// Firebase configuration
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


/****************************
		VARIABLES GLOB
*****************************/

let db = firebase.firestore();
let dbRef = db.collection('DBNotes');
let notes = dbRef.doc('Informatica').collection('notes');
let groups = dbRef.doc('Informatica').collection('groups');
let countNotes;
let totalPages;
let notesArray;


/****************************
		FUNCTIONS
*****************************/
window.onload = cargarNotas();


function cargarNotas() {
	console.log('CARGANDO NOTAS')
	notes.orderBy("id_note", "asc").onSnapshot(notes => {
		countNotes = 0;
		notesArray = [];
		notes.forEach(note => {
			//Muestra el ID, el contenido, title y array hashtags de cada nota
			//console.log(/*note.id,*/ " => ", note.data());
			notesArray.push([note.id, note.data().title, note.data().content, note.data().hashtags]);
			countNotes = countNotes + 1;
		});

		paintNotes();

	});
}

function cargarGrupos() {
	console.log('CARGANDO Grupos');
	groups.onSnapshot(groups => {
		groups.forEach(item => {
			console.log(item.data().group)
		})
	})
}


async function createNoteInButton() {
	let noteId = "note_id" + (countNotes + 1);
	let G;
	await groups.onSnapshot(groups => {
		groups.forEach(item => {
			G = item.data().group;
		})
	});
	console.log(G);
	alert(noteId);
	notes.doc(noteId).set({
		id_note: noteId,
		title: "Btn " + (countNotes + 1),
		hashtags: ["#Prueba", "#" + (countNotes + 1)],
		content: "Esta es la prueba del boton (" + (countNotes + 1) + ")para añadir la notita",
		groups: "MercaDroga"
	});

}






const targetClicked = (e) => {
	let idClicked = e.target.id;
	let classClicked = e.target.className;
	if (classClicked == "bin") {
		deleteNote(e.target.alt);
	}
	//console.log("Id => (" + idClicked + ") \\ Clase => (" + classClicked + ")");
}


function paintNotes() {
	document.getElementById('notesContainer').style.padding = "7%";
	document.getElementById('menu').style.opacity = "1";
	notesContainer.innerHTML = "";

	//console.log(notesArray.length);
	for (var i = 0; i < notesArray.length; i++) {
		// console.log(notesArray[i]);
		createNote(notesArray[i][0], notesArray[i][1], notesArray[i][2], notesArray[i][3]);
	}
}




function randomColor() {
	// Con el blanco background para las notas y el borde negro puesto:
	// let arrayColors = ["note-white","note-aqua","note-yellow","note-red","note-green","note-pink"];
	let arrayColors = ["note-aqua", "note-yellow", "note-red", "note-green", "note-pink"];
	return arrayColors[Math.trunc(Math.random() * (5 - 0) + 0)];
}

function createNote(id, title, content, arrayHashtags, color = randomColor()) {
	let hashtags = "";

	for (let i = 0; i < arrayHashtags.length; i++) {
		hashtags += "<h5 class=" + id + ">" + arrayHashtags[i] + "</h5>";
	}
	notesContainer.innerHTML += `

		<div id='${id}' class='${id} note ${color}'>
					<h3 class="${id}">${title}</h3>
					${hashtags}
					<p class="${id} note-content">${content}</p>
		</div>`;
}



function addNewNote() {
	let title = document.getElementById('addTitleNote').value;
	let hash = document.getElementById('addHashtagNote').value.split(" ");
	let content = document.getElementById('addTextNote').value;
	let noteId = "note_id" + (countNotes + 1);
	notes.doc(noteId).set({
		id_note: noteId,
		title: title,
		hashtags: hash,
		content: content
	});
	buttonFormNote();
}

/****************************
		FORMULARIO
*****************************/
function buttonFormNote() {
	if (document.getElementById("formNewNote").style.display == "block") {
		document.getElementById("formNewNote").style.display = "none";
	} else {
		notesContainer.innerHTML = "";
		document.getElementById("formNewNote").style.display = "block";
	}
}

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


/****************************
		DISPLAYS
*****************************/


function showMenu1() {
	// Mostrar menú
	console.log("Create note visibiliti = " + document.getElementById('createNote').style.visibility);

	if (document.getElementById('createNote').style.visibility == "hidden") {
		document.getElementById('createNote').style.visibility = "visible";
		document.getElementById('changeView').style.visibility = "visible";
		document.getElementById('createFolder').style.visibility = "visible";
		document.getElementById('search').style.visibility = "visible";
		document.getElementById('menu').style.height = '60px';
		document.getElementById('menu').style.width = '60px';

		// Ocultar menú
	} else {
		console.log(document.getElementById('createNote').style.visibility);
		document.getElementById('createNote').style.visibility = "hidden";
		document.getElementById('changeView').style.visibility = "hidden";
		document.getElementById('createFolder').style.visibility = "hidden";
		document.getElementById('search').style.visibility = "hidden";
		document.getElementById('menu').style.height = '70px';
		document.getElementById('menu').style.width = '70px';
	}

}




function createNote1() {
	showMenu1();
	buttonFormNote();
}

function createFolder1() {
	alert("Vamos a crear una carpeta");
}
