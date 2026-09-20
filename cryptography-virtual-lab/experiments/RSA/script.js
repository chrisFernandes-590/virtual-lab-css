(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  let rsaState = null;

  function gcd(a, b) {
    a = BigInt(a); b = BigInt(b);
    while (b !== 0n) [a, b] = [b, a % b];
    return a < 0n ? -a : a;
  }

  function egcd(a, b) {
    a = BigInt(a); b = BigInt(b);
    if (b === 0n) return { g: a, x: 1n, y: 0n };
    const r = egcd(b, a % b);
    return { g: r.g, x: r.y, y: r.x - (a / b) * r.y };
  }

  function modInverse(a, m) {
    const r = egcd(BigInt(a), BigInt(m));
    if (r.g !== 1n) throw new Error("e has no modular inverse modulo φ(n).");
    return ((r.x % BigInt(m)) + BigInt(m)) % BigInt(m);
  }

  function modPow(base, exp, mod) {
    base = BigInt(base); exp = BigInt(exp); mod = BigInt(mod);
    let result = 1n;
    base %= mod;
    while (exp > 0n) {
      if (exp & 1n) result = (result * base) % mod;
      base = (base * base) % mod;
      exp >>= 1n;
    }
    return result;
  }

  function isPrime(n) {
    n = BigInt(n);
    if (n < 2n) return false;
    if (n === 2n || n === 3n) return true;
    if (n % 2n === 0n) return false;
    for (let i = 3n; i * i <= n; i += 2n) {
      if (n % i === 0n) return false;
    }
    return true;
  }

  function autoE(phi) {
    const preferred = [65537n, 257n, 17n, 5n, 3n];
    for (const candidate of preferred) {
      if (candidate > 1n && candidate < phi && gcd(candidate, phi) === 1n) return candidate;
    }
    for (let candidate = 3n; candidate < phi; candidate += 2n) {
      if (gcd(candidate, phi) === 1n) return candidate;
    }
    throw new Error("Could not find a valid public exponent.");
  }

  function utf8Bytes(text) {
    return Array.from(new TextEncoder().encode(text));
  }

  function bytesToText(bytes) {
    return new TextDecoder().decode(new Uint8Array(bytes));
  }

  function setStatus(el, message, kind = "") {
    el.textContent = message;
    el.className = "status" + (kind ? " " + kind : "");
  }

  function generateKeys() {
    try {
      const p = BigInt($("p").value);
      const q = BigInt($("q").value);
      if (!isPrime(p) || !isPrime(q)) throw new Error("p and q must both be prime numbers.");
      if (p === q) throw new Error("p and q must be distinct primes.");

      const n = p * q;
      const phi = (p - 1n) * (q - 1n);
      const eInput = $("e").value.trim();
      const e = eInput ? BigInt(eInput) : autoE(phi);

      if (!(1n < e && e < phi)) throw new Error("e must satisfy 1 < e < φ(n).");
      if (gcd(e, phi) !== 1n) throw new Error("e must be coprime with φ(n).");

      const d = modInverse(e, phi);

      // Every byte must be smaller than n for textbook RSA.
      if (n <= 255n) throw new Error("Choose larger primes so n > 255 (required for byte-based messages).");

      rsaState = { p, q, n, phi, e, d };
      $("nOut").textContent = n.toString();
      $("phiOut").textContent = phi.toString();
      $("pubOut").textContent = `(${e}, ${n})`;
      $("privOut").textContent = `(${d}, ${n})`;
      $("keySteps").innerHTML =
        `<div class="formula">n = ${p} × ${q} = ${n}<br>` +
        `φ(n) = (${p}−1)(${q}−1) = ${phi}<br>` +
        `gcd(${e}, ${phi}) = 1<br>` +
        `${e} × ${d} ≡ 1 (mod ${phi})<br>` +
        `Public = (${e}, ${n}) · Private = (${d}, ${n})</div>`;
      setStatus($("keyStatus"), "Keys generated successfully.", "ok");
      $("ciphertext").value = "";
      $("decrypted").value = "";
      $("traceBody").innerHTML = '<tr><td colspan="6">Encrypt a message to view the calculation trace.</td></tr>';
      setStatus($("decryptStatus"), "Waiting for ciphertext.");
    } catch (err) {
      rsaState = null;
      setStatus($("keyStatus"), err.message, "err");
    }
  }

  function encryptMessage() {
    if (!rsaState) {
      setStatus($("keyStatus"), "Generate valid keys first.", "err");
      return;
    }
    const text = $("message").value;
    const bytes = utf8Bytes(text);
    const cipher = bytes.map(m => modPow(BigInt(m), rsaState.e, rsaState.n));
    $("ciphertext").value = cipher.map(x => x.toString()).join(" ");
    $("decrypted").value = "";
    setStatus($("decryptStatus"), "Ciphertext generated. Click Decrypt to recover the message.", "ok");

    $("traceBody").innerHTML = "";
    bytes.forEach((m, i) => {
      const c = cipher[i];
      const recovered = modPow(c, rsaState.d, rsaState.n);
      const char = bytesToText([Number(recovered)]);
      const row = document.createElement("tr");
      row.innerHTML =
        `<td>${i}</td><td>${escapeHtml(char) || "(byte)"}</td>` +
        `<td>${m}</td><td>${c}</td><td>${recovered}</td><td>${escapeHtml(char)}</td>`;
      $("traceBody").appendChild(row);
    });
  }

  function decryptMessage() {
    if (!rsaState) {
      setStatus($("decryptStatus"), "Generate valid keys first.", "err");
      return;
    }
    const raw = $("ciphertext").value.trim();
    if (!raw) {
      setStatus($("decryptStatus"), "There is no ciphertext to decrypt.", "err");
      return;
    }
    try {
      const values = raw.split(/\s+/).map(v => BigInt(v));
      const bytes = values.map(c => {
        if (c < 0n || c >= rsaState.n) throw new Error("Ciphertext contains a value outside the valid range.");
        const m = modPow(c, rsaState.d, rsaState.n);
        if (m > 255n) throw new Error("Recovered value is not a valid byte. Check the keys/ciphertext.");
        return Number(m);
      });
      $("decrypted").value = bytesToText(bytes);
      setStatus($("decryptStatus"), "Decryption successful: the original message was recovered.", "ok");
    } catch (err) {
      setStatus($("decryptStatus"), err.message, "err");
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
    }[ch]));
  }

  function resetExample() {
    $("p").value = "61";
    $("q").value = "53";
    $("e").value = "17";
    $("message").value = "HELLO RSA";
    generateKeys();
  }

  // Tabs
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      $(btn.dataset.tab).classList.add("active");
    });
  });

  $("generateBtn").addEventListener("click", generateKeys);
  $("exampleBtn").addEventListener("click", resetExample);
  $("encryptBtn").addEventListener("click", encryptMessage);
  $("decryptBtn").addEventListener("click", decryptMessage);
  $("clearCipherBtn").addEventListener("click", () => {
    $("ciphertext").value = "";
    $("decrypted").value = "";
    $("traceBody").innerHTML = '<tr><td colspan="6">Encrypt a message to view the calculation trace.</td></tr>';
    setStatus($("decryptStatus"), "Ciphertext cleared.");
  });

  $("quizBtn").addEventListener("click", () => {
    const answers = { q1:"b", q2:"b", q3:"a", q4:"c", q5:"a" };
    let score = 0;
    Object.entries(answers).forEach(([q, ans]) => {
      if (document.querySelector(`input[name="${q}"]:checked`)?.value === ans) score++;
    });
    $("quizScore").textContent = `Score: ${score}/5`;
  });

  // Start with the documented classroom example.
  resetExample();
})();
