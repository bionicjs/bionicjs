import { Prompt, wrapTextWithPrefix } from "@clack/core";
import {
  S_BAR,
  S_BAR_END,
  S_CHECKBOX_ACTIVE,
  S_CHECKBOX_INACTIVE,
  S_CHECKBOX_SELECTED,
  formatInstructionFooter,
  limitOptions,
  settings,
  symbol,
  symbolBar,
} from "@clack/prompts";
import type { Readable, Writable } from "node:stream";
import { styleText } from "node:util";

export interface ChecklistOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ChecklistOptions {
  message: string;
  options: ChecklistOption[];
  /** Label for the trailing row that commits the selection. Defaults to "Done". */
  doneLabel?: string;
  initialValue?: string[];
}

/** Minimal structural match for node:readline's `Key`, since it isn't exported. */
interface KeyInfo {
  name?: string | undefined;
  ctrl?: boolean | undefined;
  shift?: boolean | undefined;
  alt?: boolean | undefined;
  sequence?: string | undefined;
}

const DONE_VALUE = "__done__";

type OptionState =
  | "disabled"
  | "active"
  | "selected"
  | "active-selected"
  | "inactive"
  | "submitted"
  | "cancelled";

const CHECKLIST_INSTRUCTIONS = [
  `${styleText("dim", "↑/↓")} to navigate`,
  `${styleText("dim", "Space/Enter")} toggle`,
  `${styleText("dim", "Done")} to finish`,
];

/**
 * A checkbox list in the style of @clack/prompts' multiselect, but with keys
 * that match typical dev-tool UX:
 *
 * - `↑`/`↓` move the cursor
 * - `Space`/`Enter` toggle the highlighted option
 * - `a`/`Tab` select/deselect all
 * - Enter (or Space) on the trailing "Done" row commits the selection
 *
 * Built on @clack/core's `Prompt` so rendering, raw-mode, resize handling and
 * cancel semantics stay identical to the rest of create-bionicjs.
 */
export class ChecklistPrompt extends Prompt<string[]> {
  readonly message: string;
  readonly realOptions: ChecklistOption[];
  readonly options: ChecklistOption[];
  readonly doneIndex: number;
  cursor = 0;
  selected: string[];

  constructor(
    opts: ChecklistOptions,
    input?: Readable,
    output?: Writable,
  ) {
    const done = { value: DONE_VALUE, label: opts.doneLabel ?? "Done" };
    super({
      render: () => this.renderContent(),
      initialValue: opts.initialValue,
      input,
      output,
    }, false);

    this.message = opts.message;
    this.realOptions = opts.options;
    this.options = [...opts.options, done];
    this.doneIndex = this.options.length - 1;
    this.selected = [...(opts.initialValue ?? [])];
    this.value = this.selection;
    this.on("key", (char, key) => this.handleKey(char, key));
  }

  get selection(): string[] {
    return this.selected.filter((value) => value !== DONE_VALUE);
  }

  protected _shouldSubmit(): boolean {
    return false;
  }

  private handleKey(char: string | undefined, key: KeyInfo): void {
    switch (key.name) {
      case "up":
        this.cursor = Math.max(0, this.cursor - 1);
        return;
      case "down":
        this.cursor = Math.min(this.options.length - 1, this.cursor + 1);
        return;
      case "return":
      case "space":
        if (this.cursor === this.doneIndex) {
          this.value = this.selection;
          this.state = "submit";
        } else {
          this.toggle(this.options[this.cursor]);
        }
        return;
      case "tab":
        this.toggleAll();
        return;
      default:
        if (char?.toLowerCase() === "a") this.toggleAll();
    }
  }

  private toggle(option: ChecklistOption): void {
    if (option.disabled) return;
    this.selected = this.selected.includes(option.value)
      ? this.selected.filter((value) => value !== option.value)
      : [...this.selected, option.value];
    this.value = this.selection;
  }

