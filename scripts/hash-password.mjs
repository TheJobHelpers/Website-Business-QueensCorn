// Turns a password into the ADMIN_PASSWORD_HASH format, so the password itself never has to be
// stored in an environment variable.
//
//   node scripts/hash-password.mjs
//
// It asks for the password (nothing is echoed or saved) and prints the hash to copy into
// ADMIN_PASSWORD_HASH. Must match parsePasswordHash() in src/server/auth/config.ts.
import crypto from 'node:crypto';
import readline from 'node:readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
// hide what is typed
rl._writeToOutput = (text) => {
  if (text.includes('Password')) process.stdout.write(text);
};

rl.question('Password (at least 12 characters): ', (password) => {
  rl.close();
  process.stdout.write('\n');
  if (password.length < 12) {
    console.error('Too short: use at least 12 characters.');
    process.exit(1);
  }
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  console.log(`ADMIN_PASSWORD_HASH=scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`);
});
