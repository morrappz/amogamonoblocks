import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

export async function POST(req: NextRequest) {
  try {
    const { host, port, username, password, database } = await req.json();

    const client = new Client({
      host: host,
      port: parseInt(port),
      user: username,
      password,
      database,
    });

    await client.connect();

    const res = await client.query(`
      SELECT table_name FROM information_schema.tables WHERE table_schema='public'
    `);
    await client.end();

    return NextResponse.json({
      success: true,
      message: "Connection successful!",
      data: res.rows,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Connection failed.", error: error },
      { status: 500 }
    );
  }
}
