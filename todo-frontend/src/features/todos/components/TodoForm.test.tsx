import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TodoForm } from "@/features/todos/components/TodoForm";

describe("TodoForm", () => {
  it("submits a trimmed title and clears the input", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TodoForm isSaving={false} onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText("Add a new task");
    const addButton = screen.getByRole("button", { name: "Add" });

    await user.type(input, "   ship tests   ");
    await user.click(addButton);

    expect(onSubmit).toHaveBeenCalledWith("ship tests");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue("");
  });

  it("does not submit blank text", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TodoForm isSaving={false} onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText("Add a new task");
    const addButton = screen.getByRole("button", { name: "Add" });

    await user.type(input, "   ");
    expect(addButton).toBeDisabled();

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
