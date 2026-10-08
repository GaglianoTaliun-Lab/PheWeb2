// Set the title and subtitle of the app, which is displayed in the main page
export const VITE_APP_TITLE="Canadian Longitudinal Study on Aging PheWeb"
export const VITE_APP_SUBTITLE1="Powered by PheWeb2"

// Set the date of the release, which is displayed in the footer of each page
export const VITE_APP_DATE = "2026-10"

// This sets the default GWAS stratification to display on the PheWas plot
export const PRIORITY_STRATIFICATIONS = ["all.combined", "european.combined"]

// This sets the default GWAS stratification combinations to display on the Miami plot
export const PRIORITY_STRATIFICATIONS_COMBINATIONS = {
    "all.combined" : "european.combined",
    "european.combined" : "all.combined",

    "all.female" : "all.male",
    "european.female" : "european.male",

    "all.male" : "all.female",
    "european.male" : "european.female",
}

// Set the Human Genome version number, which will be used to query UCSC data
export const HG_BUILD_NUMBER = "38";

// Labels for the stratification category labels. No need to change this
export const STRATIFICATION_CATEGORIES = ["ancestry", "sex"]

// Enable switching to interaction mode
export const ENABLE_INTERACTION_MODE = true;