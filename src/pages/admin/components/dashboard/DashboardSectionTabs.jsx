import { motion } from "framer-motion";

export function DashboardSectionTabs({ activeSection, onSectionChange, sectionConfig }) {
  return (
    <nav className="surface-card mb-6 flex items-center gap-2 overflow-x-auto p-2">
      {sectionConfig.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.key;

        return (
          <button
            key={section.key}
            type="button"
            onClick={() => onSectionChange(section.key)}
            className={`focus-polish relative inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${isActive ? "text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            {isActive ? (
              <motion.div
                layoutId="admin-tab-indicator"
                className="absolute inset-0 rounded-xl bg-primary shadow-sm"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            ) : null}
            <Icon className="h-4 w-4" />
            {section.label}
          </button>
        );
      })}
    </nav>
  );
}
