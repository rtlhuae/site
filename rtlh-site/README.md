# RTLH website

## Where things are
- `src/rtlh-products.js`  -> prices, names, colors, hide/show products (edit this one most)
- `src/rtlh-assets.js`    -> list of image file names
- `src/RTLHSite.jsx`      -> the website itself (design, pages, text)
- `public/`               -> ALL images go here

## Adding a picture
1. Drop the file into `public/`
2. Add its name in `src/rtlh-assets.js`
3. Use it in `src/rtlh-products.js`

Every push to `main` rebuilds and publishes the site automatically
(see the Actions tab on GitHub).
