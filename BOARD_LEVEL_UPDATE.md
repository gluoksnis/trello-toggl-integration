# Board-Level Configuration Update

## What Changed

The Power-Up now uses **board-level configuration** instead of card-level. This means:

✅ **Configure once per board** - not once per card
✅ **Works on all cards** immediately after setup
✅ **No more "card scope" errors**
✅ **Easier to manage** - one place to update credentials

## For New Users

Just follow the normal setup:
1. Open any card on your board
2. Click "Setup Toggl"
3. Enter your API token and workspace ID
4. Done! Works on all cards on this board

## For Existing Users (Migration)

If you already set up the old version:

### Option 1: Fresh Start (Recommended)

1. **Upload the new files** to GitHub Pages:
   - `trello-toggl-powerup.js` (updated)
   - `setup.html` (updated)
   - `settings.html` (updated)
   - `index.html` (same)

2. **Hard refresh Trello** (Ctrl+F5 or Cmd+Shift+R)

3. **Reconfigure on any card**:
   - Open any card
   - Click "Setup Toggl"
   - Re-enter your credentials
   - This saves to board level

4. **Old card-level settings** will be ignored (won't interfere)

### Option 2: Clear Old Settings

If you want to clean up old card-level data:

1. Open a card that was previously configured
2. Open browser console (F12)
3. Run this code:
```javascript
// This clears old card-level settings
TrelloPowerUp.iframe().remove('card', 'shared', ['togglApiToken', 'togglWorkspaceId']);
```

Then follow Option 1 to reconfigure at board level.

## Key Differences

### Old (Card-Level)
- ❌ Had to configure each card individually
- ❌ Settings stored per card
- ❌ "Card scope not available" errors
- ❌ More clicks to start tracking

### New (Board-Level)
- ✅ Configure once for entire board
- ✅ Settings apply to all cards
- ✅ No scope errors
- ✅ Works immediately on any card

## What About Running Timers?

Running timer data is still stored **per-card** (this is intentional):
- Each card can have its own running timer
- Multiple people can track time on different cards
- Timer state is private to each user

Only the **configuration** (API token, workspace ID) is now board-level.

## FAQs

**Q: Do I need to reconfigure on every board?**
A: Yes, each board has its own configuration. But you only configure once per board, not once per card.

**Q: Can different boards use different Toggl workspaces?**
A: Yes! Each board can have its own workspace ID.

**Q: What if I work across multiple Toggl accounts?**
A: You'll need to reconfigure when switching boards that use different accounts.

**Q: Can I still configure from the Power-Up settings menu?**
A: Yes! Click the gear icon on the Power-Up in the Power-Ups menu.

**Q: Will old timers still work?**
A: Running timers will continue to work. Total time tracked per card is preserved.

## Configuration Locations

You can configure Toggl from:

1. **Any card** → Power-Ups section → "Setup Toggl" button
2. **Board menu** → Power-Ups → Toggl Track Timer → Settings (gear icon)
3. **Power-Up settings** → "Show settings" option

All three methods save to the same board-level storage.

## Benefits

### For Freelancers
- Quick setup on new project boards
- All client cards use the same Toggl workspace
- Switch between client boards easily

### For Teams
- Team admin configures once
- Everyone can track time immediately
- Consistent workspace/project settings

### For Agencies
- Different boards for different clients
- Each board tracks to the right Toggl workspace
- No per-card configuration hassle

## Support

After updating:
- Clear browser cache
- Hard refresh Trello
- Try configuring on a test board first
- Check browser console for any errors

Enjoy the simpler workflow! 🎉