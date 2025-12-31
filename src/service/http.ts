import { Client, Options, Response } from "web-rest-client";
import { LoginInfo, RegisterInfo } from "@/app/(auth)/login/page";
import { SendResponseOptions } from "@/service/server";
import { UserInfo } from "@/store/User";
import { OrderParams, OrderResult, OrderStatus } from "@/components/Billing";

interface ReuqestOptions extends Omit<Options, "url" | "method"> {
    silent?: boolean;
}

// 用于存储 message API 的全局引用
let globalMessageApi: any = null;

export function setMessageApi(messageApi: any) {
    globalMessageApi = messageApi;
}

class HttpService extends Client {
    constructor() {
        super();

        this.responsePlugins.push((res: Response, next: () => void) => {
            const { status, data, statusText, config } = res;
            const {
                message: msg,
                data: resData,
                status: successStatus,
            } = (data as unknown as SendResponseOptions) || {};
            const isSuccess = status === 200 && successStatus === "success";

            if (!isSuccess) {
                if (!config.silent) {
                    const errorMsg = msg || (statusText ? `${status} ${statusText}` : '请求失败');
                    // 使用全局 message API（如果可用）
                    if (globalMessageApi) {
                        globalMessageApi.error(errorMsg);
                    } else {
                        // 降级方案：在控制台输出
                        console.error('[HTTP Error]:', errorMsg);
                    }
                }
            } else {
                res.data = resData;
            }

            if (successStatus === "fail") {
                res.status = 999;
            }

            next();
        });
    }

    fetchChatAPIProgress(body: any, options: ReuqestOptions) {
        return this.post("/api/chat-progress", body, options);
    }

    login(body: LoginInfo) {
        return this.post("/api/v1/user/login", body) as Promise<string>;
    }

    logout() {
        return this.post("/api/logout");
    }

    sendCode(body: { email: string }) {
        return this.post("/api/v1/user/verify/send_code", body);
    }

    register(body: RegisterInfo) {
        return this.post("/api/v1/user/register", body) as Promise<string>;
    }

    getUserInfo() {
        return this.get("/api/v1/user/profile") as Promise<UserInfo>;
    }

    getNotice() {
        return this.get("/api/notice") as Promise<string>;
    }

    recharget(body: { key: string }) {
        return this.post("/api/v1/integral/recharge", body);
    }

    createOrder(body: OrderParams) {
        return this.post("/api/v1/pay/pre_create", body) as Promise<OrderResult>;
    }

    checkOrder(orderId: number) {
        return this.get("/api/v1/pay/status", { orderId }) as Promise<OrderStatus>;
    }

    // Conversation APIs
    getConversations() {
        return this.get("/api/v1/conversation") as Promise<{ uuid: number; title: string }[]>;
    }

    createConversation(body: { uuid: number; title?: string }) {
        return this.post("/api/v1/conversation", body);
    }

    updateConversation(uuid: number, body: { title: string }) {
        return this.put(`/api/v1/conversation/${uuid}`, body);
    }

    deleteConversation(uuid: number) {
        return this.delete(`/api/v1/conversation/${uuid}`);
    }
}

const http = new HttpService();
export default http;
