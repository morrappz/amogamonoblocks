import { NextRequest, NextResponse } from "next/server";
import pug from "pug";

export async function POST(req: NextRequest) {
  const { template, data } = await req.json();
  try {
    const compiledTemplate = pug.compile(template);

    const renderStory = data.map((item) => {
      const html = compiledTemplate(item);
      return html.replace(/"([^"]*)"/g, "$1").replace(/,\s*/g, "");
    });

    return NextResponse.json({ data: renderStory, ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error });
  }
}
