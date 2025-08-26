export default function getUserOS() {
  let Name;
  if (navigator.appVersion.indexOf("Win") != -1) Name = "Windows";
  else if (navigator.appVersion.indexOf("Mac") != -1) Name = "MacOS";
  else if (navigator.appVersion.indexOf("X11") != -1) Name = "UNIX";
  else if (navigator.appVersion.indexOf("Linux") != -1) Name = "Linux";
  return Name;
}
