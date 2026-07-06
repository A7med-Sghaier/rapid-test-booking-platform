import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusBadge } from "./status-badge";

const meta = {
  title: "Shared/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  argTypes: {
    status: { control: "inline-radio", options: ["waiting", "checked-in", "completed", "canceled"] },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Waiting: Story = { args: { status: "waiting" } };
export const CheckedIn: Story = { args: { status: "checked-in" } };
export const Completed: Story = { args: { status: "completed" } };
export const Canceled: Story = { args: { status: "canceled" } };
