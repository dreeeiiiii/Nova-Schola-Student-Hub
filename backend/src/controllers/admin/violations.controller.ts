import { Response } from "express";
import { ViolationService } from "../../services/violations.service.js";
import { AuthedRequest } from "../../middleware/auth.middleware.js";

/* ----------------------- List all violations ----------------------- */
export async function listViolations(req: AuthedRequest, res: Response) {
  try {
    const data = await ViolationService.list();
    res.json({ data });
  } catch (err) {
    console.error("❌ Error listing violations:", err);
    res.status(500).json({ error: "Failed to fetch violation reports." });
  }
}

/* ----------------------- Create violation ----------------------- */
export async function createViolation(req: AuthedRequest, res: Response) {
  try {
    const { name, role, reason, reportedBy } = req.body;
    if (!name || !role || !reason || !reportedBy) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const violation = await ViolationService.create({
      name,
      role,
      reason,
      reportedBy,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
    });

    res.status(201).json({ data: violation });
  } catch (err) {
    console.error("❌ Error creating violation:", err);
    res.status(500).json({ error: "Failed to create violation report." });
  }
}

/* ----------------------- Update status ----------------------- */
export async function updateViolationStatus(req: AuthedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!id) return res.status(400).json({ error: "Missing violation ID." });

    const updated = await ViolationService.updateStatus(id, status);
    if (!updated) return res.status(404).json({ error: "Violation not found." });
    res.json({ data: updated });
  } catch (err) {
    console.error("❌ Error updating violation:", err);
    res.status(500).json({ error: "Failed to update violation status." });
  }
}

/* ----------------------- Delete violation ----------------------- */
export async function deleteViolation(req: AuthedRequest, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await ViolationService.remove(id);
    if (!deleted)
      return res.status(404).json({ error: "Violation not found." });
    res.json({ message: "Violation deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting violation:", err);
    res.status(500).json({ error: "Failed to delete violation." });
  }
}
