# PheWeb 2.0
PheWeb 2.0 is a new version of the original [PheWeb](https://github.com/statgen/pheweb) tool for interactive querying, visualizing, and sharing summary-level results from GWAS/PheWAS studies. In PheWeb 2.0, we moved all the UI functionality to the Vue 3 and Vite frameworks, dramatically simplifying code readability, maintenance of old features, and development of new features. We also de-coupled UI from the underlying data model by introducing a separate [PheWeb 2.0 API](https://github.com/GaglianoTaliun-Lab/PheWeb2.0-API) server to allow their independent scaling and improve re-usability.
As a result of this migration, PheWeb 2.0 allows the following:
1) Import and visualizations of GWASs stratified by genetic ancestry groups (unlimited number).
2) Import and visualizations of GWASs stratified by sex.
3) Side-by-side comparisons of stratified GWASs/PheWASs through interactive Miami plots.

## Setup
Install dependencies
`npm install`
## Compiles and hot-reloads for development
`npm run dev`
