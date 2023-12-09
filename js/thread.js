"use strict";

import {
    BaseText
} from "./text.js";
import {
    ThreadIDError,
    getThread,
    onTextAdded,
    getText,
    sendText
} from "./db.js";

const textsData = {
    "buttons": {
        "preview": {
            "default": "SEND",
            "loading": "LOADING...",
            "countDown": "{0}S...",
            "files": "PHOTO"    
        },
        "text": {
            "reply": "REPLY",
            "show": "SHOW",
            "hide": "HIDE"
        }
    },
    "placeholders": {
        "message": "What Happened?"
    }
};

class IndexedText extends BaseText {
    #elementIndex;

    constructor(id) {
        super(id);

        this.child("id").prepend("<a class='text-id text-id-index'></a>: ");
        this.child("text-id-index").attr("href", `#${this.id}`);
    }

    get elementIndex() {
        return this.#elementIndex;
    }

    set elementIndex(value) {
        this.#elementIndex = value;
        this.child("text-id-index").text(value);
    }
}

class PreviewText extends IndexedText {
    buttonsTextData = textsData.buttons.preview;

    constructor(id) {
        super(id);

        this.child("id").append("<input type='text' class='input-area input-author'>");
        this.child("raw-message-box").append("<textarea class='input-area input-message'></textarea>");
        this.child("input-message").attr("placeholder", textsData.placeholders.message);
        this.child("buttons").append("<input type='file' value='' class='button files-input' accept='image/*' >"); /* multiple: true */
    }

    get sendable() {
        return !!(this.message || this.files.length);
    }

    init(anonymous) {
        super.init({});

        this.elementHost = null;
        this.child("input-author").attr("placeholder", anonymous);
        this.newButton("files", true, this.buttonsTextData.files, () => this.child("files-input").trigger("click"));
        this.newButton("send", false, this.buttonsTextData.default, () => this.send());
        this.child("files-input").on("change", async () => {
            this.buttons["send"].isdisabled = true;
            this.buttons["send"].value = this.buttonsTextData.loading;

            this.clearFiles();
            const promises = [];
            for (const file of this.child("files-input")[0].files) {
                const reader = new FileReader();
                promises.push(new Promise((resolve, reject) => {
                    reader.onload = e => {
                        this.files.push(e.currentTarget.result);
                        this.elementFiles = null;
                        resolve();
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                }));
            }
            await Promise.allSettled(promises);

            this.buttons["send"].isdisabled = false;
            this.buttons["send"].value = this.buttonsTextData.default;
        });

        setInterval(() => this.update(), 250);
    }

    update() {
        this.author = this.child("input-author").val();
        this.message = this.child("input-message").val();
        this.elementMessage = null;
        this.timestamp = Date.now();
        this.elementTime = null;
    }

    get elementIndex() {
        return super.elementIndex;
    }

    set elementIndex(value) {
        super.elementIndex = value ?? `#${texts.length}`;
    }

    async send() {
        if (!this.sendable) {
            return;
        }
        this.buttons["send"].isdisabled = true;
        var countDown = cooldown;
        const intervalId = setInterval(() => {
            this.buttons["send"].value = this.buttonsTextData.countDown.replace("{0}", --countDown);
            if (countDown <= 0) {
                this.buttons["send"].isdisabled = false;
                this.buttons["send"].value = this.buttonsTextData.default;
                clearInterval(intervalId);
            }
        }, 1_000);
        this.update();

        await sendText(threadId, this.data);

        this.child("input-message").val("");
        this.clearFiles();
    }

    clearFiles() {
        this.files.splice(0);
        this.elementFiles = null;
    }

    reply(index) {
        const value = this.child("input-message").val();
        if (value.length) {
            this.child("input-message").val(`${value} #${index} `);
        } else {
            this.child("input-message").val(`#${index} `);
        }
        this.child("input-message").focus();
        const len = this.child("input-message").val().length;
        this.child("input-message")[0].setSelectionRange(len, len);
    }
}

class Text extends IndexedText {
    buttonsTextData = textsData.buttons.text;

    index;
    hiding;

    constructor(index) {
        super(`x${index}`);

        this.index = index;

        this.elementIndex = null;
    }

    get isLong() {
        return this.message.length >= 200;
    }

    get hasFiles() {
        return this.files.length != 0;
    }

    init(data) {
        super.init(data);
        this.hiding = false;

        this.elementAuthor = null;
        this.elementHost = null;
        this.elementTime = null;

        this.newButton("reply", false, this.buttonsTextData.reply, () => previewText.reply(this.index));

        if (this.isLong || this.hasFiles) {
            this.newButton("show", true, "", () => this.toggleHiding());
            this.toggleHiding();
        }
        if (!this.isLong) {
            this.elementMessage = null;
            this.elementRawMessage = null;
        }
    }

    toggleHiding() {
        this.hiding = !this.hiding;

        if (this.hiding) {
            this.buttons["show"].value = this.buttonsTextData.show;
            if (this.isLong) {
                this.elementMessage = "";
                this.elementRawMessage = "";
            }
            if (this.hasFiles) {
                this.elementFiles = [];
            }
        } else {
            this.buttons["show"].value = this.buttonsTextData.hide;
            if (this.isLong) {
                this.elementMessage = null;
                this.elementRawMessage = null;
            }
            if (this.hasFiles) {
                this.elementFiles = null;
            }
        }
    }

    get elementIndex() {
        return super.elementIndex;
    }

    set elementIndex(value) {
        super.elementIndex = value ?? `#${this.index}`;
    }
}

/**
 * 
 * @returns {Text}
 */
function newText() {
    const index = texts.length;
    $("#texts").prepend(`<div id="x${index}"></div>`);

    const text = new Text(index);
    texts.push(text);

    return text;
}

/**
 * 
 * @param {string} key
 * @returns {Promise<Text>}
 */
async function setText(key) {
    const data = await getText(key);

    data.author ||= anonymous;

    const text = newText();

    text.init(data);

    previewText.elementIndex = null;

    return text;
}

const searchParams = new URLSearchParams(location.search);

const skin = searchParams.get("c");
if (skin !== null) {
    $("#skin").attr("href", `css/${skin}.css`);
}

const threadId = searchParams.get("t");

/** 
 * @type {Text[]}
 */
const texts = [];

const previewText = new PreviewText("send");

try {
    var { name, anonymous, cooldown, texts: textKeys } = await getThread(threadId);
} catch (e) {
    if (e instanceof ThreadIDError) {
        location = ".";
    } else {
        throw e;
    }
}

previewText.init(anonymous);

document.title = `${name} - Enthread`;
$("#thread-name").text(name);

const promises = [];
for (const key in textKeys) {
    promises.push(setText(key));
}
await Promise.allSettled(promises);

const length = Object.keys(textKeys).length;
var count = 0;
onTextAdded(threadId, key => {
    if (length <= count++) {
        setText(key);
    }
});
