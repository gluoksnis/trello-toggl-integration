# Trello Toggl Track Power-Up

A custom Trello Power-Up that integrates Toggl Track time tracking directly into your Trello cards. Start and stop timers without leaving Trello!

## ⚠️ Important: CORS Proxy Required

**Toggl's API blocks direct browser requests** due to CORS restrictions. The Power-Up includes a default proxy (`cors-anywhere.herokuapp.com`) for quick testing, but you'll need to:

1. **For testing:** Visit https://cors-anywhere.herokuapp.com/corsdemo and request access (resets daily)
2. **For production:** Set up your own free proxy (5 minutes) - see **[PROXY_SETUP.md](PROXY_SETUP.md)** 

**Recommended:** Use Cloudflare Workers (free, 5-minute setup)

## ⚠️ Important Note About Hosting

**Glitch is no longer available** for hosting (as of July 2025). Use one of these alternatives instead:
- **GitHub Pages** (recommended - free and easy)
- **Netlify** (free tier available)
- **Vercel** (free tier available)
- **Your own server** with HTTPS

## Features

- ⏱️ **Start/Stop Timers**: Click a button on any card to start or stop a Toggl timer
- 🏷️ **Automatic Tagging**: Timers are automatically tagged with the Trello board name
- ⏲️ **Live Timer Badge**: See your running timer directly on the card
- 📊 **Total Time Tracking**: View total time tracked for each card
- 🔧 **Easy Setup**: Simple configuration with your Toggl API token

## Prerequisites

1. A **Trello account** (free or paid)
2. A **Toggl Track account** (free tier works perfectly!)
3. Your **Toggl API token** and **Workspace ID**
4. Admin access to a Trello Workspace

## Getting Your Toggl Credentials

