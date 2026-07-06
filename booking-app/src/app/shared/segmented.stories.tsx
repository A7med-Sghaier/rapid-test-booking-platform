import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Segmented } from "./segmented";

const meta = {
  title: "Shared/Segmented",
  component: Segmented,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Segmented<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "waiting",
    onChange: () => {},
    options: [
      { value: "waiting", label: "Waiting", count: 5 },
      { value: "checked-in", label: "Checked in", count: 2 },
      { value: "completed", label: "Completed", count: 12 },
    ],
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <Segmented {...args} value={value} onChange={setValue} />;
  },
};
