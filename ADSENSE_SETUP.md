# Setting Up Google AdSense with Flappy Austin

This guide will help you set up Google AdSense to monetize your Flappy Austin game.

## 1. Publisher ID

Your Google AdSense Publisher ID is:

```
ca-pub-3333169251061455
```

This ID has been added to your index.html file for verification.

## 2. Next Steps

After Google verifies your site:

1. Log into your AdSense account
2. Create ad units for each placement in the game
3. Replace the ad slot placeholders in index.html:
   - `REPLACE_WITH_YOUR_AD_SLOT_ID` (bottom banner)
   - `REPLACE_WITH_YOUR_AD_SLOT_ID_2` (game over interstitial)
   - `REPLACE_WITH_YOUR_AD_SLOT_ID_3` (top banner)

## 3. Ad Placement Details

The game has three ad placements:

1. **Top Banner Ad**: Displayed above the game at all times.
2. **Bottom Banner Ad**: Displayed below the game at all times.
3. **Interstitial Ad**: Shown after every 2 game overs.

## 4. Customizing Ad Frequency

To change how often the interstitial ad appears:

1. Open `game.js`
2. Find the line: `let adFrequency = 2; // Show ad every X game overs`
3. Change the value `2` to your desired frequency. For example:
   - `1` shows an ad after every game over
   - `3` shows an ad after every third game over

## 5. Compliance Notes

Ensure your implementation complies with AdSense policies:

- Don't click on your own ads
- Don't place ads in a way that encourages accidental clicks
- Don't modify the AdSense code

For more information, see the [Google AdSense Program Policies](https://support.google.com/adsense/answer/48182)
