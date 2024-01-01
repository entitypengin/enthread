"use strict";

import {
    replaceLink
} from "./functions.js";
import {
    getProxyLinks
} from "./db.js";

export class Link {
    #id;
    #element;

    #link;
    #blocked;
    #working;
    #description;

    constructor(id) {
        this.#id = id;
        this.#element = $(`#${this.id}`);

        this.element.addClass("text");

        this.element.append("<div class='content'></div>");

        this.child("content").append("<span class='link'></span>");
    }

    get id() {
        return this.#id;
    }

    get element() {
        return this.#element;
    }

    get link() {
        return this.#link;
    }

    set link(value) {
        this.#link = value;
        this.child("link").html(replaceLink(value));
    }

    get blocked() {
        return this.#blocked;
    }

    set blocked(value) {
        this.#blocked = value;
    }

    get working() {
        return this.#working;
    }

    set working(value) {
        this.#working = value;
    }

    get description() {
        return this.#description;
    }

    set description(value) {
        this.#description = value;
    }

    get data() {
        return {
            link: this.link,
            blocked: this.blocked,
            working: this.working,
            description: this.description
        };
    }

    set data({link = "", blocked = false, working = true, description = ""}) {
        this.link = link;
        this.blocked = blocked;
        this.working = working;
        this.description = description;
    }

    init(data) {
        this.data = data
    }

    child(cls) {
        return this.element.find(`.${cls}`);
    }
}

var linkObjects = await getProxyLinks();

for (const linkObject of linkObjects) {
    new Link().init({link: linkObject.link, blocked: linkObject.status.blocked, working: linkObject.status.working, description: linkObject.description});
}
