import { ShareDetails } from "api";

export const shareDetails: ShareDetails[] = [
    {
        id: 1,
        type: "public",
        title: "Public",
        description:
            "Generate a public URL that anyone you share it to can access. This URL will be valid until you disable it. Deletion of the file from the entire Internet is not granted.",
        state: "enabled",
    },
    {
        id: 2,
        type: "one-time",
        title: "One-time",
        description:
            "Generate a single-use URL that is valid for one-time access. Once accessed, the link becomes invalid.",
        state: "enabled",
    },
    {
        id: 3,
        type: "monthly",
        title: "Monthly Access",
        description:
            "Generate a URL with access valid for one month. After one month, the link will expire and no longer provide access.",
        state: "enabled",
    },
    {
        id: 4,
        type: "email",
        title: "Email Sharing",
        description:
            "Share by entering an email address. The shared file will be directly available in the recipient's files without the need for a URL.",
        state: "enabled",
    },
    {
        id: 5,
        type: "wallet",
        title: "Wallet Sharing",
        description:
            "Share by entering the recipient's wallet address (e.g., 0x6662A2443f45Fc8F20D86e7b0ed18FA4F536833a). The shared file will be directly available in the recipient's files.",
        state: "enabled",
    }
];
