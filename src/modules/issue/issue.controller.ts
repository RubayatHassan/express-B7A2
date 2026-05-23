import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const getAllIssues = async (_req: Request, res: Response) => {
  try {
    const result = await issueService.getAllIssuesFromDB();
    res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getIssueById = async (req: Request, res: Response) => {
  try {
    const issueId = Number(req.params.id);
    if (Number.isNaN(issueId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue id",
      });
    }

    const result = await issueService.getIssueByIdFromDB(issueId);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue retrieved successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const deleteIssueById = async (req: Request, res: Response) => {
  try {
    const issueId = Number(req.params.id);
    if (Number.isNaN(issueId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue id",
      });
    }

    const result = await issueService.deleteIssueByIdFromDB(issueId);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const updateIssueById = async (req: Request, res: Response) => {
  try {
    const issueId = Number(req.params.id);
    if (Number.isNaN(issueId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue id",
      });
    }

    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized to update issue",
      });
    }

    const result = await issueService.updateIssueByIdFromDB(issueId, userId, userRole, req.body);
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    if (error.message === "Issue not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message === "Forbidden: cannot update this issue") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const createIssue = async (req: Request, res: Response) => {
  try {
    const reporter_id = req.user?.id;
    if (!reporter_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized to create issue",
      });
    }

    const result = await issueService.createIssueInDB(req.body, reporter_id);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const issueController = {
  getAllIssues,
  getIssueById,
  updateIssueById,
  deleteIssueById,
  createIssue,
};
