import express from "express";
import * as contactsController from "../../controllers/student/contact.controller.js";

const router = express.Router();

router.get("/", contactsController.getContacts);

export default router;
