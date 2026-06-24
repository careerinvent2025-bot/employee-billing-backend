import { getPlannedDays } from "./dateUtils.js";

export const calculateBilling = (employee, data) => {

  const {
    billing_year,
    month,
    paid_leave = 0,
    unpaid_leave = 0
  } = data;

  const billingRate = Number(employee.billing_rate);

  // ✅ Planned Days
  const planned_days = getPlannedDays(
    billing_year,
    month
  );

  // ✅ Rate Per Day
  const rate_per_day = Math.round(
    billingRate / planned_days
  );

  // ==========================
  // DOJ LOGIC
  // ==========================

  const joiningDate = new Date(employee.doj);

  const monthMap = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };

  const billingMonth = monthMap[month];
  const billingYear = Number(billing_year);

  let joiningDeduction = 0;

  // Employee joined during the billing month
  if (
    joiningDate.getFullYear() === billingYear &&
    joiningDate.getMonth() === billingMonth
  ) {

    joiningDeduction =
      joiningDate.getDate() - 1;
  }

// Employee has not joined yet
else if (
  joiningDate.getFullYear() > billingYear ||
  (
    joiningDate.getFullYear() === billingYear &&
    joiningDate.getMonth() > billingMonth
  )
) {

  return {
    error: `Cannot create billing before joining period. Employee joined on ${joiningDate.toLocaleDateString("en-GB")}`
  };

}
  // ==========================
  // LEAVES
  // ==========================

  // Paid leave does NOT reduce billing
  const total_leave =
    joiningDeduction +
    Number(unpaid_leave);

  // Final Actual Days
  const actual_days = Math.max(
    0,
    planned_days -
      joiningDeduction -
      Number(unpaid_leave)
  );

  // ==========================
  // BILLING AMOUNT
  // ==========================

  const total_amount =
    rate_per_day * actual_days;

  // ==========================
  // GST + TDS LOGIC
  // ==========================

  const isToTheNew =
    employee?.client_name
      ?.trim()
      .toLowerCase() ===
    "to the new";

  const tds = isToTheNew
    ? 0
    : total_amount * 0.10;

  const gst = isToTheNew
    ? 0
    : total_amount * 0.18;

  const post_tds =
    total_amount - tds;

  const invoice_value =
    total_amount + gst;

  return {

    planned_days,

    rate_per_day,

    total_leave,

    actual_days,

    total_amount,

    tds,

    gst,

    post_tds,

    invoice_value,
  };
};