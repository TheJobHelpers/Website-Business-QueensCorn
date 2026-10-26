// Sets up a SUPER ADMIN's sign-in for the owner dashboard: their password (stored only as a hash),
// the secret for their authenticator app, and ten one-time backup codes. Super admins live in the
// server settings, so they can never be removed or locked out from the dashboard. Everyone else is
// added from the dashboard (Admins & activity > Add admin) and gets an invite link instead.
//
//   node scripts/admin-account.mjs
//
// Run it in your own terminal. It prints their backup codes and the ADMIN_<n>_* settings to put in
// Vercel (and .env.local). Give the person their email, password and backup codes: at their first
// sign-in the website shows a QR code to add the dashboard to their authenticator app.
// Re-run it for the same number to replace a lost phone (the next sign-in shows a new QR code)
// or a forgotten password.
// Formats must match src/server/auth/password.ts and src/server/auth/totp.ts.
import crypto from 'node:crypto';
import readline from 'node:readline';

const SCRYPT = { log2N: 17, r: 8, p: 1 };
const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
// no I, O, 0 or 1: easy to read off paper
const BACKUP_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
let hidden = false;
rl._writeToOutput = (text) => {
  if (!hidden || text.includes(':')) process.stdout.write(text);
};
const ask = (question, { secret = false } = {}) =>
  new Promise((resolve) => {
    hidden = secret;
    rl.question(question, (answer) => {
      if (secret) process.stdout.write('\n');
      hidden = false;
      resolve(answer.trim());
    });
  });

function base32(bytes) {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

function backupCode() {
  const bytes = crypto.randomBytes(10);
  const chars = [...bytes].map((b) => BACKUP_ALPHABET[b % BACKUP_ALPHABET.length]).join('');
  return `${chars.slice(0, 5)}-${chars.slice(5)}`;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const N = 2 ** SCRYPT.log2N;
  const hash = crypto.scryptSync(password, salt, 64, { N, r: SCRYPT.r, p: SCRYPT.p, maxmem: 256 * N * SCRYPT.r });
  return `scrypt.${SCRYPT.log2N}.${SCRYPT.r}.${SCRYPT.p}.${salt.toString('base64url')}.${hash.toString('base64url')}`;
}

const fail = (message) => {
  console.error(`\n${message}`);
  rl.close();
  process.exit(1);
};

console.log("\nThe Queen's Corn: set up a super admin sign-in\n");

const slot = (await ask('Account number, 1 to 9 (each person has their own) [1]: ')) || '1';
if (!/^[1-9]$/.test(slot)) fail('Use a number from 1 to 9.');

const email = (await ask('Their email: ')).toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('That does not look like an email address.');

const password = await ask('Password (at least 12 characters; a few random words is good): ', { secret: true });
if (password.length < 12) fail('Too short: use at least 12 characters.');
if (password.toLowerCase().includes(email.split('@')[0])) fail('Do not use the email name inside the password.');
if ((await ask('Same password again: ', { secret: true })) !== password) fail('The two passwords are different.');

const key = base32(crypto.randomBytes(20));

const codes = Array.from({ length: 10 }, backupCode);
const codeHashes = codes.map((code) => crypto.createHash('sha256').update(code.replace('-', '')).digest('hex'));
rl.close();

console.log(`
Done. Give ${email} their password and these backup codes. Each code signs in ONCE if the phone
is lost; they should keep them somewhere safe, away from the phone:

  ${codes.slice(0, 5).join('    ')}
  ${codes.slice(5).join('    ')}

Server settings for Vercel (Settings > Environment Variables, mark them Sensitive, then redeploy)
and for .env.local. They replace any earlier ADMIN_${slot}_* values:

ADMIN_${slot}_EMAIL=${email}
ADMIN_${slot}_PASSWORD_HASH=${hashPassword(password)}
ADMIN_${slot}_TOTP_SECRET=${key}
ADMIN_${slot}_BACKUP_CODES=${codeHashes.join(',')}

If these are not set yet, use these new ones. Changing ADMIN_SESSION_SECRET signs everyone out;
changing ADMIN_DATA_KEY makes every admin added from the dashboard set up again, so set it once:

ADMIN_SESSION_SECRET=${crypto.randomBytes(48).toString('base64url')}
ADMIN_DATA_KEY=${crypto.randomBytes(32).toString('base64url')}

At their first sign-in (email + password, code left empty) the website shows the QR code to scan.
`);
