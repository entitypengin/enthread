"use strict";

import {
    escapeToHTML,
    formatTime
} from "./functions.js";

export class BaseText {
    #id;
    #element;
    #elementAuthor;
    #elementMessage;
    #elementRawMessage;
    #elementFiles;
    #elementHost;
    #elementTime;

    author;
    message;
    files;
    host;
    timestamp;

    buttons;

    constructor(id) {
        this.#id = id;
        this.#element = $(`#${this.id}`);

        this.element.addClass("text");

        this.element.append("<div class='content'></div>");

        this.child("content").append("<p class='id'></p>");
        this.child("id").append(`<span class="author"></span>`);

        this.child("content").append("<p class='message-box'></p>");
        this.child("message-box").append("<span class='message'></span>");

        this.child("content").append("<p class='raw-message-box'></p>");
        this.child("raw-message-box").append("<span class='raw-message'></span>");

        this.child("content").append("<p class='image-box'></p>");

        this.child("content").append("<p class='info'></p>");
        this.child("info").append("<span class='host'></span><br><span class='time'></span>");

        this.element.append("<div class='buttons'></div>");
        this.child("buttons").append("<div class='left-buttons'></div>");
        this.child("buttons").append("<div class='right-buttons'></div>");

        this.buttons = {};
    }

    get id() {
        return this.#id;
    }

    get element() {
        return this.#element;
    }

    get time() {
        return formatTime(new Date(this.timestamp));
    }

    get data() {
        return {
            author: this.author,
            message: this.message,
            host: this.host,
            timestamp: this.timestamp,
            files: this.files
        };
    }

    set data({author = "", message = "", host = null, timestamp = 0, files = null}) {
        this.author = author;
        this.message = message;
        this.host = host ?? location.hostname;
        this.timestamp = timestamp;
        this.files = files ?? [];
    }

    init(data) {
        this.data = data
    }

    child(cls) {
        return this.element.find(`.${cls}`);
    }

    get elementAuthor() {
        return this.#elementAuthor;
    }

    set elementAuthor(value) {
        this.#elementAuthor = value;
        this.child("author").text(value ?? this.author);
    }

    get elementMessage() {
        return this.#elementMessage;
    }

    set elementMessage(value) {
        this.#elementMessage = value;
        this.child("message").html(replaceStyle(replaceAnchor(replaceLink(escapeToHTML(value ?? this.message)))));
    }

    get elementRawMessage() {
        return this.#elementRawMessage;
    }

    set elementRawMessage(value) {
        this.#elementRawMessage = value;
        this.child("raw-message").text(value ?? this.message);
    }

    get elementHost() {
        return this.#elementHost;
    }

    set elementHost(value) {
        this.#elementHost = value;
        this.child("host").html(replaceLink(value ?? this.host));
    }

    get elementTime() {
        return this.#elementTime;
    }

    set elementTime(value) {
        this.#elementTime = value;
        this.child("time").text(value ?? this.time);
    }

    get elementFiles() {
        return this.#elementFiles;
    }

    set elementFiles(values) {
        this.#elementFiles = values
        this.child("image-box").empty();
        for (const base64 of values ?? this.files) {
            this.child("image-box").append(`<img class="text-img" src="${base64}">`);
        }
    }

    newButton(cls, isLeft, value = "", event = null) {
        this.child(isLeft ? "left-buttons" : "right-buttons").append(`<input type="button" class="button ${cls}-button">`);
        const button = new Button(this, cls);
        this.buttons[cls] = button;
        button.value = value;
        button.event = event;
        return button;
    }
}

export class Button {
    master;

    #isdisabled;
    #element;
    #event;

    cls;

    constructor(master, cls) {
        this.master = master;
        this.cls = cls;

        this.#element = this.master.child(`${this.cls}-button`);
    }

    get element() {
        return this.#element;
    }

    get value() {
        return this.element.val();
    }

    set value(value) {
        this.element.val(value);
    }

    get event() {
        return this.#event;
    }

    set event(value) {
        this.#event = value;
        this.element.off(".event");
        if (value !== null) {
            this.element.on("click.event", value);
        }
    }

    get isdisabled() {
        return this.#isdisabled;
    }

    set isdisabled(value) {
        this.#isdisabled = value;
        this.element.prop("disabled", value);
    }
}

function replaceLink(message) {
    return message.replace(/(https?:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&\/=]*/g, str => /^https?:\/\//.test(str) ? `<a href="${str}">${str}</a>` : `<a href="https://${str}">${str}</a>`);
}

function replaceAnchor(message) {
    return message.replace(/#(\d+)/g, "<a href='#x$1' class='text-id'>$&</a>");
}

function replaceStyle(message) {
    return message.replace(/!([^!]+?){(.+?)}/g, "<span style='$1'>$2</span>");
}
