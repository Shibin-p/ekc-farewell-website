# Firebase/Firestore Setup Guide

## Overview
This document outlines the required Firestore collections, document structures, security rules, and data validation for the Farewell Invitation web application.

---

## Firestore Schema

### 1. RSVPs Collection

**Collection Name:** `rsvps`

**Document Structure:**
```json
{
  "name": "string",
  "department": "string (CSE|ECE|ME|SFE|CE)",
  "phone": "string (10-12 digits)",
  "attending": "boolean",
  "timestamp": "Firestore Timestamp"
}
```

**Example Documents:**
```json
{
  "name": "John Doe",
  "department": "CSE",
  "phone": "9876543210",
  "attending": true,
  "timestamp": "2026-06-22T10:30:00Z"
}

{
  "name": "Jane Smith",
  "department": "ECE",
  "phone": "9988776655",
  "attending": false,
  "timestamp": "2026-06-22T11:45:00Z"
}
```

**Important Notes:**
- ✅ **DO** use `attending` as a boolean (true/false only)
- ❌ **DO NOT** use string values like "attending", "not_attending", "yes", "no", etc.
- ❌ **DO NOT** store a `guests` field
- ❌ **DO NOT** use an `attendance` field with string values
- All new documents should follow this schema exactly

---

### 2. Website Statistics Collection

**Collection Name:** `website_stats`

**Document ID:** `general`

**Document Structure:**
```json
{
  "totalVisits": "number",
  "uniqueVisits": "number",
  "totalRSVPs": "number",
  "attendingCount": "number",
  "notAttendingCount": "number"
}
```

**Example Document:**
```json
{
  "totalVisits": 1250,
  "uniqueVisits": 840,
  "totalRSVPs": 350,
  "attendingCount": 280,
  "notAttendingCount": 70
}
```

**Automatic Updates:**
- `totalVisits`: Incremented on every page visit
- `uniqueVisits`: Incremented only for new visitors (tracked via localStorage UUID)
- `totalRSVPs`: Incremented when RSVP is submitted
- `attendingCount`: Incremented when RSVP with attending=true is submitted
- `notAttendingCount`: Incremented when RSVP with attending=false is submitted

---

## Firestore Security Rules

