import { motion } from "framer-motion";

export type GreetingProps = {
  className?: string;
};

export const Greeting = ({ className }: GreetingProps) => {
  return (
    <div
      className={[
        "mx-auto flex w-full max-w-3xl flex-col justify-center px-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-md text-muted-foreground"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
      >
        Hi There!
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-4xl tracking-tight"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
      >
        Where should we start?
      </motion.div>
    </div>
  );
};
