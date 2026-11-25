# Boot nLoot (ChunkyDunky)

Demo storefront for a pre-owned luxury and streetwear marketplace. Plain HTML, CSS and JavaScript, with no build step.

## Run it
Open `index.html`, or serve the folder so everything works (including image export):

    python -m http.server 5173

then visit http://localhost:5173. Add `?nointro` to skip the intro animation.

## Files
- `index.html`, `styles.css`: page shell and all styles
- `app.js`: routing, shop, cart, wishlist, auction, student market
- `data.js`: products, vendors, student listings
- `intro.js`: cinematic entry animation (uses `assets/intro/`)
- `tryon.js`, `tryon-data.js`: virtual try-on pop-up (uses `assets/wear/`, `assets/tryon/`)
- `pricetrend.js`: price-change tags and price history graph
- `flexwall.js`: the Flex Wall section

All data is mock data. No real payments, bids or AI calls.
