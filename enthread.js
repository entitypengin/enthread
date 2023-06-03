import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"
import { getDatabase, ref, set, onValue, push } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js"

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

$("#send_button").on("click", function() {
    const author = document.getElementById("send_author").value;
    const message = document.getElementById("send_message").value;
    const newTextRef = push(ref(database, "texts"))
    set(newTextRef, {
        author: author,
        message: message,
        timestamp: Date.now()
    });
});

$(document).ready(function() {
    const dbRef = ref(database, "texts");

    onValue(dbRef, (snapshot) => {
        let i = 0;
        $("#texts").empty();
        const texts = snapshot.val();
        let text = "";
        for (const id in texts) {
            text = texts[id].message.replace("<", "&lt;").replace(">", "&gt;");
            $("#texts").prepend(`<div id="x${i}" class="text"><div class="content"><p class="id">${i}: ${texts[id].author}</p><p class="message">${text}</p></div><hr></div>`);
            i++;
        }
    });
});
