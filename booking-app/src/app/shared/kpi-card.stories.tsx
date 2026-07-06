import type { Meta, StoryObj } from "@storybook/react-vite";
import { BadgeCheck, CalendarDays, TrendingUp } from "lucide-react";
import { KpiCard } from "./kpi-card";

const meta = {
  title: "Shared/KpiCard",
  component: KpiCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof KpiCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Appointments", value: 128, icon: <CalendarDays className="h-4.5 w-4.5" /> },
};

export const Success: Story = {
  args: { label: "Results completed", value: 94, tone: "success", icon: <BadgeCheck className="h-4.5 w-4.5" /> },
};

export const WithDelta: Story = {
  args: { label: "Positivity rate", value: "3.2%", delta: "+0.4%", tone: "danger", icon: <TrendingUp className="h-4.5 w-4.5" /> },
};
