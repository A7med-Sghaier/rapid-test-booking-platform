import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilterSelect } from "./filter-select";

const meta = {
  title: "Admin/FilterSelect",
  component: FilterSelect,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof FilterSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Status",
    value: "all",
    onChange: () => {},
    options: [
      { value: "all", label: "All statuses" },
      { value: "waiting", label: "Waiting" },
      { value: "checked-in", label: "Checked in" },
      { value: "completed", label: "Completed" },
    ],
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <FilterSelect {...args} value={value} onChange={setValue} />;
  },
};
