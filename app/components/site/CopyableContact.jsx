"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

export default function CopyableContact({
  className = "",
  href,
  icon,
  value,
  children,
  copiedLabel = "Copied",
  copyValue
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyValue ?? value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const content = (
    <>
      {icon ? <span className="copy-contact-icon" aria-hidden="true">{icon}</span> : null}
      <span className="copy-contact-text">{children ?? value}</span>
    </>
  );

  return (
    <div className={className ? `copy-contact ${className}` : "copy-contact"}>
      {href ? (
        <a className="copy-contact-link" href={href}>
          {content}
        </a>
      ) : (
        <span className="copy-contact-link copy-contact-static">
          {content}
        </span>
      )}

      <button
        aria-label={`Copy ${value}`}
        className={copied ? "copy-contact-button is-copied" : "copy-contact-button"}
        onClick={handleCopy}
        type="button"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}
