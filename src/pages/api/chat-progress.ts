// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { chatReplyImage, chatReplyProcess } from "@/service/chatgpt";
import logger from "@/service/logger";
import { ConversationRequest } from "@/store/Chat";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    logger.info("chat-progress", req.url, req.body);

    try {
        const { options = {} } = req.body as {
            options?: ConversationRequest;
        };

        if (options.isImage) {
            res.setHeader("Content-type", "application/json");
            await chatReplyImage(req, res);
            res.end();
        } else {
            res.setHeader("Content-type", "application/octet-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
            await chatReplyProcess(req, res);
            res.end();
        }
    } catch (error: any) {
        logger.error("chat-progress", "chat-progress error:", error);

        const response = { status: "fail", message: error.message, code: error.code || 500 };
        res.setHeader("Content-type", "application/json");
        res.write(JSON.stringify(response));
        res.end();
    }
}
