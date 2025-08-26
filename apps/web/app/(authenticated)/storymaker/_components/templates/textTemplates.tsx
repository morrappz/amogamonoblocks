export const generateTextPug = (metricKeys: string[]): string => {
  const lines: string[] = [];
  lines.push("h2 Metrics Report");
  lines.push("ul");

  const metricMap: Record<string, string[]> = {};

  // Group the metric keys by field
  metricKeys.forEach((key) => {
    const [type, ...fieldParts] = key.split("_");
    const field = fieldParts.join("_");
    if (!metricMap[field]) metricMap[field] = [];
    metricMap[field].push(type);
  });

  // Iterate over the grouped metrics and generate the description
  Object.entries(metricMap).forEach(([field, types]) => {
    lines.push(`  li`);
    lines.push(`    strong ${field}`);
    lines.push(`    ul`);

    types.forEach((type) => {
      let description = "";
      const metricAccess = `metrics['${type}_${field}']`; // Access metric data dynamically

      // Dynamic descriptions based on metric type and field
      switch (type) {
        case "count":
          description = `The dataset includes a total of \${${metricAccess}} entries for ${field}, reflecting the overall data availability.`;
          break;
        case "sum":
          description = `The total accumulated value for ${field} is \${${metricAccess}}. This gives insight into the overall volume.`;
          break;
        case "mean":
          description = `On average, the ${field} value stands at \${${metricAccess}}, indicating a general trend.`;
          break;
        case "median":
          description = `The median value for ${field} is \${${metricAccess}}, suggesting a central tendency.`;
          break;
        case "mode":
          description = `Most frequently occurring value for ${field} is \${${metricAccess}}, pointing to common patterns.`;
          break;
        case "min":
          description = `The minimum recorded value for ${field} is \${${metricAccess}}, representing the lower boundary.`;
          break;
        case "max":
          description = `The maximum value noted for ${field} is \${${metricAccess}}, highlighting the peak.`;
          break;
        case "std":
          description = `Standard deviation for ${field} is \${${metricAccess}}, showing variability across records.`;
          break;
        case "var":
          description = `Variance of ${field} is \${${metricAccess}}, indicating the spread of data.`;
          break;
        case "null_count":
          description = `There are \${${metricAccess}} missing/null values in ${field}, indicating data quality.`;
          break;
        default:
          break;
      }

      // Generate custom descriptions for text-based fields (e.g., user_name, product_name)
      if (field === "product_name") {
        switch (type) {
          case "count":
            description = `The total number of different product names recorded is \${${metricAccess}}, representing the variety of products.`;
            break;
          case "mode":
            description = `The most common product name recorded is \${${metricAccess}}, showing the most frequently mentioned product.`;
            break;
          case "null_count":
            description = `There are \${${metricAccess}} missing values for product names, indicating some records are missing product information.`;
            break;
        }
      }

      if (field === "payment_method") {
        switch (type) {
          case "count":
            description = `The total number of payment methods recorded is \${${metricAccess}}, reflecting the number of different payment options used.`;
            break;
          case "mode":
            description = `The most commonly used payment method is \${${metricAccess}}, indicating the preferred payment choice.`;
            break;
          case "null_count":
            description = `There are \${${metricAccess}} missing values for payment methods, showing incomplete payment information.`;
            break;
        }
      }

      if (field === "user_name") {
        switch (type) {
          case "count":
            description = `The total number of users recorded is \${${metricAccess}}, reflecting the total user base.`;
            break;
          case "mode":
            description = `The most common user name recorded is \${${metricAccess}}, showing the most frequent user name.`;
            break;
          case "null_count":
            description = `There are \${${metricAccess}} missing/null values for user names, indicating some records are missing user details.`;
            break;
        }
      }

      // Add the generated description to the lines array if it exists
      if (description) lines.push(`      li ${description}`);
    });
  });

  return lines.join("\n");
};
