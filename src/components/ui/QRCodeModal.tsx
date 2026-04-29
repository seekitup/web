import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import { Modal } from "./Modal";
import { shareUrl } from "@/lib/share";
import { getApiErrorMessage } from "@/lib/apiError";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  /** Pass-through when opened on top of another modal. */
  stacked?: boolean;
}

const QR_SIZE = 220;
const LOGO_SIZE = 50;

export function QRCodeModal({
  isOpen,
  onClose,
  url,
  title,
  stacked,
}: QRCodeModalProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleShareQR = useCallback(async () => {
    setIsSharing(true);
    try {
      const canvas = canvasRef.current;
      if (canvas) {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );
        if (blob && typeof navigator.share === "function") {
          const file = new File([blob], "qr.png", { type: "image/png" });
          if (navigator.canShare?.({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: title ?? "",
                url,
              });
              return;
            } catch (err) {
              const e = err as { name?: string };
              if (e?.name === "AbortError") return;
            }
          }
        }
      }
      await shareUrl(url, title);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("qrModal.shareError")));
    } finally {
      setIsSharing(false);
    }
  }, [t, title, url]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="dialog"
      showClose
      stacked={stacked ?? false}
      dismissOnBackdrop={!isSharing}
      dismissOnEscape={!isSharing}
      className="!max-w-[360px]"
    >
      <div className="flex flex-col items-center px-6 pt-1 pb-6">
        {title ? (
          <h2 className="text-[17px] font-semibold text-text text-center mb-5 line-clamp-2">
            {title}
          </h2>
        ) : null}

        <div className="rounded-2xl bg-white p-4">
          <QRCodeCanvas
            ref={canvasRef}
            value={url || " "}
            size={QR_SIZE}
            level="M"
            bgColor="#ffffff"
            fgColor="#000000"
            marginSize={0}
            imageSettings={{
              src: "/logo-square.png",
              height: LOGO_SIZE,
              width: LOGO_SIZE,
              excavate: true,
            }}
          />
        </div>

        <p className="mt-4 text-[12px] leading-tight text-text-dim text-center break-all line-clamp-2 px-2">
          {url}
        </p>

        <button
          type="button"
          onClick={() => void handleShareQR()}
          disabled={isSharing}
          className="mt-5 w-full px-4 py-2.5 rounded-full text-sm font-semibold bg-primary text-background hover:brightness-110 transition disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2"
        >
          {isSharing ? (
            <span
              aria-hidden
              className="h-4 w-4 rounded-full border-2 border-background/30 border-t-background animate-spin"
            />
          ) : null}
          {t("qrModal.share")}
        </button>
      </div>
    </Modal>
  );
}
