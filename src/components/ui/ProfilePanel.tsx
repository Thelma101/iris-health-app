import Image from "next/image";

type Props = {
  readonly name: string;
  readonly address: string;
  readonly role: string;
  readonly email: string;
  readonly onChangePassword?: () => void;
};

export default function ProfilePanel({ name, address, role, email, onChangePassword }: Props) {
  return (
    <section className="bg-white rounded-tl-[20px] rounded-bl-[20px] border border-zinc-300">
      <div className="w-full h-[50px] relative rounded-lg bg-[linear-gradient(108.72deg,_#fff9e6,_#e8f1ff)] border-[#FDF5E6] border-solid border-[2px] box-border overflow-hidden shrink-0 text-left text-xl text-[#2F4F4F] font-poppins flex items-center px-4 sm:px-[19px] mx-auto mt-6 max-w-[calc(100%-48px)]">
        <span className="uppercase font-semibold text-base sm:text-xl">Profile</span>
      </div>
      <div className="p-4 sm:p-8 flex flex-col items-center gap-6">
        <div className="w-full max-w-[663px] flex flex-col items-center gap-6">
          <div className="relative">
            <Image
              src="/icons/ellipse2.png"
              alt=""
              width={100}
              height={100}
              className="rounded-full object-cover size-[80px] sm:size-[100px]"
            />
            <button className="size-8 grid place-items-center bg-white rounded-[30px] border border-zinc-300 cursor-pointer absolute bottom-0 right-0 shadow-sm" aria-label="Change avatar">
              <Image src="/icons/camera-01.svg" alt="Upload" width={16} height={16} />
            </button>
          </div>
          <div className="w-full flex flex-col gap-8 sm:gap-11">
            <div className="w-full flex flex-col gap-4 sm:gap-6">
              <div className="flex flex-col gap-1.5">
                <div className="text-gray-500 text-xs sm:text-sm font-medium font-poppins">Name</div>
                <div className="h-12 bg-white rounded-sm border border-zinc-300 flex items-center px-4 sm:px-6">
                  <div className="text-gray-800 text-sm font-normal font-poppins truncate">{name}</div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-gray-500 text-xs sm:text-sm font-medium font-poppins">Address</div>
                <div className="h-12 bg-white rounded-sm border border-zinc-300 flex items-center px-4 sm:px-6">
                  <div className="text-gray-800 text-sm font-normal font-poppins truncate">{address}</div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-gray-500 text-xs sm:text-sm font-medium font-poppins">Role</div>
                <div className="h-12 bg-white rounded-sm border border-zinc-300 flex items-center px-4 sm:px-6">
                  <div className="text-gray-800 text-sm font-normal font-poppins">{role}</div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-gray-500 text-xs sm:text-sm font-medium font-poppins">Email</div>
                <div className="h-12 bg-white rounded-sm border border-zinc-300 flex items-center px-4 sm:px-6">
                  <div className="text-gray-800 text-sm font-normal font-poppins truncate">{email}</div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-gray-500 text-xs sm:text-sm font-medium font-poppins">Password</div>
                <div className="h-12 bg-white rounded-sm border border-zinc-300 flex items-center justify-between px-4 sm:px-6">
                  <div className="text-gray-800 text-sm font-normal font-poppins">**********************</div>
                  <button className="text-blue-500 text-sm font-normal font-poppins cursor-pointer" onClick={onChangePassword}>CHANGE PASSWORD</button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Image src="/icons/logout-square-01.svg" alt="Logout" width={20} height={20} />
              <button className="text-red-500 text-sm font-normal font-poppins cursor-pointer">logout</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}