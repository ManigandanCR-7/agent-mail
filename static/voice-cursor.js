(function () {
    alert("🎙️ Voice Cursor JavaScript loaded!");

    console.log("VOICE CURSOR: JS loaded successfully");

    const box = document.createElement("div");

    box.innerHTML = "🎙️ Voice Cursor is working";

    box.style.position = "fixed";
    box.style.top = "20px";
    box.style.right = "20px";
    box.style.padding = "20px";
    box.style.background = "black";
    box.style.color = "white";
    box.style.fontSize = "18px";
    box.style.zIndex = "999999999";

    document.body.appendChild(box);
})();
