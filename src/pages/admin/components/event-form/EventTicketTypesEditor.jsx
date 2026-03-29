import { Plus, Trash2, Ticket, Crown, Star } from "lucide-react";

const TICKET_PRESETS = [
  { name: "General Admission", icon: Ticket },
  { name: "VIP", icon: Crown },
  { name: "Day Pass", icon: Star },
];

function TicketTypeRow({ ticket, index, total, onChange, onRemove }) {
  const handleChange = (field, value) => {
    onChange(index, { ...ticket, [field]: value });
  };

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      {total > 1 ? (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
          aria-label="Remove ticket type"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Ticket Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={ticket.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g. VIP, Day Pass"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            What&apos;s Included
          </label>
          <input
            type="text"
            value={ticket.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="e.g. Front row, free drinks"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Price (₹) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={ticket.price}
            onChange={(e) => handleChange("price", e.target.value)}
            placeholder="e.g. 500"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Available Seats <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={ticket.maxQuantity}
            onChange={(e) => handleChange("maxQuantity", e.target.value)}
            placeholder="e.g. 100"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>
      </div>
    </div>
  );
}

export function EventTicketTypesEditor({ ticketTypes, onChange }) {
  const handleTicketChange = (index, updatedTicket) => {
    const updated = [...ticketTypes];
    updated[index] = updatedTicket;
    onChange(updated);
  };

  const handleRemove = (index) => {
    if (ticketTypes.length <= 1) return;
    onChange(ticketTypes.filter((_, i) => i !== index));
  };

  const handleAdd = (preset) => {
    onChange([
      ...ticketTypes,
      {
        id: crypto.randomUUID(),
        name: preset?.name || "",
        description: "",
        price: "",
        maxQuantity: "",
      },
    ]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        <Ticket className="h-3.5 w-3.5 text-primary/70" />
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          Ticket Types <span className="text-red-400">*</span>
        </span>
      </div>
      <p className="text-[10px] text-slate-400">
        Define different ticket categories with pricing and capacity for each.
      </p>

      <div className="flex flex-col gap-3">
        {ticketTypes.map((ticket, index) => (
          <TicketTypeRow
            key={ticket.id}
            ticket={ticket}
            index={index}
            total={ticketTypes.length}
            onChange={handleTicketChange}
            onRemove={handleRemove}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Quick add:</span>
        {TICKET_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handleAdd(preset)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
          >
            <preset.icon className="h-3 w-3" />
            {preset.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleAdd(null)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/10"
        >
          <Plus className="h-3 w-3" />
          Custom
        </button>
      </div>
    </div>
  );
}
