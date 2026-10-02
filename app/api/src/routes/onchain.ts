import { Router } from "express";
import { getEvmBlock, getLatestOnchain, getSolanaSlot, listOnchainSources } from "../services/onchain.js";
const router = Router();
router.get("/sources", (_req, res) => res.json({ sources: listOnchainSources() }));
router.get("/latest", async (_req, res) => { try { res.json({ generatedAt: new Date().toISOString(), results: await getLatestOnchain() }); } catch (error) { res.status(502).json({ error: error instanceof Error ? error.message : "On-chain fetch failed" }); } });
router.get("/evm/:chain/block", async (req, res) => { try { res.json(await getEvmBlock(req.params.chain, typeof req.query.tag === "string" ? req.query.tag : "latest")); } catch (error) { res.status(502).json({ error: error instanceof Error ? error.message : "EVM block fetch failed" }); } });
router.get("/solana/slot", async (_req, res) => { try { res.json(await getSolanaSlot()); } catch (error) { res.status(502).json({ error: error instanceof Error ? error.message : "Solana slot fetch failed" }); } });
export { router as onchainRouter };
