var backgroundToggled = true;
document.querySelector("#bgtoggle").addEventListener("click", function() {
    if (backgroundToggled) {
        document.querySelector("#bg").remove();
        document.querySelector("#bg2").remove();
    } else {
        var bg1 = document.createElement("div");
        var bg2 = document.createElement("div");

        bg1.id = "bg";
        bg2.id = "bg2";

        document.body.appendChild(bg1);
        document.body.appendChild(bg2);
    }

    backgroundToggled = !backgroundToggled;
});