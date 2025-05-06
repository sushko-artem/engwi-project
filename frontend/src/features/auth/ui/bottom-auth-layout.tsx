export function BottomAuthLayout({
  google,
  link,
}: {
  google: React.ReactNode;
  link: React.ReactNode;
}) {
  return (
    <section className="flex flex-col w-full">
      {google}
      {link}
    </section>
  );
}
