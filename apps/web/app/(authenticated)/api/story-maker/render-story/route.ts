// app/api/render-template/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import pug from "pug";

export async function POST(req: NextRequest) {
  try {
    const { story_title, metrics } = await req.json();

    const response = await axios.get(
      "https://y0gcskgkwwgwkkooscoso8sg.219.93.129.146.sslip.io/story_template",
      {
        params: {
          story_title: `eq.${story_title}`,
          select: "pug_template_prompt_response",
        },
      }
    );

    const template = response.data?.[0]?.pug_template_prompt_response;
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const compile = pug.compile(template);
    const rendered = compile({ ...metrics });

    console.log("rendeed-----", rendered);

    return new NextResponse(rendered, {
      status: 200,
    });
  } catch (error) {
    console.error("Error rendering template:", error);
    return NextResponse.json(
      { error: "Error rendering template" },
      { status: 500 }
    );
  }
}
