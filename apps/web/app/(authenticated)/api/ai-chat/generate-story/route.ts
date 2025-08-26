import { NextResponse } from "next/server";
import pug from "pug";

type Order = {
  [key: string]: string | number | Date;
};

export async function POST(req: Request) {
  try {
    const { botResponse, story } = await req.json();

    const cleanedOrders = botResponse.map((order: Order) => {
      const dateObj = new Date(order.created_date);
      return {
        ...order,
        created_date: dateObj,
        order_payment_amount: parseFloat(order.order_payment_amount),
        customer_name: (order.customer_name || "").trim() || "Unknown Customer",
        weekday: dateObj.toLocaleDateString("en-US", { weekday: "long" }),
        dateString: dateObj.toDateString(),
      };
    });

    // Time and payment metrics
    const totalOrders = cleanedOrders.length;
    const totalRevenue = cleanedOrders.reduce(
      (sum, order) => sum + order.order_payment_amount,
      0
    );
    const averageOrderValue = totalRevenue / totalOrders || 0;

    const paymentAmounts = cleanedOrders
      .map((o) => o.order_payment_amount)
      .sort((a, b) => a - b);
    const mid = Math.floor(paymentAmounts.length / 2);
    const medianOrderValue =
      paymentAmounts.length % 2 === 0
        ? (paymentAmounts[mid - 1] + paymentAmounts[mid]) / 2
        : paymentAmounts[mid];

    const maxOrderValue = Math.max(...paymentAmounts);
    const minOrderValue = Math.min(...paymentAmounts);

    const sortedByDate = [...cleanedOrders].sort(
      (a, b) => +a.created_date - +b.created_date
    );
    const firstOrderDate = sortedByDate[0]?.dateString;
    const lastOrderDate = sortedByDate[sortedByDate.length - 1]?.dateString;

    const ordersByDate = {};
    const ordersByWeekday = {};
    for (const order of cleanedOrders) {
      const dateStr = order.dateString;
      ordersByDate[dateStr] = (ordersByDate[dateStr] || 0) + 1;
      ordersByWeekday[order.weekday] =
        (ordersByWeekday[order.weekday] || 0) + 1;
    }

    const metrics = {
      count_order_number: totalOrders,
      sum_order_payment_amount: totalRevenue.toFixed(2),
      mean_order_payment_amount: averageOrderValue.toFixed(2),
      median_order_payment_amount: medianOrderValue.toFixed(2),
      max_order_payment_amount: maxOrderValue.toFixed(2),
      min_order_payment_amount: minOrderValue.toFixed(2),
      first_order_date: firstOrderDate,
      last_order_date: lastOrderDate,
      orders_by_date: ordersByDate,
      orders_by_weekday: ordersByWeekday,
    };

    // Pass both orders and metrics to the Pug template
    const compiled = pug.render(story, {
      orders: cleanedOrders,
      metrics,
    });

    return NextResponse.json({ data: compiled, metrics, success: true });
  } catch (error) {
    console.error("Pug error:", error);
    return NextResponse.json({ error: error, success: false });
  }
}
