#!/bin/bash

BASE_URL="http://127.0.0.1:5001/api"

echo "1. Testing Lead Generation..."
GEN_RES=$(curl -s -X POST "$BASE_URL/leads/generate")
echo "Response: $GEN_RES"

LEAD_ID=$(echo $GEN_RES | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$LEAD_ID" ]; then
  echo "FAILURE: Could not generate lead."
  exit 1
else
  echo "SUCCESS: Generated Lead ID: $LEAD_ID"
fi

echo "--------------------------------"

echo "2. Testing Lead Status Update..."
UPDATE_RES=$(curl -s -X PUT "$BASE_URL/leads/$LEAD_ID/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"qualified"}')
echo "Response: $UPDATE_RES"

NEW_STATUS=$(echo $UPDATE_RES | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ "$NEW_STATUS" == "qualified" ]; then
  echo "SUCCESS: Lead status updated to 'qualified'."
else
  echo "FAILURE: Lead status update failed. Got: $NEW_STATUS"
fi

echo "--------------------------------"
echo "Verification Complete."
