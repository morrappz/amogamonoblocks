import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

// Ensure to use environment variables for sensitive tokens
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export async function POST(request: Request): Promise<NextResponse> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    // Handle file upload
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    try {
      // Upload the file to Vercel Blob
      const blob = await put(file.name, file, {
        access: "public", // Make the file publicly accessible
        token: BLOB_READ_WRITE_TOKEN, // Use the token for authentication
      });

      // Return the URL of the uploaded file
      return NextResponse.json({ url: blob.url });
    } catch (error) {
      console.error("Error uploading to Vercel Blob:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  } else if (contentType.includes("application/json")) {
    // Handle video URL submission
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    try {
      // Perform any validation or processing of the URL here
      // Return the URL for consistency
      return NextResponse.json({ url });
    } catch (error) {
      console.error("Error processing URL:", error);
      return NextResponse.json(
        { error: "URL processing failed" },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "Unsupported content type" },
      { status: 400 }
    );
  }
}
