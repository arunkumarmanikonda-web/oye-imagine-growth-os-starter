import Link from "next/link";
import type { Route } from "next";
import type { CSSProperties, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function PublicMain(props: { children: ReactNode; className?: string }) {
  return <main className={cx("oi-section", props.className)}>{props.children}</main>;
}

export function PublicContainer(props: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={cx("oi-container", props.className)} style={props.style}>
      {props.children}
    </div>
  );
}

export function PublicCard(props: { children: ReactNode; className?: string }) {
  return <div className={cx("oi-card", props.className)}>{props.children}</div>;
}

export function PublicSectionBlock(props: { children: ReactNode; className?: string }) {
  return <section className={cx("oi-flow-section", props.className)}>{props.children}</section>;
}

export function PublicBadge(props: { children: ReactNode; className?: string }) {
  return <span className={cx("oi-pill", props.className)}>{props.children}</span>;
}

export function PublicButtonLink(props: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "accent" | "ghost";
  className?: string;
}) {
  const variantClass =
    props.variant === "secondary"
      ? "oi-btn-secondary"
      : props.variant === "accent"
        ? "oi-btn-accent"
        : props.variant === "ghost"
          ? "oi-btn-ghost"
          : "oi-btn-primary";

  return (
    <Link href={props.href as Route} className={cx("oi-btn", variantClass, props.className)}>
      {props.children}
    </Link>
  );
}

export function PublicTextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input {...rest} className={cx("oi-input", className)} />;
}

export function PublicTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return <textarea {...rest} className={cx("oi-textarea", className)} />;
}