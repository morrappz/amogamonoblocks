export const generateDatePug = (metricKeys: string[]): string => {
  const lines: string[] = [];
  lines.push("h2 Metrics Report");

  const cases = ["today", "this_week", "this_month", "this_year"];

  const metricMap: Record<string, string[]> = {};

  // Group by field name
  metricKeys.forEach((key) => {
    const [type, ...fieldParts] = key.split("_");
    const field = fieldParts.join("_");
    if (!metricMap[field]) metricMap[field] = [];
    metricMap[field].push(type);
  });

  // Iterate over each case (today, this_week, etc.)
  cases.forEach((caseKey) => {
    lines.push(`h3 ${caseKey.replace("_", " ").toUpperCase()}`);
    lines.push("ul");

    // Iterate over each field (product_quantity, product_base_price, etc.)
    Object.entries(metricMap).forEach(([field, types]) => {
      lines.push(`  li`);
      lines.push(`    strong ${field}`);
      lines.push(`    ul`);

      // For each metric type (count, sum, mean, etc.)
      types.forEach((type) => {
        let description = "";
        const metricAccess = `metrics.${caseKey}['${type}_${field}']`;

        // Description logic based on field and type
        switch (type) {
          case "count":
            if (field === "product_quantity") {
              description = `The total number of quantity entries is \${${metricAccess}}, indicating how many transactions had quantity values.`;
            } else if (field === "product_base_price") {
              description = `The total number of price entries is \${${metricAccess}}, reflecting how many transactions had price values.`;
            }
            break;

          case "sum":
            if (field === "product_quantity") {
              description = `The total accumulated quantity is \${${metricAccess}}, reflecting the total number of products sold or recorded.`;
            } else if (field === "product_base_price") {
              description = `The total base price accumulated across all products is \${${metricAccess}}.`;
            }
            break;

          case "mean":
            if (field === "product_quantity") {
              description = `The average quantity of products is \${${metricAccess}}, representing typical order size.`;
            } else if (field === "product_base_price") {
              description = `The average base price of products is \${${metricAccess}}, indicating typical pricing.`;
            }
            break;

          case "median":
            if (field === "product_quantity") {
              description = `The median quantity of products is \${${metricAccess}}, indicating the middle value of the recorded quantities.`;
            } else if (field === "product_base_price") {
              description = `The median base price is \${${metricAccess}}, showing the middle price point.`;
            }
            break;

          case "mode":
            if (field === "product_quantity") {
              description = `The most frequently occurring product quantity is \${${metricAccess}}, indicating the common purchase amount.`;
            } else if (field === "product_base_price") {
              description = `The most common base price is \${${metricAccess}}, reflecting the price most often observed.`;
            }
            break;

          case "min":
            if (field === "product_quantity") {
              description = `The minimum product quantity recorded is \${${metricAccess}}, indicating the smallest recorded quantity.`;
            } else if (field === "product_base_price") {
              description = `The lowest base price recorded is \${${metricAccess}}, reflecting the least price observed.`;
            }
            break;

          case "max":
            if (field === "product_quantity") {
              description = `The maximum product quantity recorded is \${${metricAccess}}, indicating the highest recorded quantity.`;
            } else if (field === "product_base_price") {
              description = `The highest base price recorded is \${${metricAccess}}, representing the peak price observed.`;
            }
            break;

          case "std":
            if (field === "product_quantity") {
              description = `The standard deviation in product quantity is \${${metricAccess}}, showing how much the quantity values vary.`;
            } else if (field === "product_base_price") {
              description = `The standard deviation in base price is \${${metricAccess}}, indicating the price variation across products.`;
            }
            break;

          case "var":
            if (field === "product_quantity") {
              description = `The variance in product quantity is \${${metricAccess}}, indicating the spread of product quantities.`;
            } else if (field === "product_base_price") {
              description = `The variance in base price is \${${metricAccess}}, showing the distribution of prices.`;
            }
            break;

          case "null_count":
            if (field === "product_quantity") {
              description = `There are \${${metricAccess}} missing/null values for product quantity, indicating data completeness.`;
            } else if (field === "product_base_price") {
              description = `There are \${${metricAccess}} missing/null values for base price, showing how many price values are missing.`;
            }
            break;

          default:
            break;
        }

        // Add the description to the lines array if available
        if (description) lines.push(`      li ${description}`);
      });
    });
  });

  return lines.join("\n");
};
