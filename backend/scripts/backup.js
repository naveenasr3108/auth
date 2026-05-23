require('dotenv').config();
const { exec } = require('child_process');

const backupFile = `backup_${Date.now()}.sql`;

const command = `pg_dump ${process.env.DATABASE_URL} > ${backupFile}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error("Backup failed:", error);
    return;
  }
  console.log("Backup created:", backupFile);
});