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
$("body").append(`<h1>
    <p class="title">
        <a class="top" href="./">EnthreadBeta</a>
    </p>
</h1>
<h2>
    <div id="send">
        <textarea id="send_author"></textarea>
        <textarea id="send_message"></textarea>
        <button id="send_button">SEND</button>
        <hr>
    </div>
    <div id="texts"></div>
</h2>
<h2>
    <a href="https://github.com/entitypengin/enthread">Github</a>
</h2>`);

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
    for (var id in texts) {
        text = texts[id].message.replace("<", "&lt;").replace(">", "&gt;").replace(new RegExp("^([a-zA-Z]+:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$", "i"), (str) => {
            return `<a href="${str}">${str}</a>`;
        }).replace(/#\d*/, (str) => {
            return `<a href="./?x=${str.slice(1)}">${str}</a>`;
        });
        time = new Date(texts[id].timestamp).toISOString();
        $("#texts").prepend(`<div id="x${i}" class="text">
    <div class="content">
        <p class="id">${i}: ${texts[id].author} (${time})</p>
        <p class="message">${text}</p>
    </div>
    <hr>
</div>`);
        i++;
    }
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
