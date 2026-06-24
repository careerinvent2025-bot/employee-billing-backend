import pool from "../config/db.js";

// CREATE EMPLOYEE
export const createEmployee = async (req, res) => {
  try {

    const {
      name,
      doj,
      designation,
      billing_rate,
      client_id
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO employees
      (
        name,
        doj,
        designation,
        billing_rate,
        client_id
      )
      VALUES
      (
        $1,$2,$3,$4,$5
      )
      RETURNING *
      `,
      [
        name,
        doj,
        designation,
        Number(billing_rate),
        client_id
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.error("ERROR:", err);

    res.status(500).json({
      error: "Server Error"
    });
  }
};


// GET ALL EMPLOYEES
export const getAllEmployees = async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        e.*,
        c.client_name,
        c.tds_enabled
      FROM employees e
      LEFT JOIN clients c
        ON e.client_id = c.id
      ORDER BY e.id DESC
    `);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server Error"
    });
  }
};


// DELETE EMPLOYEE
export const deleteEmployee = async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      "DELETE FROM employees WHERE id = $1",
      [id]
    );

    res.json({
      message: "Deleted successfully"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Delete Failed"
    });
  }
};


// UPDATE EMPLOYEE
export const updateEmployee = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      name,
      doj,
      designation,
      billing_rate,
      client_id
    } = req.body;

    const result = await pool.query(
      `
      UPDATE employees
      SET
        name = $1,
        doj = $2,
        designation = $3,
        billing_rate = $4,
        client_id = $5
      WHERE id = $6
      RETURNING *
      `,
      [
        name,
        doj,
        designation,
        Number(billing_rate),
        client_id,
        id
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Update Failed"
    });
  }
};

