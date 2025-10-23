import { useState, useEffect } from "react";
import { getVersion } from "@tauri-apps/api/app";

export const useVersion = () => {
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  return version;
};
