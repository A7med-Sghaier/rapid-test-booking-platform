import type { Meta, StoryObj } from "@storybook/react-vite";
import { LiveDot } from "./live-dot";

const meta = {
  title: "Shared/LiveDot",
  component: LiveDot,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof LiveDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const CustomLabel: Story = { args: { label: "Live queue" } };
