import { Fragment } from "react";
import { PageItem, PageData } from "@/types";
import { LINK_PRESETS } from "@/lib/linkPresets";
import { AlertCircle, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";

interface EditPageLinkProps {
  item: PageItem;
  pageData: PageData;
  onLinkClick?: (itemId: string) => void;
  error?: string;
}

export default function EditPageLink({
  item,
  pageData,
  onLinkClick,
  error,
}: EditPageLinkProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition: dndTransition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: dndTransition,
  };

  const preset = LINK_PRESETS[item.presetId];
  if (!preset) return null;

  const Icon = preset.icon.classic;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLinkClick) {
      onLinkClick(item.id);
    }
  };

  const itemContent = (
    <motion.div 
      className={`pf-link relative ${error ? 'border border-red-500 rounded-lg' : ''}`}
      initial={item.isNew ? { opacity: 0, scale: 0.5 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        delay: 0.1,
        ease: "easeOut"
      }}
    >
      {error && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />
      )}
      <div className="pf-link__inner">
        <div className="pf-link__icon-container">
          <div className="pf-link__icon">
            <Icon className="pf-link__icon" aria-hidden="true" />
          </div>
        </div>
        <div className="pf-link__title">
          <span className="pf-link__title-text">
            {item.title || preset.title}
          </span>
        </div>
        <div className="pf-link__icon-container">
          {item.tokenGated && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="pf-link__icon-lock">
              <path
              fillRule="evenodd"
              d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z"
              clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-full text-left cursor-pointer group relative"
      onClick={handleClick}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-11 top-1/2 -translate-y-1/2 cursor-grab w-11 h-11 flex items-center justify-center rounded-lg hover:bg-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      {itemContent}
    </div>
  );
}

// Helper to format token amounts
function formatTokenAmount(amount: string): string {
  const num = parseInt(amount, 10);
  if (isNaN(num)) return amount;

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "m";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}
