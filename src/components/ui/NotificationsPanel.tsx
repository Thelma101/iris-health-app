import Image from 'next/image';

type Item = {
  readonly id: string;
  readonly text: string;
  readonly date: string;
  readonly unread: boolean;
};

const ITEMS: ReadonlyArray<Item> = [
  { id: "n1", text: "Your password has been successfully changed", date: "Jul 23, 2025 at 9:50 AM", unread: true },
  { id: "n2", text: "Your password has been successfully changed", date: "Jul 23, 2025 at 9:50 AM", unread: false },
  { id: "n3", text: "Your password has been successfully changed", date: "Jul 23, 2025 at 9:50 AM", unread: false },
  { id: "n4", text: "Your password has been successfully changed", date: "Jul 23, 2025 at 9:50 AM", unread: false },
  { id: "n5", text: "Your password has been successfully changed", date: "Jul 23, 2025 at 9:50 AM", unread: false },
  { id: "n6", text: "Your password has been successfully changed", date: "Jul 23, 2025 at 9:50 AM", unread: false },
  { id: "n7", text: "Your password has been successfully changed", date: "Jul 23, 2025 at 9:50 AM", unread: false },
  { id: "n8", text: "Your password has been successfully changed", date: "Jul 23, 2025 at 9:50 AM", unread: false },
  { id: "n9", text: "Your password has been successfully changed", date: "Jul 23, 2025 at 9:50 AM", unread: false },
  { id: "n10", text: "Your password has been successfully changed", date: "Jul 23, 2025 at 9:50 AM", unread: false },
  { id: "n11", text: "Your password has been successfully changed", date: "Jul 23, 2025 at 9:50 AM", unread: false },
  { id: "n12", text: "Your password has been successfully changed", date: "Jul 23, 2025 at 9:50 AM", unread: false },
];

export default function NotificationsPanel({ onClose }: { readonly onClose?: () => void }) {
  return (
    <section className="w-full max-w-[466px] bg-white rounded-[10px] border border-zinc-300 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="h-12 w-full bg-white border-b border-[#d9d9d9] flex items-center justify-between px-4 sm:px-6">
        <h2 className="text-gray-800 text-lg sm:text-xl font-medium font-poppins">Notifications</h2>
        <button aria-label="Close" onClick={onClose} className="size-6 grid place-items-center cursor-pointer hover:bg-gray-100 rounded-md transition-colors">
          <Image src="/icons/cancel-01.svg" width={24} height={24} alt="Close" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {ITEMS.map((it) => {
            return (
              <div key={it.id} className="flex items-start gap-2.5">
                {/* Indicator dot */}
                <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${it.unread ? 'bg-[#2C7BE5]' : 'bg-zinc-300'}`} />
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-xs sm:text-sm font-normal font-poppins leading-snug">{it.text}</p>
                  <p className="text-gray-500 text-xs font-normal font-poppins mt-1">{it.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
