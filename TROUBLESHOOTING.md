# Toggl Power-Up Troubleshooting Guide

## If You're Getting "Failed to fetch" Error

This usually happens during setup. Here's what to check:

### Step 1: Verify Your API Token

1. Go to https://track.toggl.com/profile
2. Scroll to the bottom → **API Token** section
3. Click "Click to reveal" 
4. Copy the ENTIRE token (should be 32 characters long)
5. Example format: `1234567890abcdef1234567890abcdef`

**Common Mistakes:**
- ❌ Copying only part of the token
- ❌ Including extra spaces before/after
- ❌ Copying "API Token:" text along with the token

### Step 2: Verify Your Workspace ID

1. Go to https://track.toggl.com/timer
2. Look at the URL in your browser
3. It should show: `https://track.toggl.com/timer?workspace=1234567`
4. Copy ONLY the number after `workspace=`

**OR:**

1. Go to https://track.toggl.com/profile
2. Under workspaces, find your workspace
3. The ID is shown next to the workspace name

**Common Mistakes:**
- ❌ Copying the workspace name instead of ID
- ❌ Including "workspace=" text
- ❌ Using letters instead of numbers

### Step 3: Updated Setup Process

The setup has been simplified! Now it:
1. ✅ Saves your credentials without verification
2. ✅ Tests them when you actually start a timer
3. ✅ Shows better error messages if something's wrong

### Step 4: Test Your Setup

After saving your credentials:

1. Close the setup popup
2. Click "Start Timer" button on the card
3. Check what happens:

**If timer starts:** 
- ✅ Everything is working! Check Toggl Track to see your running timer.

**If you see "Invalid API token" error:**
- ❌ Your API token is wrong. Re-copy it from Toggl.

**If you see "Access denied" error:**
- ❌ Your Workspace ID is wrong, or you don't have access to that workspace.

**If you see "Toggl API error: 400":**
- ❌ Something's wrong with the request format. Check workspace ID is just numbers.

### Step 5: Check Browser Console

If still having issues:

1. Open browser console (F12 or Cmd+Option+I)
2. Click the **Console** tab
3. Try starting a timer again
4. Look for red error messages
5. Take a screenshot and check what it says

**Common Console Errors:**

**"CORS error"** or "blocked by CORS policy":
- This means your browser is blocking the request
- Try disabling browser extensions (especially privacy/security ones)
- Check if your hosting supports CORS

**"Failed to fetch"**:
- Network issue or API endpoint problem
- Check your internet connection
- Try again in a few minutes

**"401 Unauthorized"**:
- Wrong API token
- Re-generate a new token in Toggl

**"403 Forbidden"**:
- Wrong workspace ID
- Or you don't have permission to create timers in that workspace

### Step 6: Double-Check File Upload

Make sure all 4 files are uploaded to GitHub Pages:
- ✅ index.html
- ✅ trello-toggl-powerup.js (updated version!)
- ✅ setup.html (updated version!)
- ✅ settings.html

After uploading the updated files:
1. Wait 1-2 minutes for GitHub Pages to update
2. Hard refresh Trello (Ctrl+F5 or Cmd+Shift+R)
3. Try the setup again

### Step 7: Try the API Directly

To verify your credentials work outside of Trello:

1. Open https://httpie.io/app (or use Postman)
2. Make a GET request to: `https://api.track.toggl.com/api/v9/me`
3. Add header: `Authorization: Basic YOUR_ENCODED_TOKEN`
   - To encode: use https://www.base64encode.org/
   - Encode this text: `YOUR_API_TOKEN:api_token`
   - Example: `1234...abcd:api_token` → `MTIzNC4uLmFiY2Q6YXBpX3Rva2Vu`
4. Send the request

**If this works:** Your credentials are correct, issue is with the Power-Up
**If this fails:** Your credentials are wrong

### Still Not Working?

Upload the updated files from this troubleshooting session:
- `setup.html` - Now skips verification during setup
- `trello-toggl-powerup.js` - Better error messages

The Power-Up will now:
1. Save your settings without testing them first
2. Test them when you click "Start Timer"
3. Show you exactly what's wrong if it fails

### Getting More Help

If you're still stuck, provide:
1. Screenshot of the error message
2. Screenshot of browser console (F12)
3. Confirmation that you're using the correct API token format
4. Confirmation that workspace ID is just numbers

---

**Quick Test Checklist:**

- [ ] API token is 32 characters long
- [ ] Workspace ID is only numbers (e.g., 1234567)
- [ ] All 4 files uploaded to GitHub Pages
- [ ] Iframe connector URL ends with `/index.html`
- [ ] Waited 1-2 minutes after uploading files
- [ ] Hard refreshed Trello (Ctrl+F5)
- [ ] Checked browser console for errors
- [ ] Tried starting a timer (not just setup)