export const generateNumericTemplate = (metricKeys: string[]): string => {
  const lines: string[] = [];
  lines.push("ul");

  const metricMap: Record<string, string[]> = {};

  metricKeys.forEach((key) => {
    const [type, ...fieldParts] = key.split("_");
    const field = fieldParts.join("_");
    if (!metricMap[field]) metricMap[field] = [];
    metricMap[field].push(type);
  });

  Object.entries(metricMap).forEach(([field, types]) => {
    lines.push(`  li`);
    lines.push(`    strong ${field}`);
    lines.push(`    ul`);

    types.forEach((type) => {
      let description = "";
      switch (type) {
        case "count":
          description = `The dataset includes a total of \${metrics['count_${field}']} entries for ${field}, reflecting the overall data availability.`;
          break;
        case "sum":
          description = `The total accumulated value for ${field} is \${metrics['sum_${field}']}. This gives insight into the overall volume.`;
          break;
        case "mean":
          description = `On average, the ${field} value stands at \${metrics['mean_${field}']}, indicating a general trend.`;
          break;
        case "median":
          description = `The median value for ${field} is \${metrics['median_${field}']}, suggesting a central tendency.`;
          break;
        case "mode":
          description = `Most frequently occurring value for ${field} is \${metrics['mode_${field}']}, pointing to common patterns.`;
          break;
        case "min":
          description = `The minimum recorded value for ${field} is \${metrics['min_${field}']}, representing the lower boundary.`;
          break;
        case "max":
          description = `The maximum value noted for ${field} is \${metrics['max_${field}']}, highlighting the peak.`;
          break;
        case "std":
          description = `Standard deviation for ${field} is \${metrics['std_${field}']}, showing variability across records.`;
          break;
        case "var":
          description = `Variance of ${field} is \${metrics['var_${field}']}, indicating the spread of data.`;
          break;
        case "null_count":
          description = `There are \${metrics['null_count_${field}']} missing/null values in ${field}, indicating data quality.`;
          break;
        default:
          break;
      }
      if (description) lines.push(`      li ${description}`);
    });
  });

  return lines.join("\n");
};
