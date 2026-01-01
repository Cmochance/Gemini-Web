import Image from "next/image";

const GeminiIcon = () => {
    return (
        <Image
            src="/gemini-icon.svg"
            alt="Gemini"
            width={32}
            height={32}
            priority
        />
    );
};

export default GeminiIcon;
