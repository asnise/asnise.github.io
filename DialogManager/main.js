let lines = [];
let dialogueData = []; // Will store dialogue objects {index, text, choices}
let previewCurrentLine = null;
let previewTextLines = [];
let previewPage = 0;

function addLine(lineData = null) {
    const index = lines.length;
    const container = document.getElementById('linesContainer');
    const lineDiv = document.createElement('div');
    lineDiv.className = 'line-block';
    lineDiv.innerHTML = `
        <label>Line Index: ${lineData ? lineData.index : index}
          <input type="hidden" class="line-index" value="${lineData ? lineData.index : index}">
        </label>
        <label>Character Name: <input type="text" class="character-name" value="${lineData ? lineData.characterName : ''}"></label>
        <label>Line Text: <textarea class="line-text">${lineData ? lineData.text.replaceAll("\\n", "\n") : ''}</textarea></label>
        <div class="choice-block"></div>
        <button onclick="addChoice(this)">+ Add Choice</button>
        <button onclick="previewLine(this)">Preview This Line</button>
    `;
    container.appendChild(lineDiv);

    if (lineData && lineData.choices) {
        for (let choice of lineData.choices) {
            addChoice(lineDiv.querySelector('button'), choice);
        }
    }
    lines.push(lineDiv);
}

function addChoice(button, choiceData = null) {
    const block = button.parentElement.querySelector('.choice-block');

    // Hide the button if three choices already exist.
    if (block.children.length >= 3) {
        button.style.display = 'none';
        return;
    }

    const choiceIndex = block.children.length;
    const div = document.createElement('div');
    div.innerHTML = `
        <label>Choice ${choiceIndex + 1}:
          <input type="text" class="choice-text" placeholder="Choice text" value="${choiceData ? choiceData.text : ''}">
          Next Line Index: <input type="number" class="choice-next" value="${choiceData ? choiceData.nextLineIndex : 0}">
        </label>
    `;
    block.appendChild(div);

    // Hide the add choice button if maximum 3 choices reached.
    if (block.children.length >= 3) {
        button.style.display = 'none';
    }
}

function saveJSON() {
    const linesJSON = Array.from(document.querySelectorAll('.line-block')).map(block => {
        const index = parseInt(block.querySelector('.line-index').value);
        const characterName = block.querySelector('.character-name').value;
        const text = block.querySelector('.line-text').value.replaceAll("\n", "\\n");
        const choices = Array.from(block.querySelectorAll('.choice-block > div')).map((choiceDiv, i) => ({
            index: i,
            text: choiceDiv.querySelector('.choice-text').value,
            nextLineIndex: parseInt(choiceDiv.querySelector('.choice-next').value)
        }));
        return { index, characterName, text, choices };
    });

    const output = JSON.stringify({ lines: linesJSON }, null, 2);
    const blob = new Blob([output], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "dialogue.json";
    link.click();
}

function importJSON() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (!file) return alert("Please select a file to import.");

        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            const json = JSON.parse(content);
            document.getElementById("linesContainer").innerHTML = '';
            lines = [];
            json.lines.forEach(line => addLine(line));
        };
        reader.readAsText(file);
    };
    fileInput.click();
}

function previewLine(buttonOrIndex) {
    if (typeof buttonOrIndex !== 'number') {
        const block = buttonOrIndex.parentElement;
        const index = parseInt(block.querySelector('.line-index').value);
        const characterName = block.querySelector('.character-name').value;
        const text = block.querySelector('.line-text').value;
        const choices = Array.from(block.querySelectorAll('.choice-block > div')).map(cDiv => ({
            text: cDiv.querySelector('.choice-text').value,
            nextLineIndex: parseInt(cDiv.querySelector('.choice-next').value)
        }));
        previewCurrentLine = { index, characterName, text, choices };
    } else {
        const idx = buttonOrIndex;
        const lineDiv = lines.find(div => parseInt(div.querySelector('.line-index').value) === idx);
        if (!lineDiv) {
            alert('Line not found: ' + idx);
            return;
        }
        const text = lineDiv.querySelector('.line-text').value;
        const choices = Array.from(lineDiv.querySelectorAll('.choice-block > div')).map(cDiv => ({
            text: cDiv.querySelector('.choice-text').value,
            nextLineIndex: parseInt(cDiv.querySelector('.choice-next').value)
        }));
        previewCurrentLine = { index: idx, text, choices };
    }

    previewTextLines = previewCurrentLine.text.split("\n").map(l => l.trim());
    previewPage = 0;
    showPreviewPage();
}

function showPreviewPage() {
    const preview = document.getElementById("previewDialog");
    preview.innerHTML = '';

    const start = previewPage * 3;
    const end = Math.min(start + 3, previewTextLines.length);
    for (let i = start; i < end; i++) {
        const div = document.createElement("div");
        div.className = "preview-line";
        div.innerText = previewTextLines[i];
        preview.appendChild(div);
    }

    if (end === previewTextLines.length && previewCurrentLine.choices.length > 0) {
        const choiceWrap = document.createElement("div");
        choiceWrap.className = "preview-choice";
        previewCurrentLine.choices.forEach(choice => {
            const btn = document.createElement("button");
            btn.innerText = choice.text;
            btn.onclick = () => previewLine(choice.nextLineIndex);
            choiceWrap.appendChild(btn);
        });
        preview.appendChild(choiceWrap);
    }

    addOrUpdateNextButton(end < previewTextLines.length);
}

function addOrUpdateNextButton(hasNextPage) {
    let nextBtn = document.getElementById("previewNextBtn");
    if (!nextBtn) {
        nextBtn = document.createElement("button");
        nextBtn.id = "previewNextBtn";
        nextBtn.textContent = "Next";
        nextBtn.style.marginTop = "10px";
        nextBtn.onclick = () => {
            previewPage++;
            showPreviewPage();
        };
        document.getElementById("previewDialog").appendChild(nextBtn);
    }
    nextBtn.disabled = !hasNextPage;
}

// Initialize with one empty line
if (lines.length === 0) addLine();