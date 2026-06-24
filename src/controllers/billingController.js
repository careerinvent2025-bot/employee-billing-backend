import pool from "../config/db.js";
import { calculateBilling } from "../utils/calculate.js";

// ================= CREATE BILLING =================
export const createBilling = async (req, res) => {
  try {
    const { employee_id, billing_year, month } = req.body;

    const paid_leave = Number(req.body.paid_leave) || 0;
    const unpaid_leave = Number(req.body.unpaid_leave) || 0;

    // CHECK DUPLICATE
    const existing = await pool.query(
      `
      SELECT *
      FROM monthly_billing
      WHERE employee_id = $1
      AND billing_year = $2
      AND month = $3
      `,
      [employee_id, billing_year, month]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: "Invoice already exists for this employee, month, and year",
      });
    }

    // FETCH EMPLOYEE + CLIENT
    const empRes = await pool.query(
      `
      SELECT
        e.*,
        c.client_name
      FROM employees e
      LEFT JOIN clients c
      ON e.client_id = c.id
      WHERE e.id = $1
      `,
      [employee_id]
    );

    if (empRes.rows.length === 0) {
      return res.status(404).json({
        error: "Employee not found",
      });
    }

    const employee = empRes.rows[0];

    const calc = calculateBilling(employee, {
      billing_year,
      month,
      paid_leave,
      unpaid_leave,
    });

    if (calc.error) {
  return res.status(400).json({
    error: calc.error
  });
}

    // AUTO INVOICE NUMBER
    const invoice_number = `INV-${billing_year}-${month
      .slice(0, 3)
      .toUpperCase()}-${employee_id}-${Date.now()}`;

    const result = await pool.query(
      `
      INSERT INTO monthly_billing
      (
        employee_id,
        billing_year,
        month,
        paid_leave,
        unpaid_leave,
        total_leave,
        actual_days,
        total_amount,
        tds,
        gst,
        post_tds,
        invoice_value,
        invoice_number
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      )
      RETURNING *
      `,
      [
        employee_id,
        billing_year,
        month,
        paid_leave,
        unpaid_leave,
        calc.total_leave,
        calc.actual_days,
        calc.total_amount,
        calc.tds,
        calc.gst,
        calc.post_tds,
        calc.invoice_value,
        invoice_number,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERROR:", err);

    if (err.code === "23505") {
      return res.status(400).json({
        error: "Duplicate invoice not allowed",
      });
    }

    res.status(500).json({
      error: "Server Error",
    });
  }
};

// ================= GET ALL BILLING =================
export const getAllBilling = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        mb.*,
        e.name,
        e.designation,
        e.billing_rate,
        c.client_name
      FROM monthly_billing mb
      JOIN employees e
      ON mb.employee_id = e.id
      JOIN clients c
      ON e.client_id = c.id
      ORDER BY mb.id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
};

export const deleteBilling = async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM monthly_billing
      WHERE id = $1
      `,
      [id]
    );

    res.json({
      message: "Deleted Successfully"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server Error"
    });

  }
};
