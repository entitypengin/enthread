"use strict";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    child,
    get,
    getDatabase,
    onChildAdded,
    push,
    ref,
    update
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

/**
 * @typedef ThreadObject
 * @property {string} name
 * @property {string} anonymous
 * @property {number} cooldown
 * @property {string[]} texts
 */

/**
 * @typedef TextObject
 * @property {string} author
 * @property {string} message
 * @property {string} host
 * @property {number} timestamp
 * @property {string[]} files
 */

/**
 * @typedef ProxyLinkObject
 * @property {string} link
 * @property {ProxyStatusObject} status
 * @property {string} description
 */

/**
 * @typedef ProxyStatusObject
 * @property {boolean} blocked
 * @property {boolean} working
 */

export class ThreadIDError extends Error {}

/**
 * 
 * @param {string} id
 * @returns {Promise<ThreadObject>}
 */
export async function getThread(id) {
    const snapshot = await get(ref(database, `threads/${id}`));
    if (!snapshot.exists()) {
        throw new ThreadIDError("invaild thread id");
    }
    return snapshot.val();
}

/**
 * 
 * @param {string} id
 * @param {(key: string) => *} call
 * @returns {void}
 */
export function onTextAdded(id, call) {
    onChildAdded(ref(database, `threads/${id}/texts`), data => {
        call(data.key);
    });
}

/**
 * 
 * @param {string} key
 * @returns {Promise<TextObject>}
 */
export async function getText(key) {
    const [objectSettledResult, filesSettledResult] = await Promise.all([get(child(textsRef, key)), get(child(imagesRef, key))]);
    const object = objectSettledResult.val()

    return {
        author: object.author,
        message: object.message,
        host: object.host,
        timestamp: object.timestamp,
        files: filesSettledResult.exists() ? [filesSettledResult.val()] : []
    };
}

/**
 * 
 * @param {string} id
 * @param {TextObject} object
 */
export async function sendText(id, {author, message, host, timestamp, files}) {
    const textKey = push(ref(database, `threads/${id}`)).key;

    const updates = {};

    updates[`/texts/${textKey}`] = {
        author: author,
        message: message,
        host: host,
        timestamp: timestamp
    };

    updates[`/threads/${id}/texts/${textKey}`] = "";

    if (files.length) {
        updates[`/images/${textKey}`] = files[0];
    }

    await update(ref(database), updates);
}

const app = initializeApp({
    databaseURL: "https://enthread-firebase-default-rtdb.firebaseio.com/"
});
const database = getDatabase(app);
const textsRef = ref(database, "texts");
const imagesRef = ref(database, "images");
