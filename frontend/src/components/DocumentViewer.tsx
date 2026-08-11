import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Download, ExternalLink, FileWarning } from "lucide-react";
import { isViewableMimeType, type FileViewUrlDto } from "@scholarbase/shared-types";
import { Button } from "@/components/ui/button";

interface DocumentViewerProps {
  doc: FileViewUrlDto | null;
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
  onDownload?: () => void;
}

/**
 * Modal preview for a stored file.
 *
 * The document is rendered in an iframe pointed at a presigned URL that the
 * backend requested with `Content-Disposition: inline`, so the browser displays
 * it instead of saving it. We never proxy the bytes — they go straight from
 * object storage to the browser, which keeps large PDFs off the API host.
 */
export function DocumentViewer({
  doc,
  isLoading = false,
  error = null,
  onClose,
  onDownload,
}: DocumentViewerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = isLoading || Boolean(error) || Boolean(doc);

  // Escape to close, and don't let the page behind scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const canPreview = doc ? isViewableMimeType(doc.mimeType) : false;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={doc ? `Preview of ${doc.fileName}` : "Document preview"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card-hover">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="truncate text-sm font-bold text-foreground" title={doc?.fileName}>
            {doc?.fileName ?? "Loading…"}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            {doc && (
              <Button asChild variant="outline" size="sm">
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Open in new tab</span>
                </a>
              </Button>
            )}
            {onDownload && (
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            )}
            <Button ref={closeRef} variant="ghost" size="sm" onClick={onClose} aria-label="Close preview">
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden bg-muted">
          {isLoading && (
            <div className="flex h-full items-center justify-center text-sm text-foreground-muted">
              Preparing preview…
            </div>
          )}

          {error && (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
              <FileWarning className="h-8 w-8 text-danger" aria-hidden="true" />
              <p className="text-sm font-medium text-danger">{error}</p>
            </div>
          )}

          {doc && !error && canPreview && (
            <iframe
              key={doc.url}
              src={doc.url}
              title={`Preview of ${doc.fileName}`}
              className="h-full w-full border-0 bg-white"
            />
          )}

          {doc && !error && !canPreview && (
            // Office docs and the like can't render in an iframe. Say so
            // plainly rather than showing an empty grey box.
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <FileWarning className="h-8 w-8 text-foreground-subtle" aria-hidden="true" />
              <p className="text-sm text-foreground-muted">
                This file type ({doc.mimeType}) can&apos;t be previewed in the browser.
              </p>
              {onDownload && (
                <Button size="sm" onClick={onDownload}>
                  Download instead
                </Button>
              )}
            </div>
          )}
        </div>

        <p className="shrink-0 border-t border-border px-4 py-2 text-xs text-foreground-muted">
          Preview link expires in about 30 minutes. If it stops loading, close and reopen.
        </p>
      </div>
    </div>,
    document.body,
  );
}
