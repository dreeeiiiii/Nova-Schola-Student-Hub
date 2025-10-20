import * as ChatService from "../../services/chat.service.js";


export async function searchUsers(req: any, res: any) {
  try {
    const { query } = req.query;
    if (!query) return res.json({ ok: true, users: [] });

    const users = await ChatService.searchUsers(query as string);
    res.json({ ok: true, users });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
}


export async function getUserProfile(req: any, res: any) {
  try {
    const { id } = req.params;
    const user = await ChatService.getUserById(id);
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    res.json({ ok: true, user });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
