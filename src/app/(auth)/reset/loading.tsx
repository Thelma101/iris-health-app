import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-neutral-100/50 backdrop-blur-[6px] flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
