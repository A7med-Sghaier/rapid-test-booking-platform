import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stepper } from "./stepper";

const meta = {
  title: "Public/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  argTypes: { step: { control: { type: "range", min: 0, max: 2, step: 1 } } },
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TestType: Story = { args: { step: 0 } };
export const Appointment: Story = { args: { step: 1 } };
export const Details: Story = { args: { step: 2 } };
