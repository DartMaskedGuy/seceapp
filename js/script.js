// Switching of page function
$(document).ready(function () {

  $(".dashboard").show();
  $(".forwarder").hide();
  $(".saved_note").hide();
  $(".settings").hide();
  $(".help").hide();

  $(".home-l").click(function () {
    $(".dashboard").show();
    $(".forwarder").hide();
    $(".saved_note").hide();
    $(".settings").hide();
    $(".help").hide();
  })

  $(".forwarder-l").click(function () {
    $(".dashboard").hide();
    $(".forwarder").show();
    $(".saved_note").hide();
    $(".settings").hide();
    $(".help").hide();
  })

  $(".saved-l").click(function () {
    $(".dashboard").hide();
    $(".forwarder").hide();
    $(".saved_note").show();
    $(".settings").hide();
    $(".help").hide();
  })

  $(".settings-l").click(function () {
    $(".dashboard").hide();
    $(".forwarder").hide();
    $(".saved_note").hide();
    $(".settings").show();
    $(".help").hide();
  })

  $(".help-l").click(function () {
    $(".dashboard").hide();
    $(".forwarder").hide();
    $(".saved_note").hide();
    $(".settings").hide();
    $(".help").show();
  })
})

// Sidebar
const menuItems = document.querySelectorAll('.menu-item');

// Remove active class from all menu items
const changeActiveItem = () => {
  menuItems.forEach(item => {
    item.classList.remove('active');
  })
}

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    changeActiveItem();
    item.classList.add('active');
  })
})

// Auto save js function
$('.auto-save').savy('load');

$('.auto-save').savy('load', function () {
  console.log("All data from savy are loaded");
})

// Copying of text Function
function copyText() {
  let textbox = document.getElementById("textbox");
  textbox.select();
  document.execCommand("Copy");
}

function myFunction() {
  var x = document.getElementById("textbox");
  if (x.innerHTML === "Copy") {
    x.innerHTML = "Copied";
  }
}

// Speech Conversion
try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
}
catch (e) {
  console.error(e);
  $('.no-browser-support').show();
  $('.app').hide();
}


var noteTextarea = $('#textbox');
var instructions = $('#instructions');
var notesList = $('ul#notes');

var noteContent = '';

// Get all notes from previous sessions and display them.
var notes = getAllNotes();
renderNotes(notes);



/*-----------------------------
      Voice Recognition 
------------------------------*/

// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// allowing us to keep recording even when the user pauses. 
recognition.continuous = true;

// This block is called every time the Speech APi captures a line. 
recognition.onresult = function (event) {

  // event is a SpeechRecognitionEvent object.
  // It holds all the lines we have captured so far. 
  // We only need the current one.
  var current = event.resultIndex;

  // Get a transcript of what was said.
  var transcript = event.results[current][0].transcript;

  // Add the current transcript to the contents of our Note.
  // There is a weird bug on mobile, where everything is repeated twice.
  // There is no official solution so far so we have to handle an edge case.
  var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

  if (!mobileRepeatBug) {
    noteContent += transcript;
    noteTextarea.val(noteContent);
  }
};

recognition.onstart = function () {
  instructions.text('Voice recognition activated. Try speaking into the microphone.');
}

recognition.onspeechend = function () {
  instructions.text('You were quiet for a while so voice recognition turned itself off.');
}

recognition.onerror = function (event) {
  if (event.error == 'no-speech') {
    instructions.text('No speech was detected. Try again.');
  };
}

/*-----------------------------
      App buttons and input 
------------------------------*/

$('#start-btn').on('click', function (e) {
  if (noteContent.length) {
    noteContent += ' ';
  }
  recognition.start();
});


$('#pause-btn').on('click', function (e) {
  recognition.stop();
  instructions.text('Voice recognition paused.');
});

// Sync the text inside the text area with the noteContent variable.
noteTextarea.on('input', function () {
  noteContent = $(this).val();
})

$('#save-btn').on('click', function (e) {
  recognition.stop();

  if (!noteContent.length) {
    instructions.text('Could not save empty note. Please say something to the mic.');
  }
  else {
    // Save note to localStorage.
    // The key is the dateTime with seconds, the value is the content of the note.
    saveNote(new Date().toLocaleString(), noteContent);

    // Reset variables and update UI.
    noteContent = '';
    renderNotes(getAllNotes());
    noteTextarea.val('');
    instructions.text('Note saved successfully.');
  }

})


