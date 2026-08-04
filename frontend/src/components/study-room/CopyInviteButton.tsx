import { useEffect, useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { buildInviteUrl } from "@/lib/api/study-rooms";

interface CopyInviteButtonProps {
  inviteCode: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
}

export function CopyInviteButton({
  inviteCode,
  size = "sm",
  variant = "outline",
}: CopyInviteButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    const url = buildInviteUrl(inviteCode);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard access can be denied; a prompt still lets them copy manually.
      window.prompt("Copy this invite link:", url);
    }
  };

  return (
    <Button type="button" variant={variant} size={size} onClick={handleCopy}>
      {copied ? "Link copied" : "Copy invite link"}
    </Button>
  );
}
