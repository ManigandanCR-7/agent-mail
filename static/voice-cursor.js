(function () {

    // Prevent loading twice
    if (window.voiceCursorLoaded) {
        console.log("Voice Cursor already loaded.");
        return;
    }

    window.voiceCursorLoaded = true;

    // ==========================================
    // CREATE UI
    // ==========================================

    const box = document.createElement("div");

    box.id = "voice-cursor-ui";

    box.innerHTML = `
        <div id="vc-title">🎙️ Voice Cursor</div>
        <div id="vc-status">Normal Cursor</div>
        <div id="vc-output">Press C to activate</div>
        <div id="vc-hint">
            C = Mic Mode | Click textbox = Speak
        </div>
    `;

    document.body.appendChild(box);


    // ==========================================
    // CSS
    // ==========================================

    const style = document.createElement("style");

    style.textContent = `
        #voice-cursor-ui {
            position: fixed;
            top: 20px;
            right: 20px;

            width: 300px;

            padding: 16px;

            background: rgba(20,20,20,0.95);
            color: white;

            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 14px;

            font-family: Arial, sans-serif;

            z-index: 2147483647;

            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }

        #vc-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
        }

        #vc-status {
            font-size: 14px;
            color: #00ff99;
            margin-bottom: 8px;
        }

        #vc-output {
            min-height: 35px;

            padding: 8px;

            background: rgba(255,255,255,0.08);

            border-radius: 8px;

            font-size: 14px;
        }

        #vc-hint {
            margin-top: 10px;

            font-size: 11px;

            color: #aaa;
        }

        body.vc-mic-mode {
            cursor: crosshair !important;
        }

        body.vc-mic-mode * {
            cursor: crosshair !important;
        }
    `;

    document.head.appendChild(style);


    // ==========================================
    // ELEMENTS
    // ==========================================

    const status = document.getElementById("vc-status");
    const output = document.getElementById("vc-output");


    // ==========================================
    // SPEECH RECOGNITION
    // ==========================================

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        status.textContent = "Speech Recognition not supported";
        output.textContent =
            "Please use Chrome or Edge.";

        return;
    }


    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";


    // ==========================================
    // MIC MODE
    // ==========================================

    let micMode = false;
    let isListening = false;


    function activateMicMode() {

        micMode = !micMode;

        if (micMode) {

            document.body.classList.add("vc-mic-mode");

            status.textContent = "🎙️ Mic Mode ON";

            output.textContent =
                "Click inside a textbox and speak.";

        } else {

            document.body.classList.remove("vc-mic-mode");

            status.textContent =
                "Normal Cursor";

            output.textContent =
                "Mic Mode OFF";
        }
    }


    // ==========================================
    // C KEY
    // ==========================================

    document.addEventListener("keydown", function (event) {

        // Ignore if typing inside an input
        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA" ||
            event.target.isContentEditable
        ) {
            return;
        }

        if (event.key.toLowerCase() === "c") {

            activateMicMode();

        }

    });


    // ==========================================
    // CLICK TEXTBOX
    // ==========================================

    document.addEventListener("click", function (event) {

        if (!micMode) return;

        // Don't activate when clicking our own UI
        if (box.contains(event.target)) {
            return;
        }


        const target = event.target;


        // Check whether clicked element can receive text
        const isInput =
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable;


        if (!isInput) {

            output.textContent =
                "Please click inside a textbox.";

            return;
        }


        // Save active textbox
        window.voiceCursorTarget = target;


        output.textContent =
            "🎤 Listening...";

        status.textContent =
            "Listening";


        startRecognition();

    });


    // ==========================================
    // START SPEECH RECOGNITION
    // ==========================================

    function startRecognition() {

        if (isListening) return;

        try {

            recognition.start();

            isListening = true;

        } catch (error) {

            console.log(error);

        }

    }


    // ==========================================
    // SPEECH RESULT
    // ==========================================

    recognition.onresult = function (event) {

        const text =
            event.results[0][0].transcript;

        output.textContent =
            text;

        status.textContent =
            "Text recognized";

        insertText(text);

    };


    // ==========================================
    // INSERT TEXT
    // ==========================================

    function insertText(text) {

        const target =
            window.voiceCursorTarget;

        if (!target) return;


        // INPUT / TEXTAREA
        if (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA"
        ) {

            const start =
                target.selectionStart;

            const end =
                target.selectionEnd;

            const value =
                target.value;

            target.value =
                value.substring(0, start) +
                text +
                value.substring(end);

            target.selectionStart =
                target.selectionEnd =
                start + text.length;


            // Tell website that value changed
            target.dispatchEvent(
                new Event("input", {
                    bubbles: true
                })
            );

            target.dispatchEvent(
                new Event("change", {
                    bubbles: true
                })
            );

        }


        // CONTENTEDITABLE
        else if (target.isContentEditable) {

            target.focus();

            document.execCommand(
                "insertText",
                false,
                text
            );

        }

    }


    // ==========================================
    // RECOGNITION EVENTS
    // ==========================================

    recognition.onstart = function () {

        isListening = true;

        status.textContent =
            "🎤 Listening...";

    };


    recognition.onend = function () {

        isListening = false;

        if (micMode) {

            status.textContent =
                "🎙️ Mic Mode ON";

        } else {

            status.textContent =
                "Normal Cursor";

        }

    };


    recognition.onerror = function (event) {

        isListening = false;

        status.textContent =
            "Speech Error";

        output.textContent =
            event.error;

        console.log(
            "Voice Cursor error:",
            event.error
        );

    };


    // ==========================================
    // REMOVE VOICE CURSOR
    // ==========================================

    window.removeVoiceCursor = function () {

        document.body.classList.remove(
            "vc-mic-mode"
        );

        box.remove();

        style.remove();

        window.voiceCursorLoaded = false;

        delete window.voiceCursorTarget;

        console.log(
            "Voice Cursor removed."
        );

    };


    console.log(
        "🎙️ Voice Cursor loaded successfully."
    );

})();
