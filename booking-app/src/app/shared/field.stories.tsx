import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field } from "./field";

const meta = {
  title: "Shared/Field",
  component: Field,
  tags: ["autodocs"],
  render: (args) => {
    const [value, setValue] = useState(args.value ?? "");
    return (
      <div className="w-80">
        <Field {...args} value={value} onChange={setValue} />
      </div>
    );
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: "First name", value: "", onChange: () => {} } };
export const Required: Story = { args: { label: "Email", type: "email", required: true, value: "", onChange: () => {} } };
export const WithError: Story = {
  args: { label: "Email", type: "email", required: true, value: "not-an-email", error: "Enter a valid email address", onChange: () => {} },
};
