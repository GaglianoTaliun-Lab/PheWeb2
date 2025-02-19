import * as d3 from "d3";

function two_digit_format(x) { return (x>=.1)? x.toFixed(2) : (x>=.01)? x.toFixed(3) : x.toExponential(1); }

function fmt(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) {
        return (typeof args[number] != 'undefined') ? args[number] : match;
    });
}

export function maf_range(data){

    var text = "";

    // turn proxy dict into plain dict
    data = JSON.parse(JSON.stringify(data))

    function isnum(d) { return typeof d === "number"; }
    //function minor(frac) { return Math.min(frac, 1-frac); }

    // TODO: different af for all stratifications
    var afs_list = []

    data.forEach(variant => {
        var afs = variant.phenos.map(function(v) {
            if (isnum(v.af)) { return v.af; }
            else if (isnum(v.ac) && isnum(v.num_samples)) { return v.ac / (2*v.num_samples); }
            else { return undefined; }
        }).filter(isnum);
        afs_list.push(afs)
    })

    afs_list.forEach((afs,i) => {
        if (afs.length == data[i].phenos.length) {
            // Every pheno has AF
            let af_range = d3.extent(afs).map(two_digit_format);
            if (af_range[0] === af_range[1]) { text += (keyToLabel(data[i].stratification) + " " + fmt('EAF: {0}\n', af_range[0])); }
            else { text += (keyToLabel(data[i].stratification) + " " +  fmt('EAF: ranges from {0} to {1}\n', af_range[0], af_range[1])) ; }
            return;
        } else if (afs.length) {
            // Show the range of MAFs for the phenotypes that have a MAF
            var af_range = d3.extent(afs).map(two_digit_format);
            if (af_range[0] === af_range[1]) { text  += (keyToLabel(data[i].stratification) + " " + fmt('EAF: {0} for phenotypes where it is defined\n', af_range[0])); }
            else { text += (keyToLabel(data[i].stratification) + " " + fmt('EAF: ranges from {0} to {1} for phenotypes where it is defined\n', af_range[0], af_range[1])); }
        }
    })

    var mafs_list = []
    data.forEach(variant => {
        var mafs = variant.phenos.map(function(v) {
            if (isnum(v.maf))  { return v.maf; }
            //else if (isnum(v.af)) { return minor(v.af); }
            else if (isnum(v.mac) && isnum(v.num_samples)) { return v.mac / (2*v.num_samples) }
            //else if (isnum(v.ac) && isnum(v.num_samples)) { return minor(v.ac / (2*v.num_samples)); }
            else { return undefined; }
        }).filter(isnum);

        mafs_list.push(mafs)
    })
    mafs_list.forEach((mafs,i) => {
        if (mafs.length === data[i].phenos.length) {
            // Every pheno has a MAF
            let maf_range = d3.extent(mafs).map(two_digit_format);
            if (maf_range[0] === maf_range[1]) { text += (keyToLabel(data[i].stratification) + " " + fmt('MAF: {0}\n', maf_range[0])); }
            else { text += (keyToLabel(data[i].stratification) + " " + fmt('MAF: ranges from {0} to {1}\n', maf_range[0], maf_range[1])); }
        } else if (mafs.length) {
            // Show the range of MAFs for the phenotypes that have a MAF
            var maf_range = d3.extent(mafs).map(two_digit_format);
            if (maf_range[0] === maf_range[1]) { text  += (keyToLabel(data[i].stratification) + " " + fmt('MAF: {0} for phenotypes where it is defined\n', maf_range[0])); }
            else { text += (keyToLabel(data[i].stratification) + " " + fmt('MAF: ranges from {0} to {1} for phenotypes where it is defined\n', maf_range[0], maf_range[1])); }
        }
    })
    return text
}

function keyToLabel(phenoLabel){

    var label = phenoLabel.split(".").slice(1)
    if (label.length < 1){
        return []
    }
    if (label[0].includes("interaction-")){
        label[0] = "Interaction: " + label[0].split("-")[1]
    }

    return label.join(', ')
}