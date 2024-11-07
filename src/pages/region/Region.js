export function fmt(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) {
        return (typeof args[number] != 'undefined') ? args[number] : match;
    });
}

export const tooltip_lztemplate = `
{{#if rsid}}<strong>{{rsid}}</strong><br>{{/if}}
{{#if consequence}}consequence: <strong>{{consequence}}</strong><br>{{/if}}
{{#if pvalue|is_numeric}}P-value: <strong>{{pvalue|scinotation}}</strong><br>{{/if}}
{{#if pval|is_numeric}}P-value: <strong>{{pval|scinotation}}</strong><br>{{/if}}
{{#if beta}}Beta: <strong>{{beta}}</strong>{{#if sebeta|is_numeric}} (se:<strong>{{sebeta}}</strong>){{/if}}<br>{{/if}}
{{#if or}}Odds Ratio: <strong>{{or}}</strong><br>{{/if}}
{{#if maf}}MAF: <strong>{{maf|percent}}</strong><br>{{/if}}
{{#if af}}AF: <strong>{{af|percent}}</strong><br>{{/if}}
{{#if case_af}}AF among cases: <strong>{{case_af|percent}}</strong><br>{{/if}}
{{#if control_af}}AF among controls: <strong>{{control_af|percent}}</strong><br>{{/if}}
{{#if ac}}AC: <strong>{{ac}}</strong><br>{{/if}}
{{#if r2}}R2: <strong>{{r2}}</strong><br>{{/if}}
{{#if tstat}}Tstat: <strong>{{tstat}}</strong><br>{{/if}}
{{#if num_cases}}#cases: <strong>{{num_cases}}</strong><br>{{/if}}
{{#if num_controls}}#controls: <strong>{{num_controls}}</strong><br>{{/if}}
{{#if num_samples}}#samples: <strong>{{num_samples}}</strong><br>{{/if}}
`
