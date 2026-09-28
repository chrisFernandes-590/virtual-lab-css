/**
 * RSA Virtual Laboratory — Enhanced Engine
 * Clean Collapsible Navigation, Clean Math Notation, Multi-phase Slow/Detailed Simulation, and 20-Question Quiz
 */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  // Core RSA Mathematical State
  let rsaState = null;

  // ==========================================
  // MATHEMATICAL ALGORITHMS (BigInt)
  // ==========================================

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
    if (r.g !== 1n) throw new Error("Public exponent e has no modular multiplicative inverse modulo φ(n).");
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
    if (n % 2n === 0n || n % 3n === 0n) return false;
    for (let i = 5n; i * i <= n; i += 6n) {
      if (n % i === 0n || n % (i + 2n) === 0n) return false;
    }
    return true;
  }

  function autoE(phi) {
    const preferred = [65537n, 257n, 17n, 7n, 5n, 3n];
    for (const candidate of preferred) {
      if (candidate > 1n && candidate < phi && gcd(candidate, phi) === 1n) return candidate;
    }
    for (let candidate = 3n; candidate < phi; candidate += 2n) {
      if (gcd(candidate, phi) === 1n) return candidate;
    }
    throw new Error("Could not find a valid public exponent coprime to φ(n).");
  }

  function utf8Bytes(text) {
    return Array.from(new TextEncoder().encode(text));
  }

  function bytesToText(bytes) {
    return new TextDecoder().decode(new Uint8Array(bytes));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
    }[ch]));
  }

  function setBanner(el, message, kind = "") {
    if (!el) return;
    el.textContent = message;
    el.className = "status-banner" + (kind ? " " + kind : "");
  }

  // ==========================================
  // SIDEBAR NAVIGATION MANAGEMENT
  // ==========================================

  const sectionMeta = {
    aim: {
      title: "Aim & Objectives",
      desc: "Understand the foundational principles, mathematical background, and practical implementation of the RSA public-key algorithm."
    },
    theory: {
      title: "RSA Cryptosystem Theory",
      desc: "Explore the number-theoretic foundations: prime factorization, Euler's totient function, Extended Euclidean Algorithm, and security proofs."
    },
    procedure: {
      title: "Step-by-Step Procedure",
      desc: "Detailed instructions to generate keys, encrypt message blocks, decrypt ciphertexts, and evaluate computational correctness."
    },
    lab: {
      title: "Interactive Cryptography Laboratory",
      desc: "Configure prime parameters, generate asymmetric key pairs, encrypt plaintext strings, and inspect detailed byte-level traces."
    },
    simulation: {
      title: "Interactive RSA Visual Simulation",
      desc: "Watch characters convert to bytes, travel through modular encryption, transit as ciphertexts, and undergo private-key recovery."
    },
    assessment: {
      title: "Assessment & Viva Questions",
      desc: "Self-evaluation questions with full analytical explanations and standardized test cases to verify cryptosystem behavior."
    },
    quiz: {
      title: "Comprehensive 20-Question Quiz",
      desc: "Challenge your mastery of RSA number theory, modular inverses, homomorphic malleability, OAEP padding, and known attacks."
    },
    references: {
      title: "Academic & Standard References",
      desc: "Original research papers, RFC cryptography standards, and authoritative textbooks on public-key cryptosystems."
    }
  };

  function toggleCollapseSidebar() {
    const rail = $("sidebarRail");
    if (!rail) return;
    rail.classList.toggle("collapsed");
    const isCollapsed = rail.classList.contains("collapsed");
    if ($("railToggleIcon")) $("railToggleIcon").textContent = isCollapsed ? "⮞" : "⮜";
    if ($("railToggleBtn")) $("railToggleBtn").title = isCollapsed ? "Expand Sidebar" : "Collapse Sidebar";
  }

  function switchTab(tabId) {
    const navItems = document.querySelectorAll(".nav-item");
    const panels = document.querySelectorAll(".panel");

    navItems.forEach(btn => {
      const isActive = btn.dataset.tab === tabId;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    panels.forEach(panel => {
      panel.classList.toggle("active", panel.id === tabId);
    });

    // Update Hero headers
    const meta = sectionMeta[tabId] || sectionMeta.aim;
    if ($("mainHeroTitle")) $("mainHeroTitle").textContent = meta.title;
    if ($("mainHeroDesc")) $("mainHeroDesc").textContent = meta.desc;

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  $("railToggleBtn")?.addEventListener("click", toggleCollapseSidebar);

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Accordion in Assessment
  document.querySelectorAll(".accordion-header").forEach(header => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      item.classList.toggle("open");
      const arrow = header.querySelector("span:last-child");
      if (arrow) arrow.textContent = item.classList.contains("open") ? "▲" : "▼";
    });
  });

  // ==========================================
  // INTERACTIVE LAB LOGIC
  // ==========================================

  function generateKeys(silent = false) {
    try {
      const pVal = $("p").value.trim();
      const qVal = $("q").value.trim();
      if (!pVal || !qVal) throw new Error("Please enter both prime numbers p and q.");

      const p = BigInt(pVal);
      const q = BigInt(qVal);

      if (!isPrime(p)) throw new Error(`p = ${p} is not a prime number.`);
      if (!isPrime(q)) throw new Error(`q = ${q} is not a prime number.`);
      if (p === q) throw new Error("p and q must be distinct primes.");

      const n = p * q;
      const phi = (p - 1n) * (q - 1n);

      if (n <= 255n) {
        throw new Error(`Modulus n = ${n} is too small. For single-byte character encryption (0-255), ensure n > 255 (choose primes > 16).`);
      }

      const eInput = $("e").value.trim();
      const e = eInput ? BigInt(eInput) : autoE(phi);

      if (e <= 1n || e >= phi) throw new Error(`e must satisfy 1 < e < φ(n) (${phi}).`);
      if (gcd(e, phi) !== 1n) throw new Error(`e = ${e} and φ(n) = ${phi} are not coprime (gcd = ${gcd(e, phi)}).`);

      const d = modInverse(e, phi);

      rsaState = { p, q, n, phi, e, d };

      $("nOut").textContent = n.toString();
      $("phiOut").textContent = phi.toString();
      $("pubOut").textContent = `(${e}, ${n})`;
      $("privOut").textContent = `(${d}, ${n})`;

      $("keySteps").innerHTML = `
        <div class="formula-box">
          <strong>1. Modulus:</strong> <var>n</var> = ${p} &times; ${q} = <strong>${n}</strong><br>
          <strong>2. Euler's Totient:</strong> &phi;(<var>n</var>) = (${p} &minus; 1)(${q} &minus; 1) = <strong>${phi}</strong><br>
          <strong>3. Public Exponent:</strong> <var>e</var> = <strong>${e}</strong> (gcd(${e}, ${phi}) = 1)<br>
          <strong>4. Private Exponent:</strong> <var>d</var> &equiv; ${e}<sup>&minus;1</sup> mod ${phi} = <strong>${d}</strong><br>
          <strong>5. Key Pairs:</strong> Public (<var>e</var>, <var>n</var>) = (${e}, ${n}) &bull; Private (<var>d</var>, <var>n</var>) = (${d}, ${n})
        </div>
      `;

      if (!silent) {
        setBanner($("keyStatus"), `RSA Keys generated successfully! (Public: ${e}, ${n} | Private: ${d}, ${n})`, "ok");
      }
      
      updateSimKeys();

    } catch (err) {
      rsaState = null;
      $("nOut").textContent = "—";
      $("phiOut").textContent = "—";
      $("pubOut").textContent = "—";
      $("privOut").textContent = "—";
      $("keySteps").innerHTML = '<div class="formula-box">Mathematical derivation will appear here once keys are generated.</div>';
      setBanner($("keyStatus"), err.message, "err");
    }
  }

  function encryptMessage(silent = false) {
    if (!rsaState) {
      setBanner($("keyStatus"), "Please generate valid RSA keys before encrypting.", "err");
      return;
    }

    const text = $("message").value;
    if (!text) {
      setBanner($("decryptStatus"), "Please enter a plaintext message to encrypt.", "err");
      return;
    }

    const bytes = utf8Bytes(text);
    const cipherArray = bytes.map(m => modPow(BigInt(m), rsaState.e, rsaState.n));

    $("ciphertext").value = cipherArray.map(c => c.toString()).join(" ");
    
    if (!silent) {
      $("decrypted").value = "";
      setBanner($("decryptStatus"), "Ciphertext generated successfully. Click 'Decrypt Ciphertext' to recover message.", "ok");
    }

    const tbody = $("traceBody");
    tbody.innerHTML = "";

    bytes.forEach((m, idx) => {
      const c = cipherArray[idx];
      const recoveredVal = modPow(c, rsaState.d, rsaState.n);
      const recoveredChar = bytesToText([Number(recoveredVal)]);
      const charDisplay = escapeHtml(text[idx] || recoveredChar);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>#${idx + 1}</strong></td>
        <td><code>'${charDisplay}'</code></td>
        <td><code>${m}</code></td>
        <td><code>${m}<sup>${rsaState.e}</sup> mod ${rsaState.n} = <strong>${c}</strong></code></td>
        <td><code>${c}<sup>${rsaState.d}</sup> mod ${rsaState.n} = <strong>${recoveredVal}</strong></code></td>
        <td><strong style="color:#15803d;">'${escapeHtml(recoveredChar)}'</strong></td>
      `;
      tbody.appendChild(row);
    });

    if ($("simCustomInput")) $("simCustomInput").value = text;
    buildSimStream(text);
  }

  function decryptMessage(silent = false) {
    if (!rsaState) {
      setBanner($("decryptStatus"), "Generate valid keys first.", "err");
      return;
    }

    const raw = $("ciphertext").value.trim();
    if (!raw) {
      setBanner($("decryptStatus"), "No ciphertext found. Enter or encrypt a message first.", "err");
      return;
    }

    try {
      const tokens = raw.split(/\s+/).map(x => BigInt(x));
      const recoveredBytes = tokens.map(c => {
        if (c < 0n || c >= rsaState.n) throw new Error(`Ciphertext value ${c} is out of modulus range [0, ${rsaState.n - 1n}].`);
        const m = modPow(c, rsaState.d, rsaState.n);
        if (m > 255n) throw new Error(`Recovered integer ${m} exceeds single-byte range. Ensure original message was single-byte UTF-8.`);
        return Number(m);
      });

      const recoveredStr = bytesToText(recoveredBytes);
      $("decrypted").value = recoveredStr;
      
      if (!silent) {
        setBanner($("decryptStatus"), `Decryption successful! Recovered message: "${recoveredStr}"`, "ok");
      }
    } catch (err) {
      setBanner($("decryptStatus"), "Decryption Error: " + err.message, "err");
    }
  }

  function resetToExample() {
    $("p").value = "61";
    $("q").value = "53";
    $("e").value = "17";
    $("message").value = "HELLO RSA";
    generateKeys(true);
    encryptMessage(true);
    decryptMessage(true);
    setBanner($("keyStatus"), "RSA Keys initialized (p=61, q=53, e=17, n=3233, d=2753).", "ok");
    setBanner($("decryptStatus"), "Sample ciphertext encrypted and verified.", "ok");
  }

  $("generateBtn")?.addEventListener("click", () => generateKeys(false));
  $("exampleBtn")?.addEventListener("click", resetToExample);
  $("encryptBtn")?.addEventListener("click", () => encryptMessage(false));
  $("decryptBtn")?.addEventListener("click", () => decryptMessage(false));
  $("clearCipherBtn")?.addEventListener("click", () => {
    $("ciphertext").value = "";
    $("decrypted").value = "";
    $("traceBody").innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-light); padding:24px;">Encrypt a message to generate the byte trace.</td></tr>';
    setBanner($("decryptStatus"), "Ciphertext buffer cleared.");
  });

  // ==========================================
  // ENHANCED MULTI-PHASE DETAILED SIMULATION
  // ==========================================

  let simMessage = "HELLO RSA";
  let simCharIndex = 0;
  let simPhase = 0;
  let simTimer = null;
  let simSpeed = 3200;
  let isSimPlaying = false;

  const totalPhases = 5;

  function updateSimKeys() {
    if (!rsaState) return;
    if ($("stageEncryptKey")) $("stageEncryptKey").innerHTML = `Key: <var>e</var>=${rsaState.e}, <var>n</var>=${rsaState.n}`;
    if ($("stageDecryptKey")) $("stageDecryptKey").innerHTML = `Key: <var>d</var>=${rsaState.d}, <var>n</var>=${rsaState.n}`;
  }

  function buildSimStream(text) {
    simMessage = text || "HELLO RSA";
    simCharIndex = 0;
    simPhase = 0;
    const bar = $("tokenStreamBar");
    if (!bar) return;
    bar.innerHTML = "";

    const bytes = utf8Bytes(simMessage);
    bytes.forEach((b, i) => {
      const token = document.createElement("div");
      token.className = "stream-token" + (i === 0 ? " current" : "");
      token.dataset.index = i;
      token.innerHTML = `
        <div class="token-char">'${escapeHtml(simMessage[i] || " ")}'</div>
        <div class="token-byte">${b}</div>
      `;
      token.addEventListener("click", () => {
        pauseSimulation();
        simCharIndex = i;
        simPhase = 0;
        renderSimState();
      });
      bar.appendChild(token);
    });

    renderSimState();
  }

  function renderSimState() {
    if (!rsaState) generateKeys(true);
    const bytes = utf8Bytes(simMessage);
    if (bytes.length === 0) return;

    if (simCharIndex < 0) simCharIndex = 0;
    if (simCharIndex >= bytes.length) simCharIndex = bytes.length - 1;

    document.querySelectorAll(".stream-token").forEach((tok, i) => {
      tok.className = "stream-token" + (i === simCharIndex ? " current" : (i < simCharIndex ? " processed" : ""));
    });

    const m = BigInt(bytes[simCharIndex]);
    const char = simMessage[simCharIndex] || "";
    const c = modPow(m, rsaState.e, rsaState.n);
    const recoveredInt = modPow(c, rsaState.d, rsaState.n);
    const recoveredChar = bytesToText([Number(recoveredInt)]);

    const stagePlain = $("simStagePlain");
    const stageEncrypt = $("simStageEncrypt");
    const stageCipher = $("simStageCipher");
    const stageDecrypt = $("simStageDecrypt");
    const stageRecovered = $("simStageRecovered");

    const arrow1 = $("arrowStage1");
    const arrow2 = $("arrowStage2");
    const arrow3 = $("arrowStage3");
    const arrow4 = $("arrowStage4");

    [stagePlain, stageEncrypt, stageCipher, stageDecrypt, stageRecovered].forEach(s => s?.classList.remove("active"));
    [arrow1, arrow2, arrow3, arrow4].forEach(a => a?.classList.remove("active"));

    $("stagePlainVal").textContent = `'${char}'`;
    $("stagePlainMath").textContent = `ASCII / UTF-8: ${m}`;

    $("stageCipherVal").textContent = c.toString();
    $("stageCipherMath").innerHTML = `<var>c</var> = ${m}<sup>${rsaState.e}</sup> mod ${rsaState.n}`;

    $("stageRecoveredVal").textContent = `'${recoveredChar}'`;
    $("stageRecoveredMath").innerHTML = `<var>m</var> = ${c}<sup>${rsaState.d}</sup> mod ${rsaState.n} (${recoveredInt})`;

    $("narrativeColInput").innerHTML = `Character: <strong>'${escapeHtml(char)}'</strong> | Byte <var>m</var> = <strong>${m}</strong>`;
    $("narrativeColEncrypt").innerHTML = `<code>${m}<sup>${rsaState.e}</sup> mod ${rsaState.n} = <strong>${c}</strong></code>`;
    $("narrativeColDecrypt").innerHTML = `<code>${c}<sup>${rsaState.d}</sup> mod ${rsaState.n} = <strong>${recoveredInt} ('${escapeHtml(recoveredChar)}')</strong></code>`;

    $("simCharCounter").textContent = `Character ${simCharIndex + 1} of ${bytes.length} ('${char}')`;

    switch (simPhase) {
      case 0:
        stagePlain?.classList.add("active");
        $("simPhaseText").textContent = `Phase 1 of 5: Input Plaintext Character Selection`;
        $("narrativeExplanationText").innerHTML = `
          <strong>Step 1: Input Encoding.</strong> The sender selects character <strong>'${escapeHtml(char)}'</strong> from the message. 
          It is converted into its integer byte value <var>m</var> = <strong>${m}</strong>. 
          Notice that <var>m</var> (${m}) is strictly less than the RSA modulus <var>n</var> (${rsaState.n}), satisfying the condition <var>m</var> &lt; <var>n</var>.
        `;
        break;

      case 1:
        stagePlain?.classList.add("active");
        arrow1?.classList.add("active");
        stageEncrypt?.classList.add("active");
        $("simPhaseText").textContent = `Phase 2 of 5: Modular Exponentiation using Public Key`;
        $("narrativeExplanationText").innerHTML = `
          <strong>Step 2: Public Key Encryption.</strong> Using the public key (<var>e</var>, <var>n</var>) = (<strong>${rsaState.e}</strong>, <strong>${rsaState.n}</strong>),
          the sender calculates ciphertext <var>c</var> &equiv; <var>m</var><sup><var>e</var></sup> mod <var>n</var> &equiv; <strong>${m}<sup>${rsaState.e}</sup> mod ${rsaState.n} = ${c}</strong> via square-and-multiply exponentiation.
        `;
        break;

      case 2:
        stageEncrypt?.classList.add("active");
        arrow2?.classList.add("active");
        stageCipher?.classList.add("active");
        $("simPhaseText").textContent = `Phase 3 of 5: Ciphertext Transmission through Public Channel`;
        $("narrativeExplanationText").innerHTML = `
          <strong>Step 3: Ciphertext in Transit.</strong> The encrypted integer <strong>${c}</strong> is transmitted across the unsecure channel. 
          An eavesdropper intercepting <strong>${c}</strong> cannot recover <var>m</var> without knowing private exponent <var>d</var>, which requires factoring <var>n</var> = ${rsaState.n}.
        `;
        break;

      case 3:
        stageCipher?.classList.add("active");
        arrow3?.classList.add("active");
        stageDecrypt?.classList.add("active");
        $("simPhaseText").textContent = `Phase 4 of 5: Private Key Decryption`;
        $("narrativeExplanationText").innerHTML = `
          <strong>Step 4: Private Key Decryption.</strong> The receiver obtains ciphertext block <strong>${c}</strong>. 
          Using their private key exponent <var>d</var> = <strong>${rsaState.d}</strong>, they compute <var>m</var> &equiv; <var>c</var><sup><var>d</var></sup> mod <var>n</var> &equiv; <strong>${c}<sup>${rsaState.d}</sup> mod ${rsaState.n} = ${recoveredInt}</strong>.
        `;
        break;

      case 4:
        stageDecrypt?.classList.add("active");
        arrow4?.classList.add("active");
        stageRecovered?.classList.add("active");
        $("simPhaseText").textContent = `Phase 5 of 5: Decoded Character Verification`;
        $("narrativeExplanationText").innerHTML = `
          <strong>Step 5: Character Recovery.</strong> The integer <strong>${recoveredInt}</strong> is mapped back to character <strong>'${escapeHtml(recoveredChar)}'</strong>. 
          Euler's Totient Theorem guarantees <var>m</var><sup><var>ed</var></sup> &equiv; <var>m</var> (mod <var>n</var>), restoring the exact original plaintext with 100% fidelity.
        `;
        break;
    }
  }

  function advancePhase() {
    if (simPhase < totalPhases - 1) {
      simPhase++;
    } else {
      simPhase = 0;
      const bytes = utf8Bytes(simMessage);
      if (simCharIndex < bytes.length - 1) {
        simCharIndex++;
      } else {
        simCharIndex = 0;
      }
    }
    renderSimState();
  }

  function previousPhase() {
    if (simPhase > 0) {
      simPhase--;
    } else {
      const bytes = utf8Bytes(simMessage);
      if (simCharIndex > 0) {
        simCharIndex--;
        simPhase = totalPhases - 1;
      } else {
        simCharIndex = bytes.length - 1;
        simPhase = totalPhases - 1;
      }
    }
    renderSimState();
  }

  function nextCharacter() {
    const bytes = utf8Bytes(simMessage);
    if (simCharIndex < bytes.length - 1) {
      simCharIndex++;
    } else {
      simCharIndex = 0;
    }
    simPhase = 0;
    renderSimState();
  }

  function playSimulation() {
    if (isSimPlaying) return;
    isSimPlaying = true;
    $("simPlayIcon").textContent = "⏸";
    $("simPlayText").textContent = "Pause Walkthrough";
    simTimer = setInterval(advancePhase, simSpeed);
  }

  function pauseSimulation() {
    isSimPlaying = false;
    if (simTimer) clearInterval(simTimer);
    simTimer = null;
    $("simPlayIcon").textContent = "▶";
    $("simPlayText").textContent = "Auto-Play Walkthrough";
  }

  $("simPlayBtn")?.addEventListener("click", () => {
    if (isSimPlaying) pauseSimulation();
    else playSimulation();
  });

  $("simNextPhaseBtn")?.addEventListener("click", () => {
    pauseSimulation();
    advancePhase();
  });

  $("simPrevPhaseBtn")?.addEventListener("click", () => {
    pauseSimulation();
    previousPhase();
  });

  $("simNextCharBtn")?.addEventListener("click", () => {
    pauseSimulation();
    nextCharacter();
  });

  $("simResetBtn")?.addEventListener("click", () => {
    pauseSimulation();
    simCharIndex = 0;
    simPhase = 0;
    renderSimState();
  });

  $("simApplyBtn")?.addEventListener("click", () => {
    const custom = $("simCustomInput").value.trim() || "HELLO RSA";
    pauseSimulation();
    buildSimStream(custom);
  });

  document.querySelectorAll(".chip-btn[data-preset]").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip-btn[data-preset]").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const presetVal = chip.dataset.preset;
      $("simCustomInput").value = presetVal;
      pauseSimulation();
      buildSimStream(presetVal);
    });
  });

  document.querySelectorAll(".chip-btn[data-speed]").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip-btn[data-speed]").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      simSpeed = Number(chip.dataset.speed) || 3200;
      if (isSimPlaying) {
        clearInterval(simTimer);
        simTimer = setInterval(advancePhase, simSpeed);
      }
    });
  });

  // ==========================================
  // 20-QUESTION ADVANCED ACADEMIC QUIZ MODULE
  // ==========================================

  const quizQuestions = [
    {
      id: "q1",
      cat: "Number Theory",
      q: "Given two distinct prime numbers p and q, what is the exact value of Euler's totient function φ(n) for n = p × q?",
      options: [
        { k: "a", text: "φ(n) = (p + 1)(q + 1)" },
        { k: "b", text: "φ(n) = (p - 1)(q - 1)" },
        { k: "c", text: "φ(n) = p × q - 1" },
        { k: "d", text: "φ(n) = gcd(p - 1, q - 1)" }
      ],
      correct: "b",
      exp: "Because Euler's totient is multiplicative for coprime integers: φ(p × q) = φ(p) × φ(q) = (p - 1)(q - 1)."
    },
    {
      id: "q2",
      cat: "Key Generation",
      q: "What condition must the public exponent e satisfy with respect to φ(n)?",
      options: [
        { k: "a", text: "1 < e < φ(n) and gcd(e, φ(n)) = 1" },
        { k: "b", text: "e must be a multiple of φ(n)" },
        { k: "c", text: "e ≡ 1 (mod φ(n))" },
        { k: "d", text: "e > n and e must be even" }
      ],
      correct: "a",
      exp: "e must be strictly coprime to φ(n) (gcd(e, φ(n)) = 1) to ensure a modular multiplicative inverse d exists modulo φ(n)."
    },
    {
      id: "q3",
      cat: "Algorithms",
      q: "Which algorithm is standardly used to compute the private decryption exponent d such that e × d ≡ 1 (mod φ(n))?",
      options: [
        { k: "a", text: "Miller-Rabin Primality Test" },
        { k: "b", text: "Extended Euclidean Algorithm" },
        { k: "c", text: "Fast Fourier Transform" },
        { k: "d", text: "Sieve of Atkin" }
      ],
      correct: "b",
      exp: "The Extended Euclidean Algorithm calculates integers x and y such that e·x + φ(n)·y = gcd(e, φ(n)) = 1, yielding d = x mod φ(n)."
    },
    {
      id: "q4",
      cat: "Number Theory",
      q: "According to Euler's Theorem, if gcd(a, n) = 1, what is the value of a^φ(n) mod n?",
      options: [
        { k: "a", text: "0" },
        { k: "b", text: "a" },
        { k: "c", text: "1" },
        { k: "d", text: "n - 1" }
      ],
      correct: "c",
      exp: "Euler's Totient Theorem states that for any integer a coprime to n, a^φ(n) ≡ 1 (mod n)."
    },
    {
      id: "q5",
      cat: "Correctness Proof",
      q: "Why does RSA decryption (m^e)^d ≡ m (mod n) hold even if gcd(m, n) > 1 (i.e., m is a multiple of p or q)?",
      options: [
        { k: "a", text: "It only works if m < φ(n)" },
        { k: "b", text: "By Fermat's Little Theorem applied mod p and mod q separately, combined via the Chinese Remainder Theorem" },
        { k: "c", text: "Because e × d equals 1 in standard arithmetic" },
        { k: "d", text: "Because modular exponentiation is always linear" }
      ],
      correct: "b",
      exp: "If p divides m, m^ed ≡ 0 ≡ m (mod p). If p does not divide m, m^ed = m^(1 + k(p-1)(q-1)) ≡ m·(1) ≡ m (mod p). By CRT, m^ed ≡ m (mod pq)."
    },
    {
      id: "q6",
      cat: "Vulnerabilities",
      q: "Textbook RSA exhibits a multiplicative homomorphic property. If c1 = (m1)^e mod n and c2 = (m2)^e mod n, what is (c1 × c2) mod n?",
      options: [
        { k: "a", text: "(m1 + m2)^e mod n" },
        { k: "b", text: "(m1 × m2)^e mod n" },
        { k: "c", text: "(m1^m2)^e mod n" },
        { k: "d", text: "0" }
      ],
      correct: "b",
      exp: "c1 × c2 ≡ (m1)^e × (m2)^e ≡ (m1 × m2)^e (mod n). This malleability enables attackers to forge valid ciphertexts of related messages."
    },
    {
      id: "q7",
      cat: "Attacks",
      q: "In a Chosen Ciphertext Attack (CCA) against unpadded RSA, if an attacker queries the decryption of c' = (c × r^e) mod n and receives m', how do they recover m?",
      options: [
        { k: "a", text: "m = (m' × r) mod n" },
        { k: "b", text: "m = (m' × r^-1) mod n" },
        { k: "c", text: "m = (m' + r) mod n" },
        { k: "d", text: "m = (m')^r mod n" }
      ],
      correct: "b",
      exp: "m' = (c')^d ≡ (c × r^e)^d ≡ m × r (mod n). Multiplying by the modular inverse r^-1 modulo n yields m = m' · r^-1 mod n."
    },
    {
      id: "q8",
      cat: "Standards & Padding",
      q: "Why is Optimal Asymmetric Encryption Padding (OAEP, PKCS#1 v2.2) mandatory for secure real-world RSA encryption?",
      options: [
        { k: "a", text: "It compresses the message to speed up network transfer" },
        { k: "b", text: "It makes encryption probabilistic and provides IND-CCA2 security, eliminating algebraic malleability" },
        { k: "c", text: "It eliminates the need for prime numbers" },
        { k: "d", text: "It replaces modular exponentiation with bitwise XOR" }
      ],
      correct: "b",
      exp: "OAEP combines random padding and Feistel hash structures to prevent chosen-ciphertext attacks and make ciphertexts non-malleable."
    },
    {
      id: "q9",
      cat: "Implementation",
      q: "Why is e = 65537 (2^16 + 1, Fermat prime F4) the standard industry choice for the public exponent in RSA?",
      options: [
        { k: "a", text: "Its binary form 10000000000000001 has Hamming weight 2, requiring only 17 modular multiplications while avoiding small-exponent attacks" },
        { k: "b", text: "It is the largest prime number supported by 32-bit processors" },
        { k: "c", text: "It guarantees that d will always be an odd number" },
        { k: "d", text: "It prevents quantum computers from factoring n" }
      ],
      correct: "a",
      exp: "With only two set bits, exponentiation requires 16 squarings and 1 multiplication (fast), while being large enough to resist low-exponent attacks."
    },
    {
      id: "q10",
      cat: "Attacks",
      q: "Wiener's Attack demonstrates that the private key exponent d can be recovered in polynomial time via continued fractions if:",
      options: [
        { k: "a", text: "d > n^(3/4)" },
        { k: "b", text: "d < (1/3) × n^(1/4)" },
        { k: "c", text: "e > n / 2" },
        { k: "d", text: "p - q = 1" }
      ],
      correct: "b",
      exp: "Wiener proved that if d < (1/3)·n^(1/4), the fraction k/d appears as a convergent in the continued fraction expansion of e/n."
    },
    {
      id: "q11",
      cat: "Attacks",
      q: "In the Common Modulus Attack, two users share the same modulus n with coprime exponents e1 and e2. If the same message m is sent to both, an eavesdropper can:",
      options: [
        { k: "a", text: "Recover message m without knowing either private key using Bézout's coefficients" },
        { k: "b", text: "Calculate the private key d1 directly in one step" },
        { k: "c", text: "Do nothing because ciphertexts cannot be combined" },
        { k: "d", text: "Corrupt both key pairs" }
      ],
      correct: "a",
      exp: "Since gcd(e1, e2) = 1, integers r and s exist such that r·e1 + s·e2 = 1. The attacker computes (c1^r · c2^s) mod n = m^(r·e1 + s·e2) ≡ m (mod n)."
    },
    {
      id: "q12",
      cat: "Attacks",
      q: "Håstad's Broadcast Attack applies when the same message m is encrypted with e = 3 to three recipients with moduli n1, n2, n3. The attacker recovers m by:",
      options: [
        { k: "a", text: "Using Pollard's rho algorithm" },
        { k: "b", text: "Applying Chinese Remainder Theorem to find c = m^3 mod (n1·n2·n3), then computing the standard integer cube root" },
        { k: "c", text: "Factoring all three moduli simultaneously" },
        { k: "d", text: "Finding collisions in MD5" }
      ],
      correct: "b",
      exp: "Since m < ni, m^3 < n1·n2·n3. CRT finds c ≡ m^3 mod (n1·n2·n3). Because m^3 is strictly less than the combined modulus, c = m^3 over the integers, so m = ∛c."
    },
    {
      id: "q13",
      cat: "Complexity & Security",
      q: "What is the best-known heuristic asymptotic time complexity for factoring large RSA moduli using the General Number Field Sieve (GNFS)?",
      options: [
        { k: "a", text: "O(n^2) [Polynomial in n]" },
        { k: "b", text: "O(2^n) [Exponential in n]" },
        { k: "c", text: "Sub-exponential: exp((c + o(1)) (ln n)^(1/3) (ln ln n)^(2/3))" },
        { k: "d", text: "O(log n) [Polynomial in key length]" }
      ],
      correct: "c",
      exp: "GNFS is sub-exponential in key size, which is why 2048-bit to 3072-bit keys are required to provide 112 to 128 bits of equivalent symmetric security."
    },
    {
      id: "q14",
      cat: "Optimization",
      q: "How does the Chinese Remainder Theorem (CRT-RSA) speed up private key decryption m = c^d mod n?",
      options: [
        { k: "a", text: "By computing mp = c^(dp) mod p and mq = c^(dq) mod q separately, achieving approximately a 4x overall speedup" },
        { k: "b", text: "By reducing the prime size by half during key generation" },
        { k: "c", text: "By completely skipping modular multiplication" },
        { k: "d", text: "By transforming RSA into elliptic curve cryptography" }
      ],
      correct: "a",
      exp: "Since p and q are half the bit-length of n, modular multiplication is 8x faster. Doing two half-size exponentiations yields a net ~4x acceleration."
    },
    {
      id: "q15",
      cat: "Key Generation Vulnerability",
      q: "If primes p and q are chosen too close to each other (i.e., |p - q| is small), which factoring method breaks n almost instantaneously?",
      options: [
        { k: "a", text: "Fermat's Factorization Method" },
        { k: "b", text: "Shor's Classical Algorithm" },
        { k: "c", text: "Dijkstra's Shortest Path" },
        { k: "d", text: "Kasiski Examination" }
      ],
      correct: "a",
      exp: "n = ((p+q)/2)^2 - ((p-q)/2)^2 = a^2 - b^2. When p ≈ q, a ≈ √n and b is tiny, so Fermat's algorithm testing a = ⌈√n⌉, ⌈√n⌉+1... finds factors in seconds."
    },
    {
      id: "q16",
      cat: "Digital Signatures",
      q: "In an RSA digital signature scheme, how is a signature s created for message hash h, and how is it verified by a third party?",
      options: [
        { k: "a", text: "Sign: s = h^e mod n; Verify: h' = s^d mod n" },
        { k: "b", text: "Sign: s = h^d mod n; Verify: h' = s^e mod n, check if h' == h" },
        { k: "c", text: "Sign: s = (h × d) mod n; Verify: h' = (s / e) mod n" },
        { k: "d", text: "Sign: s = h ⊕ d; Verify: h' = s ⊕ e" }
      ],
      correct: "b",
      exp: "Signing uses the secret exponent d (s = h^d mod n), and verification uses the public key (s^e mod n = h), proving authorship."
    },
    {
      id: "q17",
      cat: "Side-Channel Resistance",
      q: "How does cryptographic blinding protect RSA decryption from side-channel timing attacks?",
      options: [
        { k: "a", text: "By multiplying ciphertext by r^e mod n before decrypting, and removing r^-1 mod n after decryption" },
        { k: "b", text: "By introducing random sleep() delays in CPU execution" },
        { k: "c", text: "By regenerating public and private keys after every transaction" },
        { k: "d", text: "By turning off CPU cache memory" }
      ],
      correct: "a",
      exp: "Blinding computes c' = (c · r^e) mod n. Decrypting c' yields m' = m · r mod n. Multiplying by r^-1 recovers m, decoupling decryption timing from ciphertext value."
    },
    {
      id: "q18",
      cat: "Calculation Practice",
      q: "Given primes p = 11, q = 13, and public exponent e = 7, what is the exact private key exponent d?",
      options: [
        { k: "a", text: "d = 17" },
        { k: "b", text: "d = 43" },
        { k: "c", text: "d = 103" },
        { k: "d", text: "d = 77" }
      ],
      correct: "c",
      exp: "φ(n) = (11-1)(13-1) = 120. We solve 7·d ≡ 1 (mod 120). 120 = 17×7 + 1 ⟹ 1 = 120 - 17×7 ⟹ 7(-17) ≡ 1 (mod 120). d = -17 ≡ 103 (mod 120). Check: 7 × 103 = 721 = 6×120 + 1."
    },
    {
      id: "q19",
      cat: "Attacks",
      q: "Pollard's p - 1 algorithm can easily factor modulus n = p × q if:",
      options: [
        { k: "a", text: "p - 1 is powersmooth (all prime factors of p - 1 are small)" },
        { k: "b", text: "p and q are safe primes where (p-1)/2 is prime" },
        { k: "c", text: "The public exponent is e = 65537" },
        { k: "d", text: "φ(n) is an odd integer" }
      ],
      correct: "a",
      exp: "If p - 1 has only small factors, k = lcm(1,2,...,B) is a multiple of p - 1. By Fermat's Little Theorem, a^k ≡ 1 (mod p), so gcd(a^k - 1, n) yields factor p."
    },
    {
      id: "q20",
      cat: "Domain Requirements",
      q: "Why must the integer representation of every message block m strictly satisfy 0 ≤ m < n in RSA?",
      options: [
        { k: "a", text: "To prevent 64-bit integer overflow in register hardware" },
        { k: "b", text: "Because modular arithmetic mod n is bijective only on Z_n; if m ≥ n, m mod n loses information, making unique decryption impossible" },
        { k: "c", text: "Because negative numbers are invalid in UTF-8" },
        { k: "d", text: "Because public exponentiation requires m to be smaller than e" }
      ],
      correct: "b",
      exp: "RSA operations take place in the finite ring ℤn. If m ≥ n, m is mapped to m mod n, losing the integer quotient and rendering true plaintext recovery impossible."
    }
  ];

  function renderQuiz() {
    const container = $("quizContainer");
    if (!container) return;
    container.innerHTML = "";

    quizQuestions.forEach((qItem, idx) => {
      const card = document.createElement("div");
      card.className = "quiz-card";
      card.id = `qcard_${qItem.id}`;

      let optionsHtml = "";
      qItem.options.forEach(opt => {
        optionsHtml += `
          <label class="quiz-option-label" id="lbl_${qItem.id}_${opt.k}">
            <input type="radio" name="${qItem.id}" value="${opt.k}">
            <span><strong>${opt.k.toUpperCase()}.</strong> ${escapeHtml(opt.text)}</span>
          </label>
        `;
      });

      card.innerHTML = `
        <div class="quiz-q-header">
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="q-num-badge">Q${idx + 1}</span>
            <span class="q-category-tag">${escapeHtml(qItem.cat)}</span>
          </div>
        </div>
        <div class="quiz-q-text">${escapeHtml(qItem.q)}</div>
        <div class="quiz-options">
          ${optionsHtml}
        </div>
        <div class="q-explanation" id="exp_${qItem.id}">
          <strong>💡 Solution Analysis:</strong> ${escapeHtml(qItem.exp)}
        </div>
      `;

      container.appendChild(card);
    });

    document.querySelectorAll('#quizForm input[type="radio"]').forEach(radio => {
      radio.addEventListener("change", updateQuizProgress);
    });

    updateQuizProgress();
  }

  function updateQuizProgress() {
    let answered = 0;
    quizQuestions.forEach(q => {
      const checked = document.querySelector(`input[name="${q.id}"]:checked`);
      const card = $(`qcard_${q.id}`);
      if (checked) {
        answered++;
        if (card) card.classList.add("answered");
      } else {
        if (card) card.classList.remove("answered");
      }
    });

    const percent = Math.round((answered / quizQuestions.length) * 100);
    if ($("quizProgressText")) $("quizProgressText").innerHTML = `Answered: <strong>${answered} / ${quizQuestions.length}</strong>`;
    if ($("quizProgressBar")) $("quizProgressBar").style.width = `${percent}%`;
  }

  function evaluateQuiz() {
    let score = 0;
    quizQuestions.forEach(q => {
      const selected = document.querySelector(`input[name="${q.id}"]:checked`);
      const expBox = $(`exp_${q.id}`);
      if (expBox) expBox.classList.add("visible");

      q.options.forEach(opt => {
        const lbl = $(`lbl_${q.id}_${opt.k}`);
        if (!lbl) return;

        lbl.classList.remove("correct-choice", "wrong-choice");

        if (opt.k === q.correct) {
          lbl.classList.add("correct-choice");
        } else if (selected && selected.value === opt.k) {
          lbl.classList.add("wrong-choice");
        }
      });

      if (selected && selected.value === q.correct) {
        score++;
      }
    });

    const resultsCard = $("quizResultsCard");
    const scoreText = $("quizScoreText");
    const badge = $("quizBadge");
    const scoreMsg = $("quizScoreMessage");

    const total = quizQuestions.length;
    const percentage = Math.round((score / total) * 100);

    if (resultsCard && scoreText && badge) {
      resultsCard.style.display = "block";
      scoreText.textContent = `${score} / ${total} (${percentage}%)`;

      if (percentage >= 90) {
        badge.textContent = "🏆 Outstanding Mastery · Grade: A+";
        badge.style.background = "#dcfce7";
        badge.style.color = "#15803d";
        scoreMsg.textContent = "Exemplary performance! You possess an advanced mastery of RSA number theory, modular proofs, and cryptographic attacks.";
      } else if (percentage >= 75) {
        badge.textContent = "🌟 Very Good · Grade: A";
        badge.style.background = "#dbeafe";
        badge.style.color = "#1d4ed8";
        scoreMsg.textContent = "Strong conceptual grasp! Review the few missed analytical questions below to solidify your understanding.";
      } else if (percentage >= 50) {
        badge.textContent = "👍 Satisfactory · Grade: B";
        badge.style.background = "#fef3c7";
        badge.style.color = "#b45309";
        scoreMsg.textContent = "Good foundation. Examine the detailed solution analysis boxes below to understand attack vectors and Extended Euclidean steps.";
      } else {
        badge.textContent = "📖 Needs Review · Grade: C";
        badge.style.background = "#fee2e2";
        badge.style.color = "#b91c1c";
        scoreMsg.textContent = "We recommend revisiting the Theory and Procedure sections to strengthen your grasp of modular arithmetic and RSA proofs.";
      }

      resultsCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function resetQuiz() {
    document.querySelectorAll('#quizForm input[type="radio"]').forEach(r => r.checked = false);
    document.querySelectorAll(".quiz-option-label").forEach(l => l.classList.remove("correct-choice", "wrong-choice"));
    document.querySelectorAll(".q-explanation").forEach(e => e.classList.remove("visible"));
    document.querySelectorAll(".quiz-card").forEach(c => c.classList.remove("answered"));
    if ($("quizResultsCard")) $("quizResultsCard").style.display = "none";
    updateQuizProgress();
  }

  $("submitQuizBtn")?.addEventListener("click", evaluateQuiz);
  $("resetQuizBtn")?.addEventListener("click", resetQuiz);

  // ==========================================
  // INITIALIZATION ON LOAD
  // ==========================================
  renderQuiz();
  resetToExample();

})();
