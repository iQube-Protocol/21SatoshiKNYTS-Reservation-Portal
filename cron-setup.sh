#!/bin/bash

# This script sets up a cron job to ensure the Next.js dev server stays running

# Get the absolute path to the project directory
PROJECT_DIR="/Users/hal1/CascadeProjects/qrypto-reservation"
SERVER_SCRIPT="$PROJECT_DIR/keep-server-running.sh"

# Create a temporary crontab file
TEMP_CRON=$(mktemp)

# Export the current crontab
crontab -l > "$TEMP_CRON" 2>/dev/null

# Check if the cron job already exists
if grep -q "$SERVER_SCRIPT" "$TEMP_CRON"; then
  echo "Cron job already exists. No changes made."
else
  # Add our cron job to run every 10 minutes
  echo "# Check and restart Next.js dev server every 10 minutes if needed" >> "$TEMP_CRON"
  echo "*/10 * * * * cd $PROJECT_DIR && $SERVER_SCRIPT restart > /dev/null 2>&1" >> "$TEMP_CRON"
  
  # Install the new crontab
  crontab "$TEMP_CRON"
  echo "Cron job installed. The server will be checked every 10 minutes."
fi

# Clean up
rm "$TEMP_CRON"

echo "To manually check server status: $SERVER_SCRIPT status"
echo "To manually start the server: $SERVER_SCRIPT start"
echo "To manually stop the server: $SERVER_SCRIPT stop"
echo "To view server logs: $SERVER_SCRIPT logs"
