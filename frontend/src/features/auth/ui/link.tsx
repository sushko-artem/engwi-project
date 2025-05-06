import Link from "next/link";

export function AuthLink({
  text,
  url,
  linkText,
}: {
  text: string;
  url: string;
  linkText: string;
}) {
  return (
    <div className="flex justify-center mt-4 text-amber-50">
      <p className="mr-2.5">{text}</p>
      <Link className="underline" href={url}>
        {linkText}
      </Link>
    </div>
  );
}
