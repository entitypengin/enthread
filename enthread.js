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
    console.log(threadParam);
}
if (searchParams.has("x")) {
    textParam = searchParams.get("x");
    console.log(textParam);
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
    let i = 0;
    let text = "";
    let time = "";
    for (const id in texts) {
        text = texts[id].message.replace("<", "&lt;").replace(">", "&gt;");
        time = new Date(texts[id].timestamp).toISOString();
        $("#texts").prepend(`<div id="x${i}" class="text"><div class="content"><p class="id">${i}: ${texts[id].author} (${time})</p><p class="message">${text}</p></div><hr></div>`);
        i++;
    }
}

get(textsRef).then((snapshot) => {
    if (snapshot.exists()) {
        setTexts(snapshot.val());
    } else {
        console.log("No data available");
    }
}).catch((error) => {
    console.error(error);
});

if (textParam != "") {
    location.hash = `x${textParam}`
}

onValue(textsRef, (snapshot) => {
    setTexts(snapshot.val());
});
