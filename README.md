# PheWeb2

<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/3f823732-523a-4659-8173-f4bd42e80a7a" />


PheWeb 2 is a new version of the original [PheWeb](https://github.com/statgen/pheweb) tool for interactive querying, visualizing, and sharing summary-level results from GWAS/PheWAS studies.

In PheWeb 2, we moved all the UI functionality to the Vue 3 and Vite frameworks, dramatically simplifying code readability, maintenance of old features, and development of new features. 

We also de-coupled UI from the underlying data model by introducing a separate [PheWeb 2 API](https://github.com/GaglianoTaliun-Lab/PheWeb2-API) server to allow their independent scaling and improve re-usability.

As a result of this migration, PheWeb 2 allows the following
- Import and visualizations of GWAS stratified by genetic ancestry groups (unlimited number).
- Import and visualizations of GWAS stratified by sex.
- Side-by-side comparisons of stratified GWAS/PheWAS through interactive Miami plots.

> [!NOTE]
> The code was developed and tested with Node.js 20.16.0+ on Linux-based OS.


# You can install the PheWeb2 frontend and all required dependencies using the following steps:

1. Install nodejs following the instructions at [https://nodejs.org/en/download/](https://nodejs.org/en/download/)

1. Clone this repository:
```
git clone https://github.com/GaglianoTaliun-Lab/PheWeb2.git
cd PheWeb2
```
 
2. Install dependencies:
All dependencies are present in the [package.json](package.json)

```
npm install
```

# Configuring PheWeb2 UI
1. Make sure your PheWeb2 API endpoint is running. Follow insturctions at [PheWeb2-API GitHub](https://github.com/GaglianoTaliun-Lab/PheWeb2-API)
 
2. Modify your .env file:
```
# Specify the url address of PheWeb2 API
VITE_APP_CLSA_PHEWEB_API_URL="http://127.0.0.1:9543"

# Specify the port of PheWeb UI
VITE_PORT=8087
```

An .env file exists in the top level of the directory to store private options relating to your PheWeb website. Your .env file needs to include the port of your PheWeb backend in order to retrieve data.
We have a sample .env file called sample-env. Copy the file, rename to '.env' and adjust the options to your needs in order for the changes to take effect.

The available options are:
 - `VITE_APP_CLSA_PHEWEB_API_URL`: The URL of your PheWeb2-API backend, in quotes (example: "http://127.0.0.1:9999")
 - `VITE_PORT`: The port on which you wish to host your frontend. (example: 8087)
 
3. Adjust [configuration](src/config.js) settings:
The main configuration file for the frontend is located at `src/config.js`. The current options are placeholders.

Here are the currently available options:
- `PRIORITY_STRATIFICATIONS`: The stratifications you want to prioritise in your PheWeb. These stratifications will be the first selected in order of priority that you've set in the configuration in the miami and PheWAS page. (Optional)
- `HG_BUILD_NUMBER`: The number of the reference build. (Optional)
- `VITE_APP_TITLE`: The title of your PheWeb that will be present on the title page. (Optional)
- `VITE_APP_SUBTITLE1`: The subtitle of your PheWeb that will be present on the title page. (Optional)
- `VITE_APP_DATE`: The date of last update of your PheWeb. Will be present on the bottom of the page. (Optional)

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