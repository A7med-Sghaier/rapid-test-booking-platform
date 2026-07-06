import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarDays } from "lucide-react";
import { EmptyState } from "./empty-state";
import { PrimaryButton } from "./buttons";

const meta = {
  title: "Shared/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <CalendarDays className="h-6 w-6" />,
    title: "No appointments",
    description: "Nothing scheduled for this day.",
  },
};

export const WithAction: Story = {
  args: {
    icon: <CalendarDays className="h-6 w-6" />,
    title: "No matches",
    description: "Try another search, date, or filter.",
    action: <PrimaryButton>New appointment</PrimaryButton>,
  },
};
