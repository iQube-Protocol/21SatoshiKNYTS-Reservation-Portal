#!/bin/bash

# Configuration
PROJECT_DIR="/Users/hal1/CascadeProjects/qrypto-reservation"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/dev-server.log"
PID_FILE="$PROJECT_DIR/.dev-server.pid"

# Create logs directory
mkdir -p "$LOG_DIR"

# Function to start the server
start_server() {
  echo "Starting Next.js dev server in persistent mode..."
  
  # Change to project directory
  cd "$PROJECT_DIR"
  
  # Kill any existing Next.js processes
  pkill -f "node.*next dev" || true
  
  # Start the Next.js dev server with nohup
  nohup npm run dev > "$LOG_FILE" 2>&1 &
  
  # Save the PID
  server_pid=$!
  echo $server_pid > "$PID_FILE"
  
  echo "Server started with PID $server_pid"
  echo "Logs are being written to $LOG_FILE"
  echo "Server URL: http://localhost:3000"
  echo "To stop the server: ./keep-server-running.sh stop"
}

# Function to stop the server
stop_server() {
  echo "Stopping Next.js dev server..."
  
  # Kill any running Next.js processes
  pkill -f "node.*next dev" || true
  
  # Remove PID file
  rm -f "$PID_FILE"
  
  echo "Server stopped"
}

# Function to check server status
check_status() {
  # Use ps with grep to find Next.js processes
  if ps aux | grep "[n]ode.*next dev" > /dev/null; then
    echo "Next.js dev server is running"
    echo "Server URL: http://localhost:3000"
    echo "Logs are being written to $LOG_FILE"
    echo "To view logs: ./keep-server-running.sh logs"
  else
    echo "Next.js dev server is not running"
  fi
}

# Function to view logs
view_logs() {
  if [ -f "$LOG_FILE" ]; then
    tail -n 50 "$LOG_FILE"
  else
    echo "Log file does not exist"
  fi
}

# Main script logic
case "$1" in
  start)
    start_server
    ;;
  stop)
    stop_server
    ;;
  restart)
    stop_server
    sleep 2
    start_server
    ;;
  status)
    check_status
    ;;
  logs)
    view_logs
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs}"
    exit 1
    ;;
esac

exit 0
