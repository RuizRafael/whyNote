// Validación de ruta Desarrollo/Producción
var url = window.location.href;
var swLocation = '/whyNote/sw.js';

// Service Worker
if (navigator.serviceWorker) {
	console.log('Navigator SW OK')
	if (url.includes('localhost') || url.includes('127.0.0.1')) {
		swLocation = '/sw.js';
	}
	navigator.serviceWorker.register(swLocation);
}else {
	console.log('Navigator NO')
}


document.addEventListener("readystatechange", eventController);
function eventController() {
	if (document.readyState == "interactive") {
		let container = document.getElementById("container");
		let notesContainer = document.getElementById("notesContainer");
		let paginationContainer = document.getElementById("paginationContainer");

		//EVENTOS
		document.getElementById("buttonCreateNote").addEventListener("click", createNoteInButton, false);
		document.getElementById("buttonFormNote").addEventListener("click", buttonFormNote, false);
		document.getElementById("addNewNote").addEventListener("click", addNewNote, false);
		document.body.addEventListener("click", targetClicked, false);

	}
}
//Inutilizar click derecho y la tecla 123 = F12
// $(document).bind("contextmenu",function(e) {
//  e.preventDefault();
// });

// $(document).keydown(function(e){
//     if(e.which === 123){
//        return false;
//     }
// });
// VARIABLES

var arrayNotes = [];

//Database

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
let db = firebase.firestore();
let dbRef = db.collection('DBNotes');
let notes = dbRef.doc('Informatica').collection('notes');
let countNotes;
let totalPages;
let notesArray = [];
notes.orderBy("id_note", "asc").onSnapshot(notes => {
	countNotes = 0;
	notes.forEach(note => {
		//Muestra el ID, el contenido, title y array hashtags de cada nota
		//console.log(note.id, " => ", note.data());
		notesArray.push(createNote(note.id, note.data().title, note.data().content, note.data().hashtags));
		countNotes = countNotes + 1;
	});


	totalPages = Math.ceil(countNotes / 4);
	// Crear la paginacion segun el numero de notas que haya
	//createPagination(totalPages);
	paintNotes("page_id" + totalPages);

});



// FUNCIONES





function createNoteInButton() {
	let noteId = "note_id" + (countNotes + 1);
	alert(noteId);
	notes.doc(noteId).set({
		id_note: noteId,
		title: "Btn " + (countNotes + 1),
		hashtags: ["#Prueba", "#" + (countNotes + 1)],
		content: "Esta es la prueba del boton (" + (countNotes + 1) + ")para añadir la notita"
	});
}



let idClicked = "";
let classClicked = "";
const targetClicked = (e) => {
	classClicked = e.target.className;
	idClicked = e.target.id;
	if (classClicked == "bin") {
		deleteNote(e.target.alt);
	}
	if (idClicked.includes("page_id")) {
		//paintNotes(idClicked);
	}
	console.log("Id => (" + idClicked + ") \\ Clase => (" + classClicked + ")");

}

function paintNotes(numPage = "note_id1") {
	numPage = numPage.slice(7, 14);
	notesContainer.innerHTML = "Lorem imposun";
	// for (var i = (4*numPage - 4); i < (4*numPage); i++) {
	// console.log("Num page: "+numPage+"| i = "+i+" ");
	for (var i = 0; i < notesArray.length; i++) {
		if (notesArray[i] != null) {
			notesContainer.innerHTML += notesArray[i];
		}
	}
}


function randomColor() {
	let arrayColors = ["", "note-aqua", "note-yellow", "note-red", "note-green", "note-pink"];
	return arrayColors[Math.trunc(Math.random() * (5 - 0) + 0)];
}

function createNote(id, title, content, arrayHashtags, color = randomColor()) {
	let hashtags = "";
	for (let i = 0; i < arrayHashtags.length; i++) {
		hashtags += "<h5>" + arrayHashtags[i] + "</h5>";
	}
	console.log(id);
	let finalNote = `
			<div class='note ${color}'>
				<img class="bin" width='25' src='assets/img/bin.png' alt='${id}'>
				<div class='note-header'>
					<h3>${title}</h3>
				</div>
				<div class='note-hashtags'>
					${hashtags}
				</div>
				<div class='note-content'>
					<p>${content}</p>
				</div>
			</div>`;
	return finalNote;
}

function createPagination(numPages) {
	let pages = "<ul>";
	for (var i = 1; i <= numPages; i++) {
		pages += '<a href="#"><li id="page_id' + i + '">' + i + '</li></a>';
	}
	pages += "</ul>";
	paginationContainer.innerHTML = pages;
}


function deleteNote(id) {
	console.log("Ejecutado el borrado de fila " + id.slice(7, 14));
	notes.ref("/note_id10").remove();

}


function addNewNote() {
	let title = document.getElementById('addTitleNote').value;
	let hash = document.getElementById('addHashtagNote').value.split(" ");
	let content = document.getElementById('addTextNote').value;
	let noteId = "note_id" + (countNotes + 1);
	noteId = "note_id7";
	notes.doc(noteId).set({
		id_note: noteId,
		title: title,
		hashtags: hash,
		content: content
	});
	buttonFormNote();
}
// FORMULARIO
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
