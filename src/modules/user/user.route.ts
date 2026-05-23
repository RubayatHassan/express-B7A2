import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";
import { userController } from "./user.controller";

const router = Router();

router.post("/", userController.createUser);

router.get("/:id", userController.getSingleUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export const userRoute = router;
