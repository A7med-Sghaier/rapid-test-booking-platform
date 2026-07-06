import type { Meta, StoryObj } from "@storybook/react-vite";
import { Logo } from "./logo";

const meta = {
  title: "Shared/Logo",
  component: Logo,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Compact: Story = { args: { compact: true } };
export const Dark: Story = {
  args: { dark: true },
  parameters: { backgrounds: { default: "sidebar" } },
};
