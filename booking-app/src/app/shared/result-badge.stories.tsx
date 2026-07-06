import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResultBadge } from "./result-badge";

const meta = {
  title: "Shared/ResultBadge",
  component: ResultBadge,
  tags: ["autodocs"],
  argTypes: {
    result: { control: "inline-radio", options: ["negative", "positive", "invalid"] },
  },
} satisfies Meta<typeof ResultBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Negative: Story = { args: { result: "negative" } };
export const Positive: Story = { args: { result: "positive" } };
export const Invalid: Story = { args: { result: "invalid" } };
