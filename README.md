# PheWeb2
![License](https://img.shields.io/github/license/GaglianoTaliun-Lab/PheWeb2-API)

**Please cite our paper**: 

Bellavance, J., Xiao, H., Chang, L., Kazemi, M., Wickramasinghe, S., Mayhew, A.J., Raina, P., VandeHaar, P., Taliun, D., & Gagliano Taliun, S.A. (2026). Exploring and visualizing stratified GWAS results with PheWeb2. _Nature Genetics_ [https://doi.org/10.21203/rs.3.rs-7463215/v1](https://doi.org/10.1038/s41588-025-02469-8)


<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/3f823732-523a-4659-8173-f4bd42e80a7a" />


PheWeb2 is a new version of the original [PheWeb](https://github.com/statgen/pheweb) tool, designed for interactive querying, visualizing, and sharing summary-level results from GWAS and PheWAS studies.

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
   - **VITE_PORT:** Specify the port number for the PheWeb2 UI (e.g., 8087). This port will be utilized during the development mode.
   - **VITE_APP_GA_ID:** (Optional) To monitor the number of visitors per page in Google Analytics 4, specify the Google tag. If you do not wish to track this information, leave the field as an empty string (i.e., `""`).
 
3. To adjust the PheWeb2 UI look-and-feel, update the following variables in the [src/config.js](src/config.js) configuration file:
   - **VITE_APP_TITLE:** The main title displayed on the PheWeb2 homepage.
   - **VITE_APP_SUBTITLE1:** The subtitle featured on the PheWeb2 homepage.
   - **VITE_APP_DATE:** The date of the last update, shown at the bottom of each page.
   - **STRATIFICATION_CATEGORIES** Specific stratification(s) categories of your data (default is "ancestry" & "sex")
   - **PRIORITY_STRATIFICATIONS:** The stratifications you wish to display in your Miami plots upon initial opening.
   - **HG_BUILD_NUMBER:** The Human Genome version number used to query UCSC data.
   - **ENABLE_INTERACTION_MODE** Option to turn on/off the interaction mode depending on whether you have interaction results from your data
   

4. To effectively represent your study, follow these steps to update the images:
   1. Replace, remove, or add new images in the [src/assets](src/assets) directory as needed.
   2. Modify the following code where necessary:
      - Update the logo at the top of the browser tab in [index.html](index.html).
      - Change the logo in the navbar located at [src/components/Navbar.vue](src/components/Navbar.vue).
      - Adjust the large logo on the main page in [src/pages/Home.vue](src/pages/Home.vue).
      - Update images in the acknowledgements section on the main page found in [src/components/AcknowledgeImage.vue](src/components/AcknowledgeImage.vue).
      - Modify images on the about page in [src/pages/about/About.vue](src/pages/about/About.vue).

5. Please modify the text and links in the following sections to accurately reflect your study:
   - About: [src/pages/about/About.vue](src/pages/about/About.vue)
   - Contact Us: [src/pages/contactUs/Contact.vue](src/pages/contactUs/Contact.vue)
   - API: [src/pages/api/API.vue](src/pages/api/API.vue)
   - GitHub: [src/pages/github/Github.vue](src/pages/github/Github.vue)
  
## 3a. Run in development mode
A development server provides users with greater flexibility when working on their website, allowing for automated refreshes upon code modifications. This setup is ideal for testing changes effectively.
```
npm run dev
```

## 3b. Run in production mode
A production server optimizes deployment for faster page reload times and enhanced security. However, this setup sacrifices certain development features, such as hot-reloading (automatic changes). This configuration is recommended for deploying the public version of your PheWeb2 UI instance.

1. Build the PheWeb2 web application:
   ```
   npm run build
   ```
2. To preview your production PheWeb2 instance, run the command provided. After executing this command, you will be able to access PheWeb2 through your web browser.
   ```
   npm run preview -- --port 8080
   ```
3. To complete the production setup, configure your web server (Apache, Nginx, or Node.js) to serve the static files from the generated `dist` directory. For instance, in Apache2, you typically copy the contents of the `dist` directory to the `/var/www/html` folder.

