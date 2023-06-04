import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
    onValue,
    get,
    push
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
    databaseURL: "https://enthread-firebase-default-rtdb.firebaseio.com",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const textsRef = ref(database, "texts");

let threadParam = "";
let textParam = "";
const searchParams = new URLSearchParams(location.search);
if (searchParams.has("t")) {
    threadParam = searchParams.get("t");
}
if (searchParams.has("x")) {
    textParam = searchParams.get("x");
}

document.title = "Enthread-Beta";
$("body").empty();
$("body").append('<h1><p class="title"><a class="top" href="./">EnthreadBeta</a></p></h1><h2><div id="send"><textarea id="send_author"></textarea><textarea id="send_message"></textarea><button id="send_button">SEND</button><hr></div><div id="texts"></div></h2>');

$("#send_button").on("click", function () {
    const author = document.getElementById("send_author").value;
    const message = document.getElementById("send_message").value;
    const newTextRef = push(textsRef)
    set(newTextRef, {
        author: author,
        message: message,
        timestamp: Date.now()
    });
});

function setTexts(texts) {
    $("#texts").empty();
    var i = 0;
    var text = "";
    var time = "";
    for (const id in texts) {
        text = texts[id].message.replace("<", "&lt;").replace(">", "&gt;");
        time = new Date(texts[id].timestamp).toISOString();
        $("#texts").prepend(`<div id="x${i}" class="text"><div class="content"><p class="id">${i}: ${texts[id].author} (${time})</p><p class="message">${text}</p></div><hr></div>`);
        i++;
    }
}

function updateTexts() {
    console.log(`text_ids: ${text_ids}`)
    var val = get(textsRef).val().texts;
    var texts = []
    for (var text_id in text_ids) {
        texts.push(val[text_id]);
    }
    setTexts(texts);
    try {
        if (textParam != "") {
            var animeSpeed = 500;
            var target = $(`#x${textParam}`);
            var position;
            position = target.offset().top;
            $("body,html").stop().animate({
                scrollTop: position
            }, animeSpeed);
        }
    } catch (error) {
        console.error(error);
    }
}

if (threadParam == "") {
    var snapshot = get(ref(database, "main_thread"));
    if (snapshot.exists()) {
        threadParam = snapshot.val();
    }
}
console.log(`threadParam: ${threadParam}`);

const threadRef = ref(database, `threads/${threadParam}`);

let text_ids = [];
var snapshot = get(threadRef)
if (snapshot.exists()) {
    text_ids = snapshot.val().texts;
}
updateTexts();

onValue(threadRef, (snapshot) => {
    text_ids = snapshot.val().texts;
    updateTexts();
});