Add these rules to your Firestore security rules configuration (Firebase Console → Firestore → Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ─── Public collections (everyone can read) ─────────────────────────
    match /website_stats/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // ─── RSVPs collection (public read for dashboard, restricted write) ───
    match /rsvps/{document=**} {
      allow read: if true;
      allow create: if request.auth != null || validateRsvpData(request.resource.data);
      allow update, delete: if false;
      
      // Validation function for RSVP data
      function validateRsvpData(data) {
        return data.keys().hasAll(['name', 'department', 'phone', 'attending', 'timestamp']) &&
               data.size() == 5 &&
               data.name is string &&
               data.name.size() > 0 &&
               data.department in ['CSE', 'ECE', 'ME', 'SFE', 'CE'] &&
               data.phone is string &&
               data.phone.size() >= 10 &&
               data.phone.size() <= 12 &&
               data.attending is bool &&
               data.timestamp is timestamp;
      }
    }
    
    // ─── Analytics collection (internal use only) ─────────────────────────
    match /analytics/{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Key Rules:**
- `website_stats` is public read-only (no writes from client)
- `rsvps` allows public write for new submissions (creates)
- `rsvps` validates that data contains exactly 5 required fields
- No updates or deletes allowed on `rsvps` (data integrity)
- All writes must use the clean schema (no guests, no attendance strings)

---

## Data Migration (Backward Compatibility)

If your Firestore contains old documents with legacy fields:

**Old Format (❌ NOT recommended):**
```json
{
  "name": "Old Submission",
  "department": "CSE",
  "phone": "9876543210",
  "attendance": "attending",  // ❌ String field
  "guests": 0,               // ❌ Guests field
  "timestamp": "..."
}
```

**The application automatically handles this:**
- Admin Dashboard reads both formats
- String `attendance` values are converted to boolean:
  - "attending", "yes", "true", "present" → `true`
  - "not_attending", "no", "false", "absent" → `false`
- Legacy `guests` field is ignored (not displayed)
- **New submissions always use the clean schema**

---

## Firebase Authentication Setup

### Enable Authentication Methods

In Firebase Console → Authentication → Sign-in method:

1. **Enable Email/Password authentication**
2. Create admin user(s):
   - Email: admin@ekc.edu (or your preferred email)
   - Password: (secure password)
   - Set custom claims if needed (optional)

### Admin Access

To access the admin dashboard:
- URL: `#/admin` or `#admin` or `/admin`
- Login with Firebase-authenticated email/password

---

## Permissions & Error Handling

### Common Permission Errors

If you see `FirebaseError: Missing or insufficient permissions`:

1. **Check Firestore Security Rules:** Ensure rules allow the operation
2. **Verify Collection Names:** Must match exactly (case-sensitive)
   - ✅ Correct: `rsvps`, `website_stats`
   - ❌ Wrong: `RSVPS`, `websiteStats`, `stats`
3. **Check Authentication:** For admin operations, user must be authenticated

### Resolution Steps

```
1. Go to Firebase Console
2. Open Firestore Database
3. Click "Rules" tab
4. Copy the security rules from this document
5. Click "Publish"
6. Wait 30 seconds for changes to propagate
7. Refresh your app
```

---

## Real-Time Updates

The application uses Firestore snapshot listeners to keep the Admin Dashboard synchronized:

```javascript
// Statistics listener (real-time)
onSnapshot(doc(db, "website_stats", "general"), (snapshot) => {
  // Updates when stats document changes
});

// RSVPs listener (real-time)
onSnapshot(query(collection(db, "rsvps"), orderBy("timestamp", "desc")), (snapshot) => {
  // Updates when RSVP collection changes
});
```

**Updates propagate automatically:**
- User submits RSVP form
- Document added to `rsvps` collection
- Statistics document updated (totalRSVPs, attendingCount, etc.)
- Admin Dashboard listener fires
- Statistics cards update in real-time (no manual refresh needed)

---

## Validation & Data Integrity

### RSVP Form Validation

**Client-side validation:**
- Name: Required, non-empty string
- Department: Required, must be CSE|ECE|ME|SFE|CE
- Phone: Required, 10-12 digits
- Attendance: Required, must select "Attending" or "Cannot Attend"

**Server-side validation (Firestore Rules):**
- Document must contain exactly 5 fields
- All fields must match specified types
- Attendance must be boolean only

### No Guests Field

The "Additional Guests" field has been completely removed:
- ❌ Not in RSVP form UI
- ❌ Not stored in Firestore
- ❌ Not validated
- ✅ Backward compatible with old data (ignored if present)

---

## Monitoring & Logging

The application logs all important operations:

```javascript
// RSVP Submission
console.log("[RSVP] Submission successful, docId: ...");
console.log("[RSVP] Stats updated successfully");
console.warn("[RSVP] Stats update failed (non-blocking): ...");
console.error("[RSVP] Submission error: ...");

// Analytics Tracking
console.log("[Analytics] Visitor tracked successfully");
console.warn("[Analytics] Visitor tracking failed: ...");

// Admin Dashboard
console.log("[Admin] User logged in: admin@ekc.edu");
console.log("[Admin] Stats snapshot error: ...");
console.error("[Admin] Login error: ...");
```

**View logs in browser console:**
- Open Developer Tools (F12)
- Go to Console tab
- Look for `[RSVP]`, `[Admin]`, `[Analytics]` prefixes

---

## Troubleshooting

### Statistics Not Updating

**Symptoms:** Stats cards show old values, don't update when new RSVP submitted

**Fixes:**
1. Verify Firestore Rules are published
2. Check browser console for errors (F12)
3. Refresh admin dashboard
4. Verify stats document exists: `website_stats/general`
5. Check Firebase project connection in `src/firebase.js`

### Visitor Analytics Error

**Symptoms:** Console shows permission errors for analytics

**Fixes:**
1. Verify `website_stats` collection exists and is readable
2. Check Firestore Rules allow read on `website_stats/*`
3. Ensure localStorage is available in browser
4. Check browser privacy settings (incognito mode may affect localStorage)

### RSVP Submission Fails

**Symptoms:** User clicks submit, sees error, RSVP not saved

**Fixes:**
1. Verify `rsvps` collection can be written to (rules)
2. Check all form fields are valid (name, phone, etc.)
3. Verify Firebase connection is working
4. Check browser console for specific error codes
5. Try clearing browser cache and localStorage

### Admin Login Fails

**Symptoms:** Invalid email/password error, can't access dashboard

**Fixes:**
1. Verify admin user exists in Firebase Authentication
2. Check email and password are correct
3. Verify Email/Password auth is enabled in Firebase Console
4. Check if account is disabled (Firebase Console → Users)
5. Try resetting password if account is locked

---

## Best Practices

1. **Regular Backups:** Periodically export Firestore data
2. **Monitor Costs:** Watch Firestore read/write operations in Firebase Console
3. **Data Cleanup:** Periodically review old RSVP entries (keep for records)
4. **Security:** Never share Firebase config API keys publicly
5. **Testing:** Test on a staging database before production changes
6. **Logging:** Review console logs regularly to catch issues early

---

## Support & Questions

For Firebase documentation:
- https://firebase.google.com/docs/firestore
- https://firebase.google.com/docs/auth

For application issues:
- Check browser console (F12)
- Review logs with `[RSVP]`, `[Admin]`, `[Analytics]` prefixes
- Verify Firestore schema matches this document
- Check Firestore security rules are published
