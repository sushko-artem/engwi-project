import Image from "next/image";

export function GoogleAuth({ description }: { description: string }) {
  return (
    <button className="bg-amber-50 w-full rounded-[5px] border-1 p-2 flex hover:cursor-pointer">
      <Image
        className="w-[30px]"
        width={30}
        height={30}
        src="/google.svg"
        alt="google"
      />
      <span className="m-auto text-center">{description}</span>
    </button>
  );
}
