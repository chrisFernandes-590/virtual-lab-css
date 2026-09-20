# RSA Encryption and Decryption — Virtual Lab Module

## Group
Experiment: RSA Encryption and Decryption  
Experiment ID: EXP-RSA  
Folder: `/experiments/RSA/`  
Entry file: `index.html`  
Navigation title: `RSA Encryption and Decryption`

## Assigned scope
The faculty allotment specifies:
1. Generate keys
2. Encrypt/decrypt messages

This module implements both requirements and adds theory, procedure, calculation visualization, evaluation questions, test cases, and a quiz.

## Files
- `index.html` — complete RSA experiment interface and content
- `script.js` — RSA mathematics, encryption/decryption, trace, and quiz logic
- `README.md` — integration and testing information

## Technology
- HTML5
- CSS3
- Vanilla JavaScript
- JavaScript `BigInt`
- No external libraries required

## Inputs
- Prime `p`
- Prime `q`
- Optional public exponent `e`
- Plaintext message

## Outputs
- `n`
- `φ(n)`
- Public key `(e,n)`
- Private key `(d,n)`
- Ciphertext
- Recovered plaintext
- Byte-level calculation trace
- Quiz score

## Algorithm
1. Verify that `p` and `q` are distinct primes.
2. Compute `n = p*q`.
3. Compute `φ(n) = (p-1)(q-1)`.
4. Select `e` such that `1 < e < φ(n)` and `gcd(e, φ(n)) = 1`.
5. Compute `d = e^-1 mod φ(n)`.
6. Public key is `(e,n)`.
7. Private key is `(d,n)`.
8. Convert plaintext to UTF-8 bytes.
9. Encrypt each byte `m` as `c = m^e mod n`.
10. Decrypt each ciphertext value as `m = c^d mod n`.
11. Convert recovered bytes back to text.

## Example
Using:
- p = 61
- q = 53
- e = 17

The module calculates:
- n = 3233
- φ(n) = 3120
- d = 2753
- Public key = (17, 3233)
- Private key = (2753, 3233)

For a message such as `HELLO`, encryption produces ciphertext values and decryption recovers `HELLO`.

## Important limitation
This is an educational textbook-RSA simulator. It uses small numbers and direct textbook RSA on individual bytes. It is **not secure for real-world cryptography**. Real RSA uses very large keys, secure padding such as OAEP, cryptographically secure key generation, and a proper cryptographic library.

## Test cases
### Test 1
p=61, q=53, e=17, message=`HELLO`  
Expected: decrypted output is `HELLO`.

### Test 2
p=61, q=53, automatic e, message=`RSA`  
Expected: decrypted output is `RSA`.

### Test 3
p=47, q=71, e=79, message=`TEST`  
Expected: decrypted output is `TEST`.

## How to integrate
Copy this folder into:
`crypto-virtual-lab/experiments/RSA/`

The integration team can link it as:
`/experiments/RSA/`

Do not modify the main application or another experiment module.

## GitHub workflow
Recommended branch:
`group-rsa`

Commit the RSA module to that branch and open a pull request to `main` for integration.

## Demonstration checklist
1. Explain the aim.
2. Explain p, q, n and φ(n).
3. Generate the public/private key pair.
4. Show the public key.
5. Enter `HELLO RSA`.
6. Encrypt and show ciphertext.
7. Explain one row of the byte-level trace.
8. Decrypt the ciphertext.
9. Show that the original message is recovered.
10. Run the quiz.
11. Be prepared to explain why the sample implementation is educational rather than production-secure.
