import { pool } from "../../db";

const createIssueInDB = async (payload: any, reporter_id: number | string) => {
  const { status, type, description, title } = payload;
  const user = await pool.query(
    `
    SELECT * FROM users WHERE id=$1
    `,
    [reporter_id],
  );

  if (user.rows.length === 0) {
    throw new Error("User not exists!");
  }

  const normalizedStatus = status ?? "open";
  const result = await pool.query(
    `
   INSERT INTO issues(reporter_id, status, type, description, title) VALUES($1,$2,$3,$4,$5) RETURNING *
    `,
    [reporter_id, normalizedStatus, type, description, title],
  );
  return result;
};

const getAllIssuesFromDB = async () => {
  return pool.query(
    `
      SELECT
        issues.id,
        issues.title,
        issues.description,
        issues.type,
        issues.status,
        json_build_object(
          'id', users.id,
          'name', users.name,
          'role', users.role
        ) AS reporter,
        issues.created_at,
        issues.updated_at
      FROM issues
      JOIN users ON issues.reporter_id = users.id
      ORDER BY issues.created_at DESC
    `,
  );
};

const getIssueByIdFromDB = async (issueId: number) => {
  return pool.query(
    `
      SELECT
        issues.id,
        issues.reporter_id,
        issues.title,
        issues.description,
        issues.type,
        issues.status,
        json_build_object(
          'id', users.id,
          'name', users.name,
          'role', users.role
        ) AS reporter,
        issues.created_at,
        issues.updated_at
      FROM issues
      JOIN users ON issues.reporter_id = users.id
      WHERE issues.id = $1
      LIMIT 1
    `,
    [issueId],
  );
};

const updateIssueByIdFromDB = async (
  issueId: number,
  userId: number | string,
  userRole: string,
  payload: any,
) => {
  const issueResult = await pool.query(
    `
      SELECT id, reporter_id, status, title, description, type
      FROM issues
      WHERE id = $1
    `,
    [issueId],
  );

  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }

  const issue = issueResult.rows[0];

  if (userRole !== "maintainer") {
    if (issue.reporter_id !== Number(userId)) {
      throw new Error("Forbidden: cannot update this issue");
    }
    if (issue.status !== "open") {
      throw new Error("Forbidden: cannot update this issue");
    }
  }

  const updatedTitle = payload.title ?? issue.title;
  const updatedDescription = payload.description ?? issue.description;
  const updatedType = payload.type ?? issue.type;
  const updatedStatus = issue.status === "open" ? "in_progress" : issue.status;

  return pool.query(
    `
      UPDATE issues
      SET title = $1,
          description = $2,
          type = $3,
          status = $4,
          updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `,
    [updatedTitle, updatedDescription, updatedType, updatedStatus, issueId],
  );
};

const deleteIssueByIdFromDB = async (issueId: number) => {
  return pool.query(
    `
      DELETE FROM issues WHERE id = $1 RETURNING *
    `,
    [issueId],
  );
};

export const issueService = {
  createIssueInDB,
  getAllIssuesFromDB,
  getIssueByIdFromDB,
  updateIssueByIdFromDB,
  deleteIssueByIdFromDB,
};
