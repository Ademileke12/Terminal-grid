// ---------------- INTRO SCREEN ----------------
const intro = document.getElementById("introScreen");
const terminal = document.getElementById("terminalContainer");
const enterBtn = document.getElementById("enterBtn");

enterBtn.addEventListener("click", () => {
  intro.style.opacity = "0";
  setTimeout(() => {
    intro.style.display = "none";
    terminal.style.display = "flex";
    setTimeout(() => (terminal.style.opacity = "1"), 50);
  }, 1000);
});

// ---------------- TERMINAL LOGIC ----------------
const terminalScreen = document.getElementById("terminalScreen");
const outputDiv = document.getElementById("output");
const commandInput = document.getElementById("commandInput");

const MAX_HISTORY = 100;
let history = [];
let historyIndex = -1;

// --- Call Sentient AGI through secure Vercel API ---
async function callSentientAGI(prompt) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) throw new Error("Server error");
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "No response.";
  } catch (err) {
    console.error(err);
    return "Error contacting AGI.";
  }
}

// --- Output Printing ---
function printLine(text) {
  const p = document.createElement("p");
  p.innerHTML = text;
  outputDiv.appendChild(p);
  while (outputDiv.children.length > MAX_HISTORY) {
    outputDiv.removeChild(outputDiv.firstChild);
  }
  terminalScreen.scrollTop = terminalScreen.scrollHeight;
}

// --- Command Processor ---
async function runCommand(input) {
  const command = input.trim().split(" ")[0].toLowerCase();

  if (command.startsWith("/grid")) {
    const query = input.substring(5).trim();
    printLine(`<span class='text-yellow-400'>:: AGI Processing ::</span>`);
    const reply = await callSentientAGI(query);
    printLine(`<span class='text-purple-400'>AGI:</span> ${reply}`);
    return;
  }

  switch (command) {
    case "help":
      printLine("<b>Available commands:</b>");
      printLine("<span class='text-cyan-400'>help</span> — List commands");
      printLine("<span class='text-cyan-400'>clear</span> — Clear screen");
      printLine("<span class='text-cyan-400'>status</span> — Check system");
      printLine("<span class='text-cyan-400'>/grid [query]</span> — Ask AGI");
      break;

    case "clear":
      outputDiv.innerHTML = "";
      break;

    case "status":
      printLine("<b>System Status:</b>");
      printLine("CPU: OK");
      printLine("Network: Stable");
      printLine("Interface: macOS Mode Active");
      break;

    case "":
      break;

    default:
      printLine(`Command not found: <span class='text-red-400'>${command}</span>`);
  }
}

// --- Input handling ---
commandInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const input = commandInput.value.trim();
    if (!input) return;
    printLine(`<span class='text-green-400'>$</span> ${input}`);
    history.push(input);
    historyIndex = history.length;
    runCommand(input);
    commandInput.value = "";
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (history.length > 0) {
      historyIndex = Math.max(0, historyIndex - 1);
      commandInput.value = history[historyIndex];
    }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (history.length > 0) {
      historyIndex = Math.min(history.length, historyIndex + 1);
      commandInput.value = history[historyIndex] || "";
    }
  }
});