import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Server-side chart generation using node-canvas
function createServerSideChart(chartData: any): string {
  try {
    console.log("Creating server-side chart...");

    // Try to import canvas for Node.js
    let Canvas: any;
    try {
      Canvas = require("canvas");
    } catch (e) {
      throw new Error("canvas package not installed. Run: npm install canvas");
    }

    // Create canvas
    const canvas = Canvas.createCanvas(600, 400);
    const ctx = canvas.getContext("2d");

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Process data
    const data = chartData.data || [];
    if (data.length === 0) {
      throw new Error("No data provided");
    }

    const processedData = data.map((item: any) => ({
      label: String(item.label || "Unknown"),
      value: Math.max(0, Number(item.value) || 0),
    }));

    const chartType = (chartData.type || "").toLowerCase();
    const isPie = chartType.includes("pie");

    if (isPie) {
      drawServerPieChart(ctx, processedData, canvas.width, canvas.height);
    } else {
      drawServerBarChart(ctx, processedData, canvas.width, canvas.height);
    }

    // Convert to base64
    const imageBuffer = canvas.toBuffer("image/png");
    const imageBase64 = `data:image/png;base64,${imageBuffer.toString(
      "base64"
    )}`;

    console.log("Server-side chart created successfully");
    return imageBase64;
  } catch (error) {
    console.error("Server-side chart creation failed:", error);
    throw error;
  }
}

function drawServerPieChart(
  ctx: any,
  data: any[],
  width: number,
  height: number
) {
  const centerX = width * 0.3;
  const centerY = height * 0.5;
  const radius = Math.min(width, height) * 0.18;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return;

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8E8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
  ];

  let currentAngle = -Math.PI / 2; // Start at top

  // Draw title
  ctx.fillStyle = "#333";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Data Distribution", width / 2, 30);

  // Draw pie slices
  data.forEach((item, index) => {
    if (item.value === 0) return;

    const sliceAngle = (item.value / total) * 2 * Math.PI;

    // Draw slice
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();

    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();

    // White border
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    currentAngle += sliceAngle;
  });

  // Draw legend
  const legendX = width * 0.6;
  let legendY = 60;

  ctx.textAlign = "left";
  ctx.font = "bold 14px Arial";
  ctx.fillStyle = "#333";
  ctx.fillText("Legend:", legendX, legendY);
  legendY += 25;

  data.forEach((item, index) => {
    // Color box
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(legendX, legendY - 12, 16, 16);

    // Text
    ctx.fillStyle = "#333";
    ctx.font = "12px Arial";
    const percentage = ((item.value / total) * 100).toFixed(1);
    ctx.fillText(`${item.label}: ${percentage}%`, legendX + 25, legendY);

    legendY += 22;
  });
}

function drawServerBarChart(
  ctx: any,
  data: any[],
  width: number,
  height: number
) {
  const margin = { top: 50, right: 50, bottom: 100, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const maxValue = Math.max(...data.map((d) => d.value));
  if (maxValue === 0) return;

  const barWidth = (chartWidth / data.length) * 0.6;
  const barSpacing = (chartWidth / data.length) * 0.4;

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8E8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
  ];

  // Draw title
  ctx.fillStyle = "#333";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Data Comparison", width / 2, 25);

  // Draw chart background
  ctx.fillStyle = "#f9f9f9";
  ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);

  // Draw grid lines
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = margin.top + chartHeight - (i / 5) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(margin.left + chartWidth, y);
    ctx.stroke();
  }

  // Draw bars
  data.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * chartHeight;
    const x = margin.left + index * (barWidth + barSpacing) + barSpacing / 2;
    const y = margin.top + chartHeight - barHeight;

    // Bar
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(x, y, barWidth, barHeight);

    // Bar outline
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Value on bar
    ctx.fillStyle = "#333";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    const displayValue =
      item.value > 1000000
        ? `${(item.value / 1000000).toFixed(1)}M`
        : item.value.toLocaleString();
    ctx.fillText(displayValue, x + barWidth / 2, y - 5);

    // Label below
    ctx.save();
    ctx.translate(x + barWidth / 2, margin.top + chartHeight + 15);
    ctx.rotate(-Math.PI / 6); // 30 degrees
    ctx.textAlign = "right";
    ctx.font = "9px Arial";
    ctx.fillText(
      item.label.length > 10 ? item.label.substring(0, 10) + "..." : item.label,
      0,
      0
    );
    ctx.restore();
  });

  // Draw axes
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  // Y-axis
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, margin.top + chartHeight);
  ctx.stroke();
  // X-axis
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top + chartHeight);
  ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
  ctx.stroke();

  // Y-axis labels
  ctx.fillStyle = "#666";
  ctx.font = "10px Arial";
  ctx.textAlign = "right";
  for (let i = 0; i <= 5; i++) {
    const value = (maxValue / 5) * i;
    const y = margin.top + chartHeight - (i / 5) * chartHeight;
    const label =
      value > 1000000
        ? `${(value / 1000000).toFixed(0)}M`
        : Math.round(value).toLocaleString();
    ctx.fillText(label, margin.left - 5, y + 3);
  }
}

