import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getDatabase,
    ref,
    child,
    onValue,
    get,
    push,
    update
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

function formatTime(date) {
    return `${("0000" + date.getUTCFullYear()).slice(-4)}-${("00" + (date.getUTCMonth() + 1)).slice(-2)}-${("00" + date.getUTCDate()).slice(-2)} ${("00" + date.getUTCHours()).slice(-2)}:${("00" + date.getUTCMinutes()).slice(-2)}:${("00" + date.getUTCSeconds()).slice(-2)}`;
}

function replaceToLink(str) {
    return str.replace(/([a-zA-Z]+:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?/ig, str => `<a href="https://${str}">${str}</a>`);
}

function sendText(author, message) {
    const newTextKey = push(textsRef).key;

    const updates = {};

    if (message.length >= 200) {
        updates[`/long/${newTextKey}`] = message;
        message = "!!l";
    }

    updates[`/texts/${newTextKey}`] = {
        author: author,
        message: message,
        host: location.hostname,
        timestamp: Date.now()
    };

    updates[`/threads/${threadParam}/texts/${newTextKey}`] = "";
    update(ref(database), updates).then(() => {
        console.log("success!");
    }).catch(() => {
        console.log("failed...");
    });
}

function setTexts(ids) {
    $("#texts").empty();
    var keys = Object.keys(ids);
    var i = keys.length;
    $("#length").text(`${i}`);
    var text;
    var author;
    var message;
    var host;
    var time;
    for (var id of [...keys].reverse()) {
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
                $("#texts").append(`<div id="x${i}" class="text"><div class="content"><p class="id">${i}: ${author} (${host}, ${time})</p><p class="message", id="message_x${i}">${message}</p></div><hr noshade></div>`);
                $(`#button_x${i}`).on("click", {html_id: i, message_id: keys[i]}, openText);
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

const firebaseConfig = {
    databaseURL: "https://enthread-firebase-default-rtdb.firebaseio.com/",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const textsRef = ref(database, "texts");

let threadParam = null;
const searchParams = new URLSearchParams(location.search);
if (searchParams.has("t")) {
    threadParam = searchParams.get("t");
}

if (threadParam !== null) {
    const threadRef = ref(database, `threads/${threadParam}`);
    const threadtextsRef = child(threadRef, "texts");

    $("body").empty();
    $("body").append(`<h1><p class="title"><a class="top" href="${location.origin}${location.pathname}">Enthread</a></p><p id="thread_name"></p></h1><h2><hr noshade><div id="send" class="text"><p class="id"><span id="length">0</span>: <input type="text" id="send_author" placeholder="Your name">(${replaceToLink(location.hostname)}, <span id="time">2038-01-19 03:14:07</span>)</p><div class="areas"><div><textarea id="send_message" placeholder="Your message"></textarea></div></div><div class="buttons flex-box-between"><div class="button"><input type="file" id="send_file"></div><div class="button"><input type="button" id="send_button" value="SEND"></div></div><hr noshade></div><div id="texts"></div><div><a href="https://github.com/entitypengin/enthread">Github</a></div></h2>`);
    get(child(threadRef, "name")).then(snapshot => {
        const threadName = snapshot.val();
        document.title = `${threadName} - Enthread`;
        $("#thread_name").text(threadName);
    });

    $("#send_button").on("click", () => sendText($("#send_author").val(), $("#send_message").val()));

    setInterval(() => $("#time").text(formatTime(new Date())), 1000);

    onValue(threadtextsRef, snapshot => setTexts(snapshot.val()));    
}
