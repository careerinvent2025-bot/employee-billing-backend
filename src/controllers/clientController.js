import pool from "../config/db.js";

export const createClient = async (req, res) => {
  try {

    const {
      client_name,
      gst_number,
      tds_enabled
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO clients
      (client_name, gst_number, tds_enabled)
      VALUES ($1, $2, COALESCE($3, false))
      RETURNING *
      `,
      [client_name, gst_number, tds_enabled]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Server Error" });
  }
};


// ✅ GET ALL CLIENTS + EMPLOYEE COUNT
export const getAllClients = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(e.id) AS employee_count
      FROM clients c
      LEFT JOIN employees e ON e.client_id = c.id
      GROUP BY c.id
      ORDER BY c.id DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};


// ✅ GET EMPLOYEES BY CLIENT
export const getEmployeesByClient = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM employees WHERE client_id = $1",
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};


export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔍 Check employees exist
    const check = await pool.query(
      "SELECT * FROM employees WHERE client_id = $1",
      [id]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({
        error: "Cannot delete client with assigned employees"
      });
    }

    await pool.query("DELETE FROM clients WHERE id = $1", [id]);

    res.json({ message: "Client deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};