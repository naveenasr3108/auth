require('dotenv').config();
const { exec } = require('child_process');

const file = process.argv[2];

if (!file) {
  console.log("Please provide backup file");
  process.exit(1);
}

const command = `psql ${process.env.DATABASE_URL} < ${file}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error("Restore failed:", error);
    return;
  }
  console.log("Database restored from:", file);
});