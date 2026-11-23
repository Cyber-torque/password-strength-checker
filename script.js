const input = document.getElementById("password");
const bar = document.getElementById("meter-bar");
const label = document.getElementById("strength-label");
const feedback = document.getElementById("feedback");
const toggle = document.getElementById("toggle");

// A tiny sample list. Real lists have thousands of entries.
const commonPasswords = [
  "password", "123456", "12345678", "qwerty", "abc123", "letmein",
  "welcome", "admin", "iloveyou", "password1", "monkey", "dragon",
  "football", "sunshine", "princess", "trustno1"
  // ...add more here
];

function checkPassword(pw) {
  let score = 0;
  const tips = [];

  if (pw.length === 0) return { score: 0, tips: [] };

  // Length matters most
  if (pw.length >= 8) score += 1; else tips.push("Use at least 8 characters.");
  if (pw.length >= 12) score += 1; else tips.push("12 or more characters is much stronger.");
  if (pw.length >= 16) score += 1;

  // Character variety
  if (/[a-z]/.test(pw)) score += 1; else tips.push("Add lowercase letters.");
  if (/[A-Z]/.test(pw)) score += 1; else tips.push("Add uppercase letters.");
  if (/[0-9]/.test(pw)) score += 1; else tips.push("Add numbers.");
  if (/[^A-Za-z0-9]/.test(pw)) score += 1; else tips.push("Add symbols like ! or #.");

  // Penalties
  if (/(.)\1{2,}/.test(pw)) {
    score -= 1;
    tips.push("Avoid repeating the same character (like 'aaa').");
  }
  if (hasSequence(pw)) {
    score -= 1;
    tips.push("Avoid sequences like 'abc', '123' or 'qwerty'.");
  }

  if (commonPasswords.includes(pw.toLowerCase())) {
    score = 0;
    tips.unshift("This is a very common password. Don't use it.");
  }


  return { score: Math.max(score, 0), tips };
}


function calculateEntropy(pw) {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
  if (pool === 0) return 0;
  return Math.round(pw.length * Math.log2(pool));

}


function hasSequence(pw) {
  const lower = pw.toLowerCase();
  const sequences = ["abcdefghijklmnopqrstuvwxyz", "0123456789", "qwertyuiop", "asdfghkl", "zxcvbnm"];
  for (const seq of sequences) {
    for (let i = 0; i <= seq.length - 3; i++) {
      const chunk = seq.slice(i, i + 3);
      if (lower.includes(chunk) || lower.includes(chunk.split("").reverse().join(""))) {
        return true;
      }
    }
  }
  return false;
}










function render() {
  const pw = input.value;
  const { score, tips } = checkPassword(pw);

  // Map score (0-7) to a level
  let level, color, width;
  if (pw.length === 0) { level = "—"; color = "#d32f2f"; width = 0; }
  else if (score <= 2) { level = "Weak"; color = "#d32f2f"; width = 25; }
  else if (score <= 4) { level = "Fair"; color = "#f57c00"; width = 50; }
  else if (score <= 6) { level = "Good"; color = "#fbc02d"; width = 75; }
  else { level = "Strong"; color = "#388e3c"; width = 100; }

  bar.style.width = width + "%";
  bar.style.background = color;
  const bits = calculateEntropy(pw);
  label.textContent = "Strength: " + level + (pw.length ? " (~" + bits + " bits)" : "");

  feedback.innerHTML = "";
  tips.forEach(function (tip) {
    const li = document.createElement("li");
    li.textContent = tip;
    feedback.appendChild(li);
  });
}

input.addEventListener("input", render);

toggle.addEventListener("click", function () {
  const hidden = input.type === "password";
  input.type = hidden ? "text" : "password";
  toggle.textContent = hidden ? "Hide" : "Show";
});


const breachBtn = document.getElementById("breach-btn");
const breachResult = document.getElementById("breach-result");

async function sha1Hex(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(hashBuffer))
  .map(function (b) { return b.toString(16).padStart(2, "0"); })
  .join("")
  .toUpperCase();
}

async function checkBreach() {
  const pw = input.value;
  if (!pw) {
    breachResult.textContent = "Type a password first.";
    return;
  }
  breachResult.textContent = "Checking....";
  try {
    const hash = await sha1Hex(pw);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch("https://api.pwnedpasswords.com/range/" +prefix);
    if (!response.ok) throw new Error("Request Failed");
    const text = await response.text();

    let count = 0;
    for (const line of text.split("\n")) {
      const parts = line.trim().split(":");
      if (parts[0] === suffix) {
        count = parseInt(parts[1], 10);
        break;
      }
    }
    breachResult.textContent = count > 0
    ? "Found in" + count.toLocaleString() + " known breaches. Don't use this password."
    : "Not Found in known breaches. That doesn't guarantee it's safe, but it's a good sign." ;
  } catch (err) {
  breachResult.textContent = "Error: " + err.message;

  }
}

breachBtn.addEventListener("click", checkBreach);