import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Modal } from "./modal";
import { GhostButton, PrimaryButton } from "./buttons";

const meta = {
  title: "Shared/Modal",
  component: Modal,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Edit agent",
    onClose: () => {},
    children: (
      <p className="text-sm text-muted-foreground">
        Accessible dialog with focus trapping, escape-to-close, scroll lock and a backdrop click.
      </p>
    ),
  },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-6">
        <PrimaryButton onClick={() => setOpen(true)}>Open modal</PrimaryButton>
        {open && (
          <Modal
            {...args}
            onClose={() => setOpen(false)}
            footer={
              <>
                <GhostButton onClick={() => setOpen(false)}>Cancel</GhostButton>
                <PrimaryButton onClick={() => setOpen(false)}>Save changes</PrimaryButton>
              </>
            }
          />
        )}
      </div>
    );
  },
};
