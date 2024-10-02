export function stratificationToLabel(stratification){
    // takes in dict format {"sex" : "both", "ancestry" : "european", ..}
    // and creates label format "Both, European"

    var label = Object.values(stratification).join(", ")

    return(capitalizeFirstLetter(label))
}

export function stratificationToKey(phenocode, stratification){
    // takes in phenocode str and dict format {"sex" : "both", "ancestry" : "european", ..}
    // and creates label format "<phenocode>.both.european"

    var label = phenocode + "." + Object.values(stratification).join(".")

    return(label)
}

function capitalizeFirstLetter(str) {
    if (!str) return str; // Return if the string is empty or null
    return str.charAt(0).toUpperCase() + str.slice(1);
}