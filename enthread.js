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
$("body").append(`<h1><p class="title"><a class="top" href="${location.pathname}">EnthreadBeta</a></p></h1><h2><hr><div id="send" class="text"><p class="id"><span id="length">0</span>: <input type="text" id="send_author" placeholder="Your name">(${location.hostname}, <span id="time">2038-01-19 03:14:07</span>)</p><p class="message"><textarea id="send_message" placeholder="Your message"></textarea></p><p id="button"><input type="button" id="send_button" value="SEND"></p><hr></div><div id="texts"></div><div><a href="https://github.com/entitypengin/enthread">Github</a></div></h2>`);

$("#send_button").on("click", function () {
    const newTextRef = push(textsRef)
    set(newTextRef, {
        author: document.getElementById("send_author").value,
        message: document.getElementById("send_message").value,
        host: location.hostname,
        timestamp: Date.now()
    });
});

function timeFormat(date) {
    return `${("0000" + date.getUTCFullYear()).slice(-4)}-${("00" + date.getUTCMonth()).slice(-2)}-${("00" + date.getUTCDate()).slice(-2)} ${("00" + date.getUTCHours()).slice(-2)}:${("00" + date.getUTCMinutes()).slice(-2)}:${("00" + date.getUTCSeconds()).slice(-2)}`;
}

setInterval(() => {
    $("#time").text(timeFormat(Date.now()));
}, 1);

function setTexts(texts) {
    $("#texts").empty();
    var i = 0;
    var author = "";
    var message = "";
    var host = "";
    var time = "";
    for (var id in texts) {
        author = texts[id].author.replace(/</g, "&lt;").replace(/</g, "&gt;");
        message = texts[id].message.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>").replace(/([a-zA-Z]+:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?/ig, (str) => {
            return `<a href="${str}">${str}</a>`;
        }).replace(/#\d+/g, (str) => {
            return `<a href="?x=${str.slice(1)}">${str}</a>`;
        });
        host = `${texts[id].host}`.replace(/([a-zA-Z]+:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?/ig, (str) => {
            return `<a href="https://${str}">${str}</a>`;
        });
        time = timeFormat(new Date(texts[id].timestamp));
        $("#texts").prepend(`<div id="x${i}" class="text"><div class="content"><p class="id">${i}: ${author} (${host}, ${time})</p><p class="message">${message}</p></div><hr></div>`);
        i++;
    }
    $("#length").text(`${i}`);
}

get(textsRef).then((snapshot) => {
    if (snapshot.exists()) {
        setTexts(snapshot.val());
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
}).catch((error) => {
    console.error(error);
});

onValue(textsRef, (snapshot) => {
    setTexts(snapshot.val());
});
