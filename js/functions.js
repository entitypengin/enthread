"use strict";

export function escapeToHTML(messageData) {
    return messageData.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/\n/g, "<br>");
}

export function formatTime(date) {
    return `${("0000" + date.getUTCFullYear()).slice(-4)}-${("00" + (date.getUTCMonth() + 1)).slice(-2)}-${("00" + date.getUTCDate()).slice(-2)} ${("00" + date.getUTCHours()).slice(-2)}:${("00" + date.getUTCMinutes()).slice(-2)}:${("00" + date.getUTCSeconds()).slice(-2)}`;
}

export function replaceLink(message) {
    return message.replace(/(https?:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&\/=]*/g, str => /^https?:\/\//.test(str) ? `<a href="${str}">${str}</a>` : `<a href="https://${str}">${str}</a>`);
}

export function replaceStyle(message) {
    return message.replace(/!([^!]+?){(.+?)}/g, "<span style='$1'>$2</span>");
}
