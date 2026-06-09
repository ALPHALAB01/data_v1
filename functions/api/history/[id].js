// /api/history/:id  ->  수정(PUT) / 삭제(DELETE)
import { normalizeYMD, normalizeKeywords, normalizeAmount, json } from "../_lib.js";

export async function onRequestPut({ request, env, params }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return json({ ok: false, error: "잘못된 ID" }, 400);

    const body = await request.json();
    const content = (body.content || "").trim();
    if (!content) return json({ ok: false, error: "내용은 필수입니다." }, 400);

    const startYMD = normalizeYMD(body.time || "");
    const endYMD = normalizeYMD(body.time_end || "");
    const keywords = normalizeKeywords(body.keywords || "");
    const detail = (body.detail || "").trim();
    const amount = normalizeAmount(body.amount || "");
    const client = (body.client || "").trim();
    const isDefault = body.is_default ? 1 : 0;
    const hiddenInHistory = body.hidden_in_history ? 1 : 0;

    await env.DB.prepare(
      "UPDATE history SET time=?, time_end=?, content=?, detail=?, keywords=?, amount=?, client=?, is_default=?, hidden_in_history=? WHERE id=?"
    ).bind(startYMD, endYMD, content, detail, keywords, amount, client, isDefault, hiddenInHistory, id).run();

    return json({
      ok: true,
      item: { id, time: startYMD, time_end: endYMD, content, detail, keywords, amount, client, is_default: isDefault, hidden_in_history: hiddenInHistory }
    });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
}

export async function onRequestDelete({ env, params }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return json({ ok: false, error: "잘못된 ID" }, 400);
    await env.DB.prepare("DELETE FROM history WHERE id = ?").bind(id).run();
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
}
