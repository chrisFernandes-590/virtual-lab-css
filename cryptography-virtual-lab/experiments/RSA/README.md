# RSA Encryption and Decryption — Virtual Lab Module

## Overview
- **Experiment:** RSA Encryption and Decryption
- **Experiment ID:** `EXP-RSA`
- **Course:** Cryptography & System Security (SEM V)
- **Folder:** `/experiments/RSA/`
- **Entry File:** `index.html`

## Features & Improvements
1. **Vertical Left Navigation Bar:**
   - Permanent left vertical sidebar on desktop with subtle active indicator bar, icons, section badges, and engine status indicators.
   - Smooth, responsive mobile drawer toggle.
2. **Dedicated Aim & Theory Sections:**
   - **Aim Section:** Core premise, learning objectives, prerequisites, and expected outcomes.
   - **Theory Section:** Asymmetric cryptography overview, Euler's totient function $\phi(n)$, Extended Euclidean Algorithm, key generation derivation, formal decryption correctness proof ($m^{ed} \equiv m \pmod n$) using Euler's theorem & Chinese Remainder Theorem, and analysis of Textbook RSA vs Modern RSA-OAEP.
3. **Interactive Lab Workbench:**
   - Interactive key generation ($p, q, e$) with live prime and coprimality verification.
   - Plaintext encryption and modular exponential decryption.
   - Live byte-level calculation trace table with expandable arithmetic rows.
4. **Enhanced Interactive Simulation:**
   - Interactive character token stream bar (click any token to inspect its encryption/decryption).
   - Animated 5-stage pipeline: Plaintext $\to$ Public Key Encryption $\to$ Ciphertext in Transit $\to$ Private Key Decryption $\to$ Recovered Message.
   - Play/Pause, Step Forward, Step Backward, Reset, Speed selector (0.5x, 1x, 2x), and Preset chips.
   - Real-time arithmetic inspector breakdown.
5. **Advanced 20-Question Academic Quiz:**
   - 20 challenging questions covering number theory, key generation, security vulnerabilities (Wiener's attack, Common Modulus, Håstad's broadcast, Fermat factorization), OAEP padding, and timing blinding.
   - Progress bar tracker.
   - Detailed mathematical solution analysis for each question upon submission.
6. **Assessment & Viva Voce:**
   - Analytical viva questions with collapsible answers and verified test cases.

## File Structure
- `index.html` — Complete semantic interface and layout.
- `style.css` — Modern scholarly design system, left vertical sidebar layout, simulation styles, and quiz components.
- `script.js` — BigInt RSA mathematics, tab router, interactive simulation visualizer, and 20-question quiz engine.
- `README.md` — Documentation and verification details.

## Technology
- HTML5 & Vanilla CSS3 (Custom design system, no bulky UI framework dependencies)
- Vanilla JavaScript (ES6+ with native `BigInt` for arbitrary precision arithmetic)