  private toggleAll(): void {
    const enabled = this.realOptions.filter((option) => !option.disabled);
    const allSelected = enabled.every((option) =>
      this.selected.includes(option.value),
    );
    this.selected = allSelected
      ? []
      : enabled.map((option) => option.value);
    this.value = this.selection;
  }

  private styleOption(option: ChecklistOption, state: OptionState): string {
    const label = option.label ?? String(option.value);
    switch (state) {
      case "disabled":
        return `${styleText("gray", S_CHECKBOX_INACTIVE)} ${styleText(["strikethrough", "gray"], label)}`;
      case "active":
        return `${styleText("cyan", S_CHECKBOX_ACTIVE)} ${label}`;
      case "selected":
        return `${styleText("green", S_CHECKBOX_SELECTED)} ${styleText("dim", label)}`;
      case "active-selected":
        return `${styleText("green", S_CHECKBOX_SELECTED)} ${label}`;
      case "cancelled":
        return styleText(["strikethrough", "dim"], label);
      case "submitted":
        return styleText("dim", label);
      default:
        return `${styleText("dim", S_CHECKBOX_INACTIVE)} ${styleText("dim", label)}`;
    }
  }

  private styleListOption(option: ChecklistOption, focused: boolean): string {
    if (option.disabled) return this.styleOption(option, "disabled");
    if (option.value === DONE_VALUE) {
      return focused
        ? styleText("cyan", `»  ${option.label}`)
        : styleText("dim", `»  ${option.label}`);
    }
    const isSelected = this.selected.includes(option.value);
    if (isSelected && focused) return this.styleOption(option, "active-selected");
    if (isSelected) return this.styleOption(option, "selected");
    if (focused) return this.styleOption(option, "active");
    return this.styleOption(option, "inactive");
  }

  private renderContent(): string {
    const withGuide = settings.withGuide;
    const header = wrapTextWithPrefix(
      this.output,
      this.message,
      withGuide ? `${symbolBar(this.state)}  ` : "",
      `${symbol(this.state)}  `,
    );
    const frame = `${withGuide ? `${styleText("gray", S_BAR)}\n` : ""}${header}\n`;

    switch (this.state) {
      case "submit": {
        const picked = this.realOptions
          .filter((option) => !option.disabled && this.selected.includes(option.value))
          .map((option) => this.styleOption(option, "submitted"))
          .join(styleText("dim", ", ")) || styleText("dim", "none");
        const line = wrapTextWithPrefix(
          this.output,
          picked,
          withGuide ? `${styleText("gray", S_BAR)}  ` : "",
        );
        return `${frame}${line}`;
      }
      case "cancel": {
        const picked = this.realOptions
          .filter((option) => !option.disabled && this.selected.includes(option.value))
          .map((option) => this.styleOption(option, "cancelled"))
          .join(styleText("dim", ", "));
        if (picked.trim() === "") return `${frame}${styleText("gray", S_BAR)}`;
        const line = wrapTextWithPrefix(
          this.output,
          picked,
          withGuide ? `${styleText("gray", S_BAR)}  ` : "",
        );
        return `${frame}${line}${withGuide ? `\n${styleText("gray", S_BAR)}` : ""}`;
      }
      default: {
        const bar = withGuide ? `${styleText("cyan", S_BAR)}  ` : "";
        const instructions = withGuide
          ? formatInstructionFooter(CHECKLIST_INSTRUCTIONS, withGuide)
          : [];
        const footer = instructions.join("\n");
        const list = limitOptions({
          output: this.output,
          options: this.options,
          cursor: this.cursor,
          maxItems: this.options.length,
          columnPadding: bar.length,
          rowPadding: frame.split("\n").length + instructions.length + 1,
          style: (option, focused) => this.styleListOption(option, focused),
        }).join(`\n${bar}`);
        return `${frame}${bar}${list}\n${footer}\n`;
      }
    }
  }
}