import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
    onValue,
    push
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
    databaseURL: "https://enthread-firebase-default-rtdb.firebaseio.com",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let threadparam = "";
let textparam = "";
const searchParams = new URLSearchParams(window.location.search)
if (searchParams.has("t")) {
    threadparam = searchParams.get("t");
    console.log(threadparam);
}
if (searchParams.has("x")) {
    textparam = searchParams.get("x");
    console.log(textparam);
}

$("head").append('<title>Enthread-Beta</title>')
$("body").empty()
$("body").append('<h1><p class="title"><a class="top" href="./">EnthreadBeta</a></p></h1><h2><div id="send"><textarea id="send_author"></textarea><textarea id="send_message"></textarea><button id="send_button">SEND</button><hr></div><div id="texts"></div></h2>')

$("#send_button").on("click", function () {
    const author = document.getElementById("send_author").value;
    const message = document.getElementById("send_message").value;
    const newTextRef = push(ref(database, "texts"))
    set(newTextRef, {
        author: author,
        message: message,
        timestamp: Date.now()
    });
});

$(document).ready(function () {
    const dbRef = ref(database, "texts");
    onValue(dbRef, (snapshot) => {
        $("#texts").empty();
        let i = 0;
        const texts = snapshot.val();
        let text = "";
        let time = "";
        for (const id in texts) {
            text = texts[id].message.replace("<", "&lt;").replace(">", "&gt;");
            time = new Date(texts[id].timestamp).toISOString();
            $("#texts").prepend(`<div id="x${i}" class="text"><div class="content"><p class="id">${i}: ${texts[id].author} (${time})</p><p class="message">${text}</p></div><hr></div>`);
            i++;
        }
    });
});