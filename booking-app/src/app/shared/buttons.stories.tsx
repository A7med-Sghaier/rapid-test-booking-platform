import type { Meta, StoryObj } from "@storybook/react-vite";
import { PrimaryButton } from "./buttons";

const meta = {
  title: "Shared/Buttons",
  component: PrimaryButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof PrimaryButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { children: "Save changes" } };
export const Disabled: Story = { args: { children: "Save changes", disabled: true } };
