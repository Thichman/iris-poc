export default async function Layout({
  children,
}) {
  return (
    <div className="w-full flex flex-col gap-12 items-center align-middle">{children}</div>
  );
}
