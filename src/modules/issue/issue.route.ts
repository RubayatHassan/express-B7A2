import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const router = Router();

router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getIssueById);
// router.put("/:id", auth(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.updateIssueById);
router.patch("/:id", auth(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.updateIssueById);
router.delete("/:id", auth(USER_ROLE.maintainer), issueController.deleteIssueById);
router.post("/", auth(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.createIssue);

export const issueRoute = router;
