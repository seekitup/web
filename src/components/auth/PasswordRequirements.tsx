import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { usePasswordRequirements } from "@/hooks/usePasswordRequirements";

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export function PasswordRequirements({
  password,
  className,
}: PasswordRequirementsProps) {
  const requirements = usePasswordRequirements(password);

  return (
    <ul className={clsx("flex flex-col gap-2", className)}>
      {requirements.map((req) => (
        <li key={req.id} className="flex items-center gap-2.5">
          <span
            className={clsx(
              "relative flex h-[18px] w-[18px] items-center justify-center rounded-full border transition-colors duration-200",
              req.isMet
                ? "border-primary bg-primary"
                : "border-neutral-600 bg-transparent",
            )}
            aria-hidden
          >
            <AnimatePresence>
              {req.isMet ? (
                <motion.svg
                  key="check"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  width="11"
                  height="11"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 6.5L4.5 9L10 3"
                    stroke="#0a0a0a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              ) : null}
            </AnimatePresence>
          </span>
          <span
            className={clsx(
              "text-sm leading-snug transition-colors duration-200",
              req.isMet ? "text-primary" : "text-text-dim",
            )}
          >
            {req.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
