import Avatar from '@/components/Avatar'
import Text from '@/components/Text'
import {
  CopyOutlined,
  DeleteOutlined,
  PictureFilled,
  ReloadOutlined,
} from '@ant-design/icons'
import { App } from 'antd'
import Button from '@/components/Button'
import Image from '@/components/Image'
import classNames from 'classnames'
import copyToClipboard from '@/utils/copyToClipboard'
import { ChatData } from '@/store/Chat'

interface Props extends Omit<ChatData, 'requestOptions'> {
  onRegenerate?: () => void
  onDelete?: () => void
}

const Message: React.FC<Props> = ({
  inversion,
  dateTime,
  text,
  error,
  loading,
  isImage,
  images,
  onRegenerate,
  onDelete,
}) => {
  const { message } = App.useApp()

  const handleCopy = async () => {
    await copyToClipboard(text || '')
    message.success('复制成功')
  }

    return (
        <div
            className={classNames(
                "flex w-full mb-6 overflow-hidden p-4 rounded-lg transition-shadow",
                "hover:shadow-[0_4px_20px_rgba(0,0,0,0.12),0_-2px_12px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.3),0_-2px_12px_rgba(0,0,0,0.2)]",
                inversion && "flex-row-reverse"
            )}
        >
            <div
                className={classNames(
                    "flex items-center justify-center flex-shrink-0 h-8 overflow-hidden",
                    "rounded-full basis-8",
                    inversion ? "ml-2" : "mr-2"
                )}
            >
                <Avatar isUser={inversion} />
            </div>
            <div
                className={classNames(
                    `overflow-hidden text-sm`,
                    inversion ? "items-end" : "items-start"
                )}
            >
                <p
                    className={classNames(
                        `mb-1 text-xs text-[#b4bbc4]`,
                        inversion ? "text-right" : "text-left"
                    )}
                >
                    {isImage && inversion ? (
                        <PictureFilled style={{ color: "#34D399", marginRight: "5px" }} />
                    ) : null}
                    {dateTime}
                </p>
                <div
                    className={classNames(
                        "flex items-end gap-1 mt-2",
                        inversion ? "flex-row-reverse" : "flex-row"
                    )}
                >
                    {isImage && !inversion ? (
                        // eslint-disable-next-line jsx-a11y/alt-text
                        <Image urls={images} loading={loading} onRegenerate={onRegenerate} />
                    ) : (
                        <Text inversion={inversion} text={text} error={error} loading={loading} />
                    )}
                    <div className="flex flex-col gap-1">
                        {!inversion && (
                            <>
                                <Button
                                    type="text"
                                    className={classNames(
                                        "transition text-neutral-400 hover:text-white hover:bg-neutral-600",
                                        "flex items-center justify-center w-6 h-6 p-0 rounded-full dark:hover:bg-neutral-700"
                                    )}
                                    onClick={onRegenerate}
                                >
                                    <ReloadOutlined className="text-xs" />
                                </Button>
                                <Button
                                    type="text"
                                    className={classNames(
                                        "transition text-neutral-400 hover:text-white hover:bg-neutral-600",
                                        "flex items-center justify-center w-6 h-6 p-0 rounded-full dark:hover:bg-neutral-700"
                                    )}
                                    onClick={handleCopy}
                                >
                                    <CopyOutlined className="text-xs" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Message;
