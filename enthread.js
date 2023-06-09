import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getDatabase,
    ref,
    onChildAdded,
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
        $("#send_message").val("");
        $("#send_button").prop("disabled", true);
        var i = 20;
        var id = setInterval(() => {
            $("#send_button").val(`${--i}sec...`);
            if (i <= 0) {
                $("#send_button").prop("disabled", false);
                $("#send_button").val("SEND");
                clearInterval(id);
            }
        }, 1_000);
    });
}

function setText(i, key) {
    get(ref(database, `texts/${key}`)).then(snapshot => {
        if (snapshot.exists()) {
            var text = snapshot.val();
            var author = text.author.replace(/</g, "&lt;").replace(/</g, "&gt;");
            var message = replaceMessage(text.message);
            var host = replaceToLink(`${text.host}`);
            var time = formatTime(new Date(text.timestamp));
            if (message == "!!l") {
                message = `<input type="button" id="button_x${i}" value="Show...">`;
            }
            $("#texts").prepend(`<div id="x${i}" class="text"><div class="content"><p class="id">${i}: ${author} (${host}, ${time})</p><p class="message", id="message_x${i}">${message}</p></div><hr noshade></div>`);
            $(`#button_x${i}`).on("click", {html_id: i, message_id: key}, openText);
            $("#length").text(`${++i}`);
        }
    }).catch(error => console.error(error));
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
if (searchParams.has("c")) {
    $("head").append(`<link type="text/css" rel="stylesheet" href="css/${searchParams.get("c")}.css">`);
}

if (threadParam !== null) {
    $("body").empty();
    $("body").append(`<h1><p class="title"><a class="top" href="${location.origin}${location.pathname}">Enthread</a></p><p id="thread_name"></p><p id="thread_id"></p></h1><h2><hr noshade><div id="send" class="text"><p class="id"><span id="length">0</span>: <input type="text" id="send_author" placeholder="Your name">(${replaceToLink(location.hostname)}, <span id="time">2038-01-19 03:14:07</span>)</p><div class="areas"><div><textarea id="send_message" placeholder="Your message"></textarea></div></div><div class="buttons flex-box-between"><div class="button"><!-- <input type="file" id="send_file"> --></div><div class="button"><input type="button" id="send_button" value="SEND"></div></div><hr noshade></div><div id="texts"></div><div><a href="https://github.com/entitypengin/enthread">Github</a></div></h2>`);

    get(ref(database, `threads/${threadParam}`)).then(snapshot => {
        const thread = snapshot.val();
        document.title = `${thread.name} - Enthread`;
        $("#thread_name").text(thread.name);
        $("#thread_id").text(threadParam);
    });

    $("#send_button").on("click", () => {
        if ($("#send_message").val() != "") {
            sendText($("#send_author").val(), $("#send_message").val());
        }
    });

    setInterval(() => $("#time").text(formatTime(new Date())), 1_000);

    var textsCount = 0;

    onChildAdded(ref(database, `threads/${threadParam}/texts`), data => setText(textsCount++, data.key));
}
