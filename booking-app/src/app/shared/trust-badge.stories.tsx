import type { Meta, StoryObj } from "@storybook/react-vite";
import { ShieldCheck } from "lucide-react";
import { TrustBadge } from "./trust-badge";

const meta = {
  title: "Shared/TrustBadge",
  component: TrustBadge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof TrustBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "GDPR secure",
    sub: "Your data is encrypted and never shared.",
  },
};
