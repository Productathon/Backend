#!/bin/bash

BASE_URL="http://127.0.0.1:5001/api"

echo "1. Fetching Accounts..."
ACCOUNTS=$(curl -s "$BASE_URL/accounts")
ACCOUNT_ID=$(echo $ACCOUNTS | node -e "console.log(JSON.parse(fs.readFileSync(0)).data[0]._id)")
ACCOUNT_NAME=$(echo $ACCOUNTS | node -e "console.log(JSON.parse(fs.readFileSync(0)).data[0].company)")

if [ -z "$ACCOUNT_ID" ] || [ "$ACCOUNT_ID" == "undefined" ]; then
  echo "Error: No accounts found. Seed the database first."
  exit 1
fi

echo "Selected Account: $ACCOUNT_NAME ($ACCOUNT_ID)"

echo -e "\n2. Creating Contract..."
CREATE_RES=$(curl -s -X POST "$BASE_URL/contracts" \
  -H "Content-Type: application/json" \
  -d "{\"account\":\"$ACCOUNT_ID\", \"title\":\"Test Contract\", \"value\":10000, \"content\":\"Terms and conditions...\"}")

TOKEN=$(echo $CREATE_RES | node -e "console.log(JSON.parse(fs.readFileSync(0)).data.token)")
CONTRACT_ID=$(echo $CREATE_RES | node -e "console.log(JSON.parse(fs.readFileSync(0)).data._id)")

if [ -z "$TOKEN" ] || [ "$TOKEN" == "undefined" ]; then
  echo "Error: Failed to create contract."
  echo $CREATE_RES
  exit 1
fi

echo "Contract Created! ID: $CONTRACT_ID"
echo "Token: $TOKEN"

echo -e "\n3. Verifying 'Contract Sent' Activity..."
ACTIVITIES=$(curl -s "$BASE_URL/activities/$ACCOUNT_ID")
HAS_SENT=$(echo $ACTIVITIES | node -e "console.log(JSON.parse(fs.readFileSync(0)).data.some(a => a.type === 'Contract Sent' && a.metadata.contractId === '$CONTRACT_ID'))")

if [ "$HAS_SENT" == "true" ]; then
  echo "SUCCESS: 'Contract Sent' activity found."
else
  echo "FAILURE: 'Contract Sent' activity NOT found."
fi

echo -e "\n4. Fetching Public Contract..."
PUBLIC_RES=$(curl -s "$BASE_URL/contracts/$TOKEN")
STATUS=$(echo $PUBLIC_RES | node -e "console.log(JSON.parse(fs.readFileSync(0)).data.status)")

if [ "$STATUS" == "Viewed" ] || [ "$STATUS" == "Sent" ]; then
  echo "SUCCESS: Contract fetched. Status: $STATUS"
else
  echo "FAILURE: Contract fetch failed or wrong status. Status: $STATUS"
fi

echo -e "\n5. Signing Contract..."
# Dummy base64 signature (small red dot)
SIGNATURE_DATA="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
SIGN_RES=$(curl -s -X POST "$BASE_URL/contracts/$TOKEN/sign" \
  -H "Content-Type: application/json" \
  -d "{\"signature\":\"$SIGNATURE_DATA\"}")

NEW_STATUS=$(echo $SIGN_RES | node -e "console.log(JSON.parse(fs.readFileSync(0)).data.status)")
SAVED_SIG=$(echo $SIGN_RES | node -e "console.log(JSON.parse(fs.readFileSync(0)).data.signature)")

if [ "$NEW_STATUS" == "Signed" ] && [ "$SAVED_SIG" != "undefined" ]; then
  echo "SUCCESS: Contract signed and signature saved."
else
  echo "FAILURE: Contract sign failed. Status: $NEW_STATUS, Sig: $SAVED_SIG"
fi

echo -e "\n6. Verifying 'Contract Signed' Activity..."
ACTIVITIES_AFTER=$(curl -s "$BASE_URL/activities/$ACCOUNT_ID")
HAS_SIGNED=$(echo $ACTIVITIES_AFTER | node -e "console.log(JSON.parse(fs.readFileSync(0)).data.some(a => a.type === 'Contract Signed'))")

if [ "$HAS_SIGNED" == "true" ]; then
  echo "SUCCESS: 'Contract Signed' activity found."
else
  echo "FAILURE: 'Contract Signed' activity NOT found."
fi

echo -e "\nVerification Complete."
