# PheWeb 2.0
![https://raw.githubusercontent.com/GaglianoTaliun-Lab/PheWeb2.0/main/public/Screenshot.png](https://github.com/GaglianoTaliun-Lab/PheWeb2.0/blob/main/public/Screenshot.png)


PheWeb 2.0 is a new version of the original [PheWeb](https://github.com/statgen/pheweb) tool for interactive querying, visualizing, and sharing summary-level results from GWAS/PheWAS studies. In PheWeb 2.0, we moved all the UI functionality to the Vue 3 and Vite frameworks, dramatically simplifying code readability, maintenance of old features, and development of new features. We also de-coupled UI from the underlying data model by introducing a separate [PheWeb 2.0 API](https://github.com/GaglianoTaliun-Lab/PheWeb2.0-API) server to allow their independent scaling and improve re-usability.

As a result of this migration, PheWeb 2.0 allows the following:
1) Import and visualizations of GWAS stratified by genetic ancestry groups (unlimited number).
2) Import and visualizations of GWAS stratified by sex.
3) Side-by-side comparisons of stratified GWAS/PheWAS through interactive Miami plots.

## Dependencies
Node.js 20.*

## Before you run

**You need to create a .env file**

An .env file exists in the top level of the directory to store private options relating to your PheWeb website. Your .env file needs to include the port of your PheWeb backend in order to retrieve data.
We have a sample .env file called sample-env. Copy the file, rename to '.env' and adjust the options to your needs in order for the changes to take effect.

Please adjust the options within `src/config.js` to fit your needs. There are currently just placeholder options.
- PRIORITY_STRATIFICATIONS : The stratifications you want to prioritise in your PheWeb. These stratifications will be the first selected in order of priority that you've set in the configuration in the miami and PheWAS page. (Optional)
- HG_BUILD_NUMBER : The number of the reference build. (Optional)
- VITE_APP_TITLE: The title of your PheWeb that will be present on the title page. (Optional)
- VITE_APP_SUBTITLE1: The subtitle of your PheWeb that will be present on the title page. (Optional)
- VITE_APP_DATE: The date of last update of your PheWeb. Will be present on the bottom of the page. (Optional)

### Images
In order to work with static images such as in the about page or acknowledgements in the home page, code modifications will be necessary. Images should be stored in `src/assets/`.

- Image at the top of web browser tab : `index.html`
- Header : `src/components/Navbar2.vue`
- Home page acknlowledgements : `src/componenets/AcknowledgeImage.vue`
- About page : `src/pages/about/About.vue`

## Development Setup
A development server allows users more flexibility and with their website. This is the best option when testing changes to the code.
### Install dependencies (found package.json)
`npm install`
### Compiles and hot-reloads for development
`npm run dev`

## Production Setup
A production server allows Vite to optimize deployement for faster page reload times and better security. In exchange, development features such as hot-reloading (automatic changes) are not available. This is the recommend set-up when deploying the public version of your Pheweb instance.
While this is not a completely production-ready build, this version utilises the 'serve' package to bypass the need for root control (useful for HPC environments, for example).

### Install dependencies
`npm run build`

### Runs production-like server. 
The convention is port 8080, but you may change this.

`npx serve -s dist -l 8080`
