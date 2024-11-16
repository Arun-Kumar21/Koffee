import os from "os";

export const getLocalIPv4 = () => {
  let myLocalIp = "";
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    if (addresses) {
      for (const address of addresses) {
        if (address.family === "IPv4" && !address.internal) {
          myLocalIp = address.address;
        }
      }
    }
  }
  return myLocalIp;
};

