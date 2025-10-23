import { useVersion } from "../hooks/useVersion";

export const Footer = () => {
  const version = useVersion();

  return (
    <footer className="text-center py-4">
      <p className="text-sm text-gray-600">
        Version {version || "loading..."}
      </p>
    </footer>
  );
};
