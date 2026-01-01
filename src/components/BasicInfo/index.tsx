import { Alert, App, Col, Input, Popconfirm, Row } from "antd";
import { useContext, useEffect, useState, memo } from "react";
import Button from "@/components/Button";
import { UserStore } from "@/store/User";
import copyToClipboard from "@/utils/copyToClipboard";
import http from "@/service/http";
import { useRouter } from "next/navigation";
import useIsMobile from "@/hooks/useIsMobile";

interface Props {
    notice?: string;
}

const BasicInfo: React.FC<Props> = memo(({ notice }) => {
    const { userInfo, refreshUserInfo, setUserInfo } = useContext(UserStore);
    const { message } = App.useApp();
    const router = useRouter();
    const isMobile = useIsMobile();
    const [rechargeOpen, setRechargeOpen] = useState(false);
    const [rechargeCode, setChargeCode] = useState("");
    const [rechargeLoading, setRechargeLoading] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");
    const leftSpan = isMobile ? 8 : 6;

    useEffect(() => {
        refreshUserInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onCopyInviteUrl = async () => {
        if (!userInfo) return;
        const url = location.origin + "/login?code=" + userInfo.inviteCode;
        try {
            await copyToClipboard(url);
            message.success("复制成功");
        } catch (error) {
            message.error("复制失败");
        }
    };

    const onLogout = async () => {
        await http.logout();
        router.replace("/login");
    };

    const onReCharge = async () => {
        setRechargeLoading(true);
        try {
            await http.recharget({ key: rechargeCode });
            await refreshUserInfo();
            setRechargeOpen(false);
        } catch (error) {
            console.error(error);
        }
        setRechargeLoading(false);
    };

    const onSaveName = () => {
        if (tempName.trim()) {
            setUserInfo({ ...userInfo, name: tempName.trim() });
            message.success("用户名已保存");
            setIsEditingName(false);
        } else {
            message.error("用户名不能为空");
        }
    };

    const onStartEditName = () => {
        setTempName(userInfo.name || "");
        setIsEditingName(true);
    };

    // 如果用户信息未加载，显示加载状态
    if (!userInfo) {
        return <div className="text-center py-8">加载中...</div>;
    }

    return (
        <div>
            {notice && (
                <Alert
                    className="mb-4"
                    description={<div dangerouslySetInnerHTML={{ __html: notice }} />}
                    type="success"
                    closable
                />
            )}
            <Row align="middle" gutter={[16, 16]}>
                <Col span={leftSpan}>
                    <label>邮箱账号：</label>
                </Col>
                <Col span={24 - leftSpan}>
                    <span>{userInfo.email}</span>
                </Col>
                <Col span={leftSpan}>
                    <label>用户名：</label>
                </Col>
                <Col span={24 - leftSpan}>
                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <Input
                                value={tempName}
                                placeholder="请输入用户名"
                                onChange={(e) => setTempName(e.target.value)}
                                onPressEnter={onSaveName}
                                style={{ maxWidth: 200 }}
                            />
                            <Button type="primary" size="small" onClick={onSaveName}>
                                保存
                            </Button>
                            <Button size="small" onClick={() => setIsEditingName(false)}>
                                取消
                            </Button>
                        </div>
                    ) : (
                        <>
                            <span>{userInfo.name || userInfo.email?.split('@')[0] || "未设置"}</span>
                            <Button type="link" onClick={onStartEditName}>
                                修改
                            </Button>
                        </>
                    )}
                </Col>
                <Col span={leftSpan}>
                    <label>邀请码：</label>
                </Col>
                <Col span={24 - leftSpan}>
                    <span>{userInfo.inviteCode}</span>
                    <Button type="link" onClick={onCopyInviteUrl}>
                        复制邀请链接
                    </Button>
                </Col>
                <Col span={leftSpan}>
                    <label>剩余积分：</label>
                </Col>
                <Col span={24 - leftSpan}>
                    <span>{userInfo.integral}</span>
                    <Popconfirm
                        icon={null}
                        title={
                            <Input
                                value={rechargeCode}
                                placeholder="请输入充值密钥"
                                onChange={(e) => setChargeCode(e.target.value)}
                            />
                        }
                        open={rechargeOpen}
                        cancelText="取消"
                        okText="确认"
                        onConfirm={onReCharge}
                        onCancel={() => setRechargeOpen(false)}
                        okButtonProps={{ loading: rechargeLoading }}
                    >
                        <Button type="link" onClick={() => setRechargeOpen(!rechargeOpen)}>
                            增加积分
                        </Button>
                    </Popconfirm>
                </Col>
                <Col span={24} className="flex justify-center">
                    <Button onClick={onLogout}>退出登录</Button>
                </Col>
            </Row>
        </div>
    );
});

BasicInfo.displayName = 'BasicInfo';

export default BasicInfo;