// Alternative: Create a simple chart using pure mathematical drawing (no canvas)
function createTextBasedChart(chartData: any): string {
  console.log("Creating text-based chart as fallback...");

  // This creates a simple ASCII-style chart that can be rendered as text
  // For now, we'll return empty string to use table fallback
  return "";
}

export async function generatePDFBuffer({
  table,
  chart,
  story,
}: {
  table: any;
  chart: any;
  story: any;
}): Promise<{ buffer: Buffer; fileName: string; contentType: string }> {
  console.log("Starting PDF generation...");

  const title = table?.title || "Untitled";
  const description = table?.description || "";
  const headers = table?.data?.headers || [];
  const rows = table?.data?.rows || [];

  const sanitizedRows = rows.map((row: any) =>
    row.map((cell: any) => String(cell || ""))
  );

  // Use landscape for wide tables
  const doc = new jsPDF({
    orientation: headers.length > 8 ? "landscape" : "portrait",
  });

  // Title
  doc.setFontSize(20).setFont("helvetica", "bold").text(title, 20, 20);

  let y = 30;

  // Description
  if (description) {
    doc.setFontSize(12).setFont("helvetica", "normal");
    const splitDescription = doc.splitTextToSize(description, 170);
    doc.text(splitDescription, 20, y);
    y += splitDescription.length * 5 + 10;
  }

  // Table with improved formatting
  autoTable(doc, {
    head: [headers],
    body: sanitizedRows,
    startY: y,
    styles: {
      fontSize: 9,
      cellPadding: 2,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: { fillColor: [230, 230, 230] },
    columnStyles: Object.fromEntries(
      headers.map((h, i) => [i, { cellWidth: "auto", minCellWidth: 30 }])
    ),
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Chart section
  if (
    chart &&
    chart.chartData &&
    chart.chartData.data &&
    chart.chartData.data.length > 0
  ) {
    console.log("Processing chart section...");

    // Add chart title
    doc
      .setFontSize(14)
      .setFont("helvetica", "bold")
      .text(chart.title || "Chart", 20, y);
    y += 8;

    // Add chart description
    if (chart.description) {
      doc.setFontSize(10).setFont("helvetica", "normal");
      const splitChartDesc = doc.splitTextToSize(chart.description, 170);
      doc.text(splitChartDesc, 20, y);
      y += splitChartDesc.length * 5 + 5;
    }

    // Try server-side chart generation
    try {
      console.log("Attempting server-side chart generation...");
      console.log("Chart data:", JSON.stringify(chart.chartData, null, 2));

      const chartImageBase64 = createServerSideChart(chart.chartData);

      if (chartImageBase64 && chartImageBase64.startsWith("data:image/")) {
        console.log("Server-side chart created, adding to PDF...");

        const imgWidth = 160;
        const imgHeight = 107;

        if (y + imgHeight > 270) {
          doc.addPage();
          y = 20;
        }

        doc.addImage(chartImageBase64, "PNG", 20, y, imgWidth, imgHeight);
        y += imgHeight + 15;

        console.log("Chart successfully added to PDF");
      } else {
        throw new Error("Invalid chart image");
      }
    } catch (error) {
      console.error("Chart generation failed:", error);

      // Enhanced table fallback
      doc
        .setFontSize(12)
        .setFont("helvetica", "bold")
        .text("Chart Data:", 20, y);
      y += 10;

      // Add note about missing canvas
      if (error.message.includes("canvas package not installed")) {
        doc.setFontSize(9).setFont("helvetica", "italic");
        doc.setTextColor(100, 100, 100);
        doc.text(
          "Note: Install 'canvas' package for chart images: npm install canvas",
          20,
          y
        );
        y += 8;
        doc.setTextColor(0, 0, 0);
      }

      const chartTableData = chart.chartData.data.map((point: any) => [
        String(point.label || "Unknown"),
        String(point.value ? point.value.toLocaleString() : "0"),
      ]);

      autoTable(doc, {
        head: [["Item", "Value"]],
        body: chartTableData,
        startY: y,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [220, 220, 220] },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 60, halign: "right" },
        },
      });
      y = (doc as any).lastAutoTable.finalY + 15;
    }
  }

  // Story section
  if (story && story.data && Array.isArray(story.data)) {
    if (y + 50 > 270) {
      doc.addPage();
      y = 20;
    }

    doc
      .setFontSize(14)
      .setFont("helvetica", "bold")
      .text(story.title || "Insights", 20, y);
    y += 8;

    if (story.description) {
      doc.setFontSize(10).setFont("helvetica", "normal");
      const splitStoryDesc = doc.splitTextToSize(story.description, 170);
      doc.text(splitStoryDesc, 20, y);
      y += splitStoryDesc.length * 5 + 5;
    }

    story.data.forEach((line: string) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(10).setFont("helvetica", "normal");
      const splitLine = doc.splitTextToSize(String(line), 170);
      doc.text(splitLine, 20, y);
      y += splitLine.length * 5 + 3;
    });
  }

  console.log("PDF generation completed");

  const buffer = Buffer.from(doc.output("arraybuffer"));
  return {
    buffer,
    fileName: `${title.replace(/[^a-z0-9]/gi, "_")}.pdf`,
    contentType: "application/pdf",
  };
}