notesList.on('click', function (e) {
  e.preventDefault();
  var target = $(e.target);

  // Listen to the selected note.
  if (target.hasClass('listen-note')) {
    var content = target.closest('.note').find('.content').text();
    readOutLoud(content);
  }

  // Delete note.
  if (target.hasClass('delete-note')) {
    var dateTime = target.siblings('.date').text();
    deleteNote(dateTime);
    target.closest('.note').remove();
  }
});



/*-----------------------------
      Speech Synthesis 
------------------------------*/

function readOutLoud(message) {
  var speech = new SpeechSynthesisUtterance();

  // Set the text and voice attributes.
  speech.text = message;
  speech.volume = 1;
  speech.rate = 1;
  speech.pitch = 1;

  window.speechSynthesis.speak(speech);
}


/*-----------------------------
      Helper Functions 
------------------------------*/

function renderNotes(notes) {
  var html = '';
  if (notes.length) {
    notes.forEach(function (note) {
      html += `<li class="note">
          <p class="header">
            <span class="date">${note.date}</span>
            <a href="#" class="listen-note" title="Listen to Note">Listen to Note</a>
            <a href="#" class="delete-note" title="Delete">Delete</a>
          </p>
          <hr>
          <p class="content">${note.content}</p>
        </li>`;
    });
  }
  else {
    html = '<li><p class="content">You don\'t have any notes yet.</p></li>';
  }
  notesList.html(html);
}


function saveNote(dateTime, content) {
  localStorage.setItem('note-' + dateTime, content);
}


function getAllNotes() {
  var notes = [];
  var key;
  for (var i = 0; i < localStorage.length; i++) {
    key = localStorage.key(i);

    if (key.substring(0, 5) == 'note-') {
      notes.push({
        date: key.replace('note-', ''),
        content: localStorage.getItem(localStorage.key(i))
      });
    }
  }
  return notes;
}


function deleteNote(dateTime) {
  localStorage.removeItem('note-' + dateTime);
}

// Pausing of speech function
$('#pause-btn').on('click', function (e) {
  recognition.stop();
  instructions.text('Voice recognition paused.');
});
// Stopping of speech function
$('#stop-btn').on('click', function (e) {
  recognition.stop();
  instructions.text('Voice recognition stopped.');
});

/*-----------------------------
      Settings 
------------------------------*/
// Darkmode
const darkBtn = document.getElementById('dark-btn');

darkBtn.onclick = () => {
  darkBtn.classList.toggle('btn-on');
  document.body.classList.toggle('dark-theme');

  // Checking to see whether if it is in the light mode or dark mode
  if(localStorage.getItem('theme') == 'light'){
    localStorage.setItem('theme', 'dark');
  }else {
    localStorage.setItem('theme', 'light');
  }
}

// Local Storage Check
if(localStorage.getItem('theme') == 'light'){
  darkBtn.classList.remove('btn-on');
  document.body.classList.remove('dark-theme');
}else if(localStorage.getItem('theme') == 'dark'){
  darkBtn.classList.add('btn-on');
  document.body.classList.add('dark-theme');
}else{
  localStorage.setItem('theme', 'light');
}

// Remove the autosave functionality
const autosaveBtn = document.getElementById('auto-save-btn');
const toggleAutosave = document.querySelector('#textbox');

autosaveBtn.onclick = () => {
  autosaveBtn.classList.toggle('btn-on');
  toggleAutosave.classList.toggle('auto-save');

  if(localStorage.getItem('autosave') == 'on'){
    localStorage.setItem('autosave', 'off')
    // Destroying the auto-save functionality from savy
    $('.auto-save').savy('destroy');

    $('.auto-save').savy('destroy', function () {
      console.log("All data from savy are destroyed");
    })
  }else{
    localStorage.setItem('autosave', 'on')
  }
}

if(localStorage.getItem('autosave') == 'on'){
  autosaveBtn.classList.add('btn-on');
  toggleAutosave.classList.add('auto-save');
}else if(localStorage.getItem('autosave') == 'off'){
  autosaveBtn.classList.remove('btn-on');
  toggleAutosave.classList.remove('auto-save');
}else{
  localStorage.setItem('autosave', 'on');
}