### API Token
1. Log in to [Toggl Track](https://track.toggl.com)
2. Click your profile picture → **Profile Settings**
3. Scroll down to find your **API Token**
4. Click to reveal and copy it

### Workspace ID
1. In Toggl Track, go to **Settings**
2. Look for your workspace name
3. The Workspace ID is a number (e.g., 1234567)
4. You can also find it in the URL when viewing your workspace: `https://track.toggl.com/timer?workspace=1234567`

## Installation Steps

### Step 1: Host Your Power-Up Files

#### Option A: GitHub Pages (Recommended)

1. **Create a new GitHub repository**
   - Go to [GitHub](https://github.com) and create a new public repository
   - Name it something like `trello-toggl-powerup`

2. **Upload the files**
   - Upload all 4 files to the repository:
     - `index.html`
     - `trello-toggl-powerup.js`
     - `setup.html`
     - `settings.html`

3. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Under "Source", select "Deploy from a branch"
   - Select the `main` branch and `/ (root)` folder
   - Click Save
   - Wait 1-2 minutes for deployment

4. **Note your URL**
   - Your site will be at: `https://YOUR-USERNAME.github.io/trello-toggl-powerup/`
   - **Important**: This is the base URL. You'll need to add `index.html` later.

#### Option B: Netlify

1. Create account at [Netlify](https://netlify.com)
2. Drag and drop your folder into Netlify
3. Note the provided URL (e.g., `https://your-site.netlify.app`)

#### Option C: Local Testing

```bash
# Install http-server
npm install -g http-server

# Navigate to your folder
cd /path/to/powerup/files

# Start server with CORS enabled
http-server -p 8080 --cors
```

Use `http://localhost:8080/index.html` as your connector URL (only for testing!)

### Step 2: Register Your Power-Up with Trello

1. **Go to the Power-Up Admin Portal**
   - Visit: https://trello.com/power-ups/admin
   - You must be logged into Trello

2. **Select Your Workspace**
   - Choose a Workspace where you're an admin
   - Click on the Workspace name

3. **Create New Power-Up**
   - Click the **"New"** button
   - Fill in the form:

   **Required Fields:**
   - **Name**: `Toggl Track Timer` (or any name you like)
   - **Iframe Connector URL**: Your hosted URL + `/index.html`
     - GitHub Pages example: `https://YOUR-USERNAME.github.io/trello-toggl-powerup/index.html`
     - Netlify example: `https://your-site.netlify.app/index.html`
     - Local example: `http://localhost:8080/index.html`

   **Optional but Recommended:**
   - **Author**: Your name
   - **Support Contact**: Your email

4. **Click "Create"**

### Step 3: Enable Capabilities

After creating your Power-Up:

1. **Go to the Capabilities tab**
2. **Enable these capabilities**:
   - ✅ `card-buttons` - Adds Start/Stop timer buttons to cards
   - ✅ `card-badges` - Shows timer/time on card fronts
   - ✅ `show-settings` - Adds settings option

3. **Click "Save"**

### Step 4: Enable on a Board

1. **Open any Trello board** in the same workspace
2. Click **Show Menu** → **Power-Ups**
3. Click **Custom** tab (you may need to enable custom Power-Ups first)
4. Find your **"Toggl Track Timer"** Power-Up
5. Click **Add**
6. The Power-Up is now active! 🎉

## Using the Power-Up

### First Time Setup (Once Per Board)

Configure Toggl once for the entire board:

1. **Open any card** on the board
2. Look for **"Setup Toggl"** button in the Power-Ups section
3. Click it and enter:
   - Your Toggl API token
   - Your Workspace ID
4. Click **"Save Configuration"**

**That's it!** Now you can start timers from ANY card on this board.

### Alternative: Configure from Board Settings

You can also configure from the Power-Up settings:
1. Board menu → **Power-Ups**
2. Find **"Toggl Track Timer"**
3. Click the gear icon → **Settings**
4. Enter your credentials

### Starting a Timer

1. **Open any card** on the configured board
2. Click **"Start Timer"** button
3. A timer starts in Toggl with:
   - Description: Card name
   - Tags: "trello" + board name
   - Workspace: Your configured workspace

### Stopping a Timer

1. **Open the card** with the running timer
2. Click **"Stop Timer"** button
3. The timer stops and total time is updated

### Viewing Time

- **Running Timer**: Red badge showing live elapsed time (HH:MM:SS)
- **Total Time**: Blue badge showing total time tracked (Xh Ym)

## Troubleshooting

### Problem: "Card scope not available without card context" error

**This has been fixed!** The Power-Up now uses board-level configuration.

If you still see this error with the updated code:
- Make sure you're using the latest version of all files
- Clear your browser cache
- Hard refresh Trello (Ctrl+F5)

### Problem: Power-Up doesn't show up after enabling

**Solutions:**
- Refresh your browser (Ctrl+F5 or Cmd+Shift+R)
- Make sure you're on a board in the same Workspace where you created the Power-Up
- Check that the Power-Up is enabled on that specific board
- Try disabling and re-enabling the Power-Up

### Problem: "Setup Toggl" button doesn't appear or do nothing

**Solutions:**
- Check browser console for errors (F12 → Console tab)
- Verify your `index.html` URL is correct and accessible
  - Try visiting it directly in your browser
  - Make sure it's served over HTTPS (for production)
- Check that files are in the same directory
- Make sure CORS is properly configured if self-hosting
- Verify all 4 files are uploaded to your hosting service

### Problem: "Failed to start timer" error

**Solutions:**
- Verify your API token is correct (re-copy from Toggl)
- Check Workspace ID is just the number (e.g., `1234567` not `workspace-1234567`)
- Make sure you have internet connection
- Try generating a new API token in Toggl
- Check Toggl API status at status.toggl.com

### Problem: Timer starts but doesn't show in Toggl

**Solutions:**
- Log in to Toggl Track and check you're in the correct workspace
- Check the "Time Entries" page in Toggl
- Verify your API token has proper permissions
- Look for the timer under your profile (not team timers)

### Problem: CORS errors in console

If you see CORS errors when self-hosting:

**For Node.js/Express:**
```javascript
const cors = require('cors');
app.use(cors({ origin: 'https://trello.com' }));
```

**For Apache (.htaccess):**
```apache
Header set Access-Control-Allow-Origin "https://trello.com"
```

**For Nginx:**
```nginx
add_header Access-Control-Allow-Origin "https://trello.com";
```

## Important Requirements

### HTTPS Required
- Your iframe connector URL **must** use HTTPS in production
- GitHub Pages and Netlify provide HTTPS automatically
- HTTP only works for `localhost` testing

### Same Workspace
- The Power-Up must be created in a Workspace where you're an admin
- You can only enable it on boards in that same Workspace
- To use on other boards, create the Power-Up in their Workspace

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- No ad blockers blocking Trello scripts

## File Structure

```
trello-toggl-powerup/
├── index.html                    # Connector page (loads the Power-Up)
├── trello-toggl-powerup.js      # Main Power-Up logic
├── setup.html                    # Configuration popup
└── settings.html                 # Settings management popup
```

## How It Works

1. **Trello loads `index.html`** as a hidden iframe
2. **`TrelloPowerUp.initialize()`** registers capabilities
3. **When user clicks "Start Timer"**:
   - Calls Toggl API to create time entry
   - Stores timer ID in Trello card data
   - Shows running timer badge
4. **When user clicks "Stop Timer"**:
   - Calls Toggl API to stop time entry
   - Updates total time on card
   - Removes running timer badge

## Privacy & Security

- API tokens stored in Trello's secure card data storage
- Data is scoped per-card (visible to card members)
- No data sent to third parties except Toggl
- All API calls go directly to Toggl's official API

## API Rate Limits

Toggl Track's free API has generous limits:
- This Power-Up makes minimal API calls (only on start/stop)
- Typical usage: 2-10 API calls per day per card
- Free tier limit: 1000+ requests per hour

## Updating Your Power-Up

To update after making changes:

1. **Update files** on your hosting service (GitHub, etc.)
2. **Wait 1-2 minutes** for changes to deploy
3. **Hard refresh** Trello (Ctrl+F5 or Cmd+Shift+R)
4. If issues persist, try disabling and re-enabling the Power-Up

## Support Resources

- **Trello Power-Ups Documentation**: https://developer.atlassian.com/cloud/trello/power-ups/
- **Trello Support**: https://support.atlassian.com/trello/
- **Toggl Track API**: https://developers.track.toggl.com/
- **Toggl Support**: https://support.toggl.com/

## Future Enhancement Ideas

- Project selection dropdown
- Multiple workspace support  
- Time entry editing from Trello
- Weekly/monthly time reports
- Bulk time export
- Team time tracking view
- Custom tags

## License

This is a custom Power-Up example for personal/internal use. Modify as needed!

---

**Need Help?** Check the browser console (F12) for error messages, which often point to the exact problem.

**Working?** Great! Share with your team and enjoy seamless time tracking! ⏱️