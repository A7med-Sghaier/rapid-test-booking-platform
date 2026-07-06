import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertTriangle, BadgeCheck } from "lucide-react";
import { Alert } from "./alert";

const meta = {
  title: "Shared/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: { tone: { control: "inline-radio", options: ["danger", "warning", "info"] } },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: { icon: <BadgeCheck className="h-4 w-4" />, tone: "info", title: "All caught up", sub: "No positive results pending report." },
};

export const Danger: Story = {
  args: { icon: <AlertTriangle className="h-4 w-4" />, tone: "danger", title: "Report pending", sub: "A positive result needs to be transmitted." },
};
