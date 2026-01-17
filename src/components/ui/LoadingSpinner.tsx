import Image from 'next/image';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center" data-node-id="1:1240">
      <Image 
        src="/icons/loader-icon.svg" 
        alt="Loading" 
        width={64} 
        height={64} 
        className="animate-spin"
        priority
      />
    </div>
  );
}
