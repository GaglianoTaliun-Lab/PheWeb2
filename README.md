# PheWeb2

<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/3f823732-523a-4659-8173-f4bd42e80a7a" />


PheWeb2 is a new version of the original [PheWeb](https://github.com/statgen/pheweb) tool, designed for interactive querying, visualizing, and sharing summary-level results from GWAS abd PheWAS studies.

:star: **PheWeb2 introduces several new functionalities for users compared to its predecessor:**
1. Import and visualizations of GWAS stratified by genetic ancestry groups (with no limit on the number of groups).
2. Import and visualizations of GWAS stratified by sex.
3. Import and visualizations of genotype-by-sex interactions.
4. Side-by-side comparisons of stratified GWAS and PheWAS using dynamic Miami plots, stacked LocusZoom plots, and dynamic tables.


:star: **PheWeb2 has improved code maintenance and reusability by decoupling the data model and application programming interface (API) from the user interface (UI).** This enhancement allows for results to be queried by other external resources and applications.

:star: **PheWeb2 has migrated its UI implementation to the latest tools for building web user interfaces, including [Vue 3](https://vuejs.org/) and [Vite](https://vite.dev/).** This migration significantly enhances code readability, maintenance, and the development of new features.

> [!Tip]
> If you intend to use your own GWAS summary statistics data with PheWeb2, you should first install and launch the [PheWeb2 API](https://github.com/GaglianoTaliun-Lab/PheWeb2-API).


## 1. Install

> [!NOTE]
> The code was developed and tested with Node.js 20.16.0+ on Linux-based OS.

1. Download and install Node.js following the instructions at [https://nodejs.org/en/download/](https://nodejs.org/en/download/).
2. Clone this repository:
   ```
   git clone https://github.com/GaglianoTaliun-Lab/PheWeb2.git
   cd PheWeb2
   ```
3. Install dependencies required by PheWeb2 UI:
   ```
   npm install
   ```

## 2. Configure

1. Ensure you have a PheWeb2 API endpoint running. If you need to deploy one, follow the instructions available at [PheWeb2 API](https://github.com/GaglianoTaliun-Lab/PheWeb2-API).
 
2. To configure the PheWeb2 UI, update the following variables in the [.env](.env) file:
   - **VITE_APP_CLSA_PHEWEB_API_URL:** Set this to the PheWeb2 API endpoint (e.g., `"http://127.0.0.1:9999"`).
   - **VITE_PORT:** Specify the port number for the PheWeb2 UI (e.g., 8087).
   - **VITE_APP_GA_ID:** (Optional) To monitor the number of visitors per page in Google Analytics 4, specify the Google tag. If you do not wish to track this information, leave the field as an empty string (i.e., `""`).
 
3. To adjust the PheWeb2 UI look-and-feel, update the following variables in the [src/config.js](src/config.js) configuration file:
   - **VITE_APP_TITLE:** The main title displayed on the PheWeb2 homepage.
   - **VITE_APP_SUBTITLE1:** The subtitle featured on the PheWeb2 homepage.
   - **VITE_APP_DATE:** The date of the last update, shown at the bottom of each page.
   - **PRIORITY_STRATIFICATIONS:** The stratifications you wish to display in your Miami plots upon initial opening.
   - **HG_BUILD_NUMBER:** The Human Genome version number used to query UCSC data.

# Build the UI
```
npm run build
```

# Run the UI
```
npm run preview -- --port 8080
```

> [!IMPORTANT]
> As of the current release, images need to be manually edited to be removed or edited. 
> All images are present in [the assets folder](src/assets).
> Here is a list of current image referral locations:
> - [Logo at the top of tab in browser - line 5](src/index.html)
> - [Logo in navbar - line 7](src/components/Navbar.vue)
> - [Large logo in home page - line 6](src/pages/Home.vue)
> - [Images in acknowledgements on home page - lines 3-8](src/components/AcknowledgeImage.vue)
> - [Images in about page - lines 154, 158 & 196](src/pages/About.vue)
 
5. Compile with either the development setup, production setup or production-as-a-service setup:

**A) Development Setup**

A development server allows users more flexibility and with their website. This is the best option when testing changes to the code.
```
npm run dev
```

**B) Production Setup**

A production server allows Vite to optimize deployement for faster page reload times and better security. In exchange, development features such as hot-reloading (automatic changes) are not available. This is the recommend set-up when deploying the public version of your PheWeb instance.
While this is not a completely production-ready build, this version utilises the 'serve' package to bypass the need for root control (useful for HPC environments, for example).

Build dependencies
```
npm run build
```

Runs production-like server. 

```
npx serve -s dist -l 8080
```
> [!NOTE]
> The convention is port 8080, but you may change this.

 

> [!NOTE]
> For more information on running the PheWeb2 frontend as a service (a great option for self-hosted web servers), please consult the appropriate [README](service/README.md).

>> in .env, modify your GA id if applicable
