# Persistent Next.js Dev Server Setup

This document describes how to set up and maintain a persistent Next.js development server that continues running even when your IDE or terminal is closed.

## Overview

The setup consists of two main scripts:
1. `keep-server-running.sh` - Manages the Next.js dev server as a background process
2. `cron-setup.sh` - Creates a cron job to ensure the server stays running

## Quick Start

```bash
# Start the server
./keep-server-running.sh start

# Check server status
./keep-server-running.sh status

# View server logs
./keep-server-running.sh logs

# Stop the server
./keep-server-running.sh stop

# Set up automatic restart via cron
./cron-setup.sh
```

## Installation Details

### Prerequisites
- Node.js and npm installed
- Next.js project
- macOS or Linux environment

### Script Components

#### keep-server-running.sh

This script manages the Next.js development server:

- **Start**: Launches the Next.js dev server as a background process
- **Stop**: Terminates any running Next.js processes
- **Restart**: Stops and starts the server
- **Status**: Checks if the server is running
- **Logs**: Displays the most recent server logs

The script uses `nohup` to ensure the process continues running even after the terminal is closed.

#### cron-setup.sh

This script sets up a cron job that checks the server status every 10 minutes and restarts it if necessary.

## Technical Implementation

### Process Management

The server is run as a background process using `nohup` and its process ID (PID) is stored for later reference. The script uses `ps` and `grep` to detect if the server is still running.

### Logging

All server output is redirected to log files in the `logs` directory, allowing you to troubleshoot issues even if they occurred when you weren't actively monitoring the server.

## Challenges and Solutions

### Challenge 1: Process Detection

**Issue**: Reliably detecting if the Next.js server is still running.

**Solution**: We use a combination of process checking techniques:
```bash
ps aux | grep "[n]ode.*next dev"
```
The `[n]` notation prevents the grep command itself from appearing in the results.

### Challenge 2: Process Cleanup

**Issue**: Orphaned processes could remain after stopping the server.

**Solution**: The stop function uses `pkill` to ensure all related processes are terminated:
```bash
pkill -f "node.*next dev"
```

### Challenge 3: Log Management

**Issue**: Server logs could grow very large over time.

**Solution**: The `view_logs` function only shows the most recent entries. Consider implementing log rotation for long-term use.

## Reinstallation / Redeployment Notes

If you need to reinstall or redeploy this setup, follow these steps:

1. **Check for running processes**:
   ```bash
   ps aux | grep "node.*next"
   ```
   
2. **Kill any existing processes**:
   ```bash
   pkill -f "node.*next dev"
   ```
   
3. **Check for existing cron jobs**:
   ```bash
   crontab -l | grep keep-server-running
   ```
   
4. **Remove existing cron jobs if needed**:
   ```bash
   crontab -l | grep -v "keep-server-running" | crontab -
   ```
   
5. **Reinstall the scripts** from the backup directory if needed:
   ```bash
   cp server-scripts-backup/* .
   chmod +x keep-server-running.sh cron-setup.sh
   ```

## Troubleshooting

### Server Not Starting

1. Check for port conflicts:
   ```bash
   lsof -i :3000
   ```
   
2. Verify the Next.js installation:
   ```bash
   npm list next
   ```
   
3. Check the logs for specific errors:
   ```bash
   ./keep-server-running.sh logs
   ```

### Server Crashing

If the server keeps crashing, check:

1. Available memory and CPU resources
2. Project dependencies and compatibility
3. Recent code changes that might cause instability

## Maintenance

- **Log Rotation**: Consider implementing log rotation to prevent logs from growing too large
- **Monitoring**: Set up additional monitoring if needed for production-like environments
- **Updates**: When updating Next.js, test that the persistent server still works correctly

## Backup and Recovery

The scripts are backed up in the `server-scripts-backup` directory. If you need to restore them:

```bash
cp server-scripts-backup/* .
chmod +x keep-server-running.sh cron-setup.sh
```
