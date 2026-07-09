#!/usr/bin/env bash
# End-to-end two-user pairing + chat test against the REAL Firebase backend.
# Prereqs: Firestore database created + firestore.rules published.
# Usage: bash scripts/test-two-users.sh
set -e
API_KEY=AIzaSyBfdY0uYQUPL-IRoJcqxZM7XwAmgtkO2y4
FS="https://firestore.googleapis.com/v1/projects/baewatch-c6aea/databases/(default)/documents"
STAMP=$(date +%s)

signup() {
  curl -s "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$1\",\"password\":\"TestPass123!\",\"returnSecureToken\":true}"
}
field() { echo "$1" | sed -n "s/.*\"$2\": *\"\([^\"]*\)\".*/\1/p"; }

echo "== 1. Create two accounts =="
A=$(signup "pairtest.a.$STAMP@example.com"); A_TOK=$(field "$A" idToken); A_UID=$(field "$A" localId)
B=$(signup "pairtest.b.$STAMP@example.com"); B_TOK=$(field "$B" idToken); B_UID=$(field "$B" localId)
echo "A=$A_UID  B=$B_UID"

echo "== 2. A creates invite code =="
CODE="TEST$STAMP"
curl -s -o /dev/null -w "create invite: HTTP %{http_code}\n" -X PATCH "$FS/invites/$CODE" \
  -H "Authorization: Bearer $A_TOK" -H "Content-Type: application/json" \
  -d "{\"fields\":{\"inviterId\":{\"stringValue\":\"$A_UID\"},\"used\":{\"booleanValue\":false},\"createdAt\":{\"timestampValue\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}}}"

echo "== 3. B redeems: creates relationship =="
REL=$(curl -s -X POST "$FS/relationships" -H "Authorization: Bearer $B_TOK" -H "Content-Type: application/json" \
  -d "{\"fields\":{\"partner1Id\":{\"stringValue\":\"$A_UID\"},\"partner2Id\":{\"stringValue\":\"$B_UID\"},\"inviteCode\":{\"stringValue\":\"$CODE\"},\"createdAt\":{\"timestampValue\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}}}")
RID=$(echo "$REL" | sed -n 's|.*"name": *"projects/[^"]*/relationships/\([^"]*\)".*|\1|p')
echo "relationship: $RID"

echo "== 4. B marks invite used + stamps both user docs =="
curl -s -o /dev/null -w "mark used: HTTP %{http_code}\n" -X PATCH "$FS/invites/$CODE?updateMask.fieldPaths=used&updateMask.fieldPaths=usedById&updateMask.fieldPaths=relationshipId" \
  -H "Authorization: Bearer $B_TOK" -H "Content-Type: application/json" \
  -d "{\"fields\":{\"used\":{\"booleanValue\":true},\"usedById\":{\"stringValue\":\"$B_UID\"},\"relationshipId\":{\"stringValue\":\"$RID\"}}}"
curl -s -o /dev/null -w "B user doc: HTTP %{http_code}\n" -X PATCH "$FS/users/$B_UID?updateMask.fieldPaths=relationshipId" \
  -H "Authorization: Bearer $B_TOK" -H "Content-Type: application/json" \
  -d "{\"fields\":{\"relationshipId\":{\"stringValue\":\"$RID\"}}}"
curl -s -o /dev/null -w "A user doc (cross-write): HTTP %{http_code}\n" -X PATCH "$FS/users/$A_UID?updateMask.fieldPaths=relationshipId" \
  -H "Authorization: Bearer $B_TOK" -H "Content-Type: application/json" \
  -d "{\"fields\":{\"relationshipId\":{\"stringValue\":\"$RID\"}}}"

echo "== 5. Chat: B sends, A reads =="
curl -s -o /dev/null -w "B sends message: HTTP %{http_code}\n" -X POST "$FS/relationships/$RID/messages" \
  -H "Authorization: Bearer $B_TOK" -H "Content-Type: application/json" \
  -d "{\"fields\":{\"senderId\":{\"stringValue\":\"$B_UID\"},\"senderName\":{\"stringValue\":\"TestB\"},\"text\":{\"stringValue\":\"hello from B\"},\"createdAt\":{\"integerValue\":\"$(date +%s%3N)\"}}}"
curl -s "$FS/relationships/$RID/messages" -H "Authorization: Bearer $A_TOK" | grep -o '"text".*"hello from B"' \
  && echo "A CAN READ B's MESSAGE ✔"

echo "== 6. Security: a STRANGER must be denied =="
C=$(signup "pairtest.c.$STAMP@example.com"); C_TOK=$(field "$C" idToken)
curl -s -o /dev/null -w "stranger reads relationship: HTTP %{http_code} (expect 403)\n" \
  "$FS/relationships/$RID" -H "Authorization: Bearer $C_TOK"
curl -s -o /dev/null -w "stranger lists invites: HTTP %{http_code} (expect 403)\n" \
  "$FS/invites" -H "Authorization: Bearer $C_TOK"

echo "== DONE =="
