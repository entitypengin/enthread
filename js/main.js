"use strict";

$("#go-button").on("click", () => {
    if ($("#thread-id").val() != "") {
        location = `thread?t=${$("#thread-id").val()}`;
    }
});
