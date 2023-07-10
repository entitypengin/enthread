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
    databaseURL: "https://enthread-firebase-default-rtdb.firebaseio.com/",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const textsRef = ref(database, "texts");

let threadParam = "-NX3EmKRGsjpwD-V_U5W";
let textParam = "";
const searchParams = new URLSearchParams(location.search);
if (searchParams.has("t")) {
    threadParam = searchParams.get("t");
}
if (searchParams.has("x")) {
    textParam = searchParams.get("x");
}
const threadRef = ref(database, `threads/${threadParam}/texts`);

function formatTime(date) {
    return `${("0000" + date.getUTCFullYear()).slice(-4)}-${("00" + date.getUTCMonth()).slice(-2)}-${("00" + date.getUTCDate()).slice(-2)} ${("00" + date.getUTCHours()).slice(-2)}:${("00" + date.getUTCMinutes()).slice(-2)}:${("00" + date.getUTCSeconds()).slice(-2)}`;
}

function replaceToLink(str) {
    return str.replace(/([a-zA-Z]+:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?/ig, str => `<a href="https://${str}">${str}</a>`);
}

function sendText(author, message) {
    const newTextRef = push(textsRef);
    if (message.length < 200) {
        set(newTextRef, {
            author: author,
            message: message,
            host: location.hostname,
            timestamp: Date.now()
        });
    } else {
        const longRef = ref(database, `long/${newTextRef.key}`);
        set(newTextRef, {
            author: author,
            message: "!!l",
            host: location.hostname,
            timestamp: Date.now()
        });
        set(longRef, message);
    }
}

function setTexts(ids) {
    $("#texts").empty();
    var i = Object.keys(ids).length;
    $("#length").text(`${i}`);
    var text;
    var author;
    var message;
    var host;
    var time;
    for (var id in ids) {
        get(ref(database, `texts/${id}`)).then(snapshot => {
            i--;
            if (snapshot.exists()) {
                text = snapshot.val();
                author = text.author.replace(/</g, "&lt;").replace(/</g, "&gt;");
                message = replaceMessage(text.message);
                host = replaceToLink(`${text.host}`);
                time = formatTime(new Date(text.timestamp));
                if (message == "!!l") {
                    message = `<input type="button" id="button_x${i}" value="Show...">`;
                }
                $("#texts").prepend(`<div id="x${i}" class="text"><div class="content"><p class="id">${i}: ${author} (${host}, ${time})</p><p class="message", id="message_x${i}">${message}</p></div><hr noshade></div>`);
                $(`#button_x${i}`).on("click", {html_id: i, message_id: id}, openText);
            }
        }).catch(error => console.error(error));
    }
}

function replaceMessage(message) {
    return message.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>").replace(/([a-zA-Z]+:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?/ig, str => `<a href="${str}">${str}</a>`).replace(/#\d+/g, str => `<a href="?x=${str.slice(1)}">${str}</a>`);
}

function openText(e) {
    const longRef = ref(database, `long/${e.data.message_id}`);
    get(longRef).then(snapshot => {
        if (snapshot.exists()) {
            $(`#message_x${e.data.html_id}`).html(`<input type="button" id="button_x${e.data.html_id}" value="Hide..."><br>${replaceMessage(snapshot.val())}`);
            $(`#button_x${e.data.html_id}`).on("click", e.data, closeText);
        }
    }).catch(error => console.error(error));
}

function closeText(e) {
    $(`#message_x${e.data.html_id}`).html(`<input type="button" id="button_x${e.data.html_id}" value="Show...">`);
    $(`#button_x${e.data.html_id}`).on("click", e.data, openText);
}

document.title = "Enthread-Beta";
$("body").empty();
$("body").append(`<h1><p class="title"><a class="top" href="${location.pathname}">EnthreadBeta</a></p></h1><h2><hr noshade><div id="send" class="text"><p class="id"><span id="length">0</span>: <input type="text" id="send_author" placeholder="Your name">(${replaceToLink(location.hostname)}, <span id="time">2038-01-19 03:14:07</span>)</p><div class="areas"><div><textarea id="send_message" placeholder="Your message"></textarea></div></div><div class="buttons flex-box-between"><div class="button"><input type="file" id="send_file"></div><div class="button"><input type="button" id="send_button" value="SEND"></div></div><hr noshade></div><div id="texts"></div><div><a href="https://github.com/entitypengin/enthread">Github</a></div></h2>`);

$("#send_button").on("click", () => sendText($("#send_author").val(), $("#send_message").val()));

setInterval(() => $("#time").text(formatTime(new Date())), 1000);

get(threadRef).then(snapshot => {
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
}).catch(error => console.error(error));

onValue(threadRef, snapshot => setTexts(snapshot.val()));
