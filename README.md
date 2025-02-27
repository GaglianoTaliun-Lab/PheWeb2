# PheWeb 2.0
PheWeb 2.0 is a new version of the original [PheWeb](https://github.com/statgen/pheweb) tool for interactive querying, visualizing, and sharing summary-level results from GWAS/PheWAS studies. In PheWeb 2.0, we moved all the UI functionality to the Vue 3 and Vite frameworks, dramatically simplifying code readability, maintenance of old features, and development of new features. We also de-coupled UI from the underlying data model by introducing a separate [PheWeb 2.0 API](https://github.com/GaglianoTaliun-Lab/PheWeb2.0-API) server to allow their independent scaling and improve re-usability.
As a result of this migration, PheWeb 2.0 allows the following:
1) Import and visualizations of GWASs stratified by genetic ancestry groups (unlimited number).
2) Import and visualizations of GWASs stratified by sex.
3) Side-by-side comparisons of stratified GWASs/PheWASs through interactive Miami plots.

## Dependencies
Node.js 20.*

## Development Setup
A development server allows users more flexibility and with their website. This is the best option when testing changes to the code.
Install dependencies (found package.json)
`npm install`
## Compiles and hot-reloads for development
`npm run dev`

## Production Setup
A production server allows Vite to optimize deployement for faster page reload times and better security. In exchange, development features such as hot-reloading (automatic changes) are not available. This is the recommend set-up when deploying the public version of your Pheweb instance.
While this is not a completely production-ready build. This version utilises the 'serve' package to bypass the need for root control (useful for HPC environments, for example).
Install dependencies
`npm run build`
## Runs production-like server. The conventional port is 8080, but you may change this.
`npx serve -s dist -l 8080`
